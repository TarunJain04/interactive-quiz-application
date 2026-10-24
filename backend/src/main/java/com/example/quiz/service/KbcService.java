package com.example.quiz.service;

import com.example.quiz.dto.*;
import com.example.quiz.exception.*;
import com.example.quiz.model.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class KbcService {
    private static final long[] PRIZES = {1_000, 2_000, 3_000, 5_000, 10_000, 20_000, 40_000, 80_000,
            160_000, 320_000, 640_000, 1_250_000, 2_500_000, 5_000_000, 10_000_000};
    private static final int LEVELS = 15, CHECKPOINT1 = 5, CHECKPOINT2 = 10;
    private static final List<PrizeLevel> PRIZE_LADDER = java.util.stream.IntStream.range(0, PRIZES.length)
            .mapToObj(i -> new PrizeLevel(i + 1, PRIZES[i], i + 1 == CHECKPOINT1 || i + 1 == CHECKPOINT2))
            .toList();
    private static final Duration GRACE = Duration.ofMillis(1500);
    private static final Duration LIFELINE_BONUS = Duration.ofSeconds(15);
    private static final Duration ANSWER_REVEAL = Duration.ofSeconds(2);
    private static final Duration PLAYER_BREAK = Duration.ofSeconds(10);

    private final MongoTemplate mongo;
    private final Random random = new Random();

    public KbcService(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    public GameState start() {
        KbcGame g = new KbcGame();
        g.status = KbcStatus.IN_PROGRESS;
        g.currentLevel = 1;
        serve(g);
        mongo.save(g);
        return state(g);
    }

    public GameState get(String id) {
        KbcGame g = load(id);
        repairMissingDeadline(g);
        if (g.status == KbcStatus.IN_PROGRESS && Instant.now().isAfter(g.questionDeadline.plus(GRACE))) {
            finish(g, KbcStatus.TIMED_OUT, lostPrize(g.currentLevel));
        }
        return state(g);
    }

    public AnswerResult answer(String id, AnswerRequest req) {
        KbcGame g = load(id);
        requireActive(g);
        g.lastActivityAt = Instant.now();
        if (!g.currentQuestionId.equals(req.questionId()))
            throw new CurrentQuestionMismatchException();

        Question q = mongo.findById(g.currentQuestionId, Question.class);
        if (q == null) {
            throw new QuestionNotFoundException(g.currentQuestionId);
        }
        if (Instant.now().isAfter(g.questionDeadline.plus(GRACE))) {
            finish(g, KbcStatus.TIMED_OUT, lostPrize(g.currentLevel));
            return new AnswerResult(false , q.answerIndex(), g.status, g.prizeWon, null);
        }
        if (req.selectedIndex() != q.answerIndex()) {
            finish(g, KbcStatus.LOST, lostPrize(g.currentLevel));
            return new AnswerResult(false, q.answerIndex(), g.status, g.prizeWon, null);
        }
        g.prizeWon = PRIZES[g.currentLevel - 1];
        if (g.currentLevel == LEVELS) {
            g.status = KbcStatus.WON;
            mongo.save(g);
            return new AnswerResult(true, q.answerIndex(), g.status, g.prizeWon, null);
        }
        g.currentLevel++;
        serve(g);
        g.questionDeadline = g.questionDeadline.plus(ANSWER_REVEAL).plus(PLAYER_BREAK);
        mongo.save(g);
        return new AnswerResult(true, q.answerIndex(), g.status, g.prizeWon, state(g));
    }

    public PracticeAnswerResult practiceAnswer(String id, AnswerRequest req) {
        KbcGame g = load(id);
        boolean practiceAllowed = g.status == KbcStatus.IN_PROGRESS
                ? g.flippedQuestionIds != null && g.flippedQuestionIds.contains(req.questionId())
                : (g.status == KbcStatus.QUIT || g.status == KbcStatus.TIMED_OUT)
                        && g.usedQuestionIds.contains(req.questionId());
        if (!practiceAllowed)
            throw new InvalidAnswerException("Question is not available for this game");

        Question q = mongo.findById(req.questionId(), Question.class);
        if (q == null) {
            throw new QuestionNotFoundException(req.questionId());
        }
        return new PracticeAnswerResult(req.selectedIndex() == q.answerIndex(), q.answerIndex());
    }

    public LifelineResult lifeline(String id, Lifeline type) {
        KbcGame g = load(id);
        requireActive(g);
        g.lastActivityAt = Instant.now();
        if (Instant.now().isAfter(g.questionDeadline.plus(GRACE))) {
            finish(g, KbcStatus.TIMED_OUT, lostPrize(g.currentLevel));
            throw new GameTimedOutException();
        }
        if (!g.lifelinesUsed.add(type))
            throw new LifelineAlreadyUsedException();

        Question q = mongo.findById(g.currentQuestionId, Question.class);
        if (q == null) {
            throw new QuestionNotFoundException(g.currentQuestionId);
        }
        List<Integer> hidden = null, pct = null;
        Integer suggested = null, conf = null;

        switch (type) {
            case FIFTY_FIFTY -> {
                List<Integer> wrong = new ArrayList<>();
                for (int i = 0; i < q.choices().size(); i++) if (i != q.answerIndex()) wrong.add(i);
                Collections.shuffle(wrong, random);
                g.hiddenIndices = new ArrayList<>(wrong.subList(0, 2));
                hidden = g.hiddenIndices;
            }
            case AUDIENCE_POLL -> pct = poll(g, q);
            case PHONE_FRIEND -> {
                conf = Math.max(30, 90 - g.currentLevel * 4);
                suggested = random.nextInt(100) < conf ? q.answerIndex() : randomVisibleWrong(g, q);
            }
            case FLIP -> {
                if (g.flippedQuestionIds == null) g.flippedQuestionIds = new ArrayList<>();
                g.flippedQuestionIds.add(g.currentQuestionId);
                serve(g, g.questionDifficulty);
            }
        }

        if (type != Lifeline.FLIP)
            g.questionDeadline = g.questionDeadline.plus(LIFELINE_BONUS);

        mongo.save(g);
        return new LifelineResult(type, hidden, pct, suggested, conf, state(g));
    }

    public GameState quit(String id) {
        KbcGame g = load(id);
        requireActive(g);
        if (Instant.now().isAfter(g.questionDeadline.plus(GRACE))) {
            finish(g, KbcStatus.TIMED_OUT, lostPrize(g.currentLevel));
            return state(g);
        }
        finish(g, KbcStatus.QUIT, g.currentLevel > 1 ? PRIZES[g.currentLevel - 2] : 0);
        return state(g);
    }

    // ---------- helpers ----------

    private void serve(KbcGame g) {
        serve(g, difficulty(g.currentLevel));
    }

    private void serve(KbcGame g, Difficulty questionDifficulty) {
        Query query = new Query(Criteria.where("type").is(QuestionType.MULTIPLE)
                .and("difficulty").is(questionDifficulty)
                .and("choices").size(4));
        if (!g.usedQuestionIds.isEmpty())
            query.addCriteria(Criteria.where("id").nin(g.usedQuestionIds));
        long n = mongo.count(query, Question.class);
        if (n == 0) throw new QuestionsUnavailableException();
        Question q = mongo.findOne(query.skip(random.nextInt((int) n)).limit(1), Question.class);
        if (q == null) {
            throw new IllegalStateException("Question count was positive, but no question was found");
        }
        g.currentQuestionId = q.id();
        g.questionDifficulty = questionDifficulty;
        g.usedQuestionIds.add(q.id());
        g.hiddenIndices = new ArrayList<>();
        g.questionDeadline = Instant.now().plusSeconds(timeLimit(g.currentLevel));
    }

    private GameState state(KbcGame g) {
        QuestionView view = null;
        if (g.status == KbcStatus.IN_PROGRESS) {
            Question q = mongo.findById(g.currentQuestionId, Question.class);
            if (q == null) {
                throw new QuestionNotFoundException(g.currentQuestionId);
            }
            view = new QuestionView(q.id(), q.question(), q.choices());
        }
        Set<Lifeline> available = EnumSet.allOf(Lifeline.class);
        available.removeAll(g.lifelinesUsed);

        return new GameState(
                g.id,
                g.status,
                g.currentLevel,
                g.prizeWon,
                PRIZES[g.currentLevel - 1],
                lostPrize(g.currentLevel),
                view,
                g.status == KbcStatus.IN_PROGRESS ? g.questionDeadline : null,
                Instant.now(),
                available,
                g.hiddenIndices,
                PRIZE_LADDER
        );
    }

    private List<Integer> poll(KbcGame g, Question q) {
        int n = q.choices().size();
        int correct = q.answerIndex();

        // accuracy falls with level (86 -> 30), with noise; audience is surer after 50-50
        int base = 90 - g.currentLevel * 4 + random.nextInt(21) - 10;
        if (!g.hiddenIndices.isEmpty()) base += 15;
        int correctPct = Math.max(15, Math.min(95, base));

        List<Integer> wrong = new ArrayList<>();
        for (int i = 0; i < n; i++)
            if (i != correct && !g.hiddenIndices.contains(i)) wrong.add(i);

        int[] pct = new int[n];
        pct[correct] = correctPct;

        int remaining = 100 - correctPct;
        double[] w = new double[wrong.size()];
        double sum = 0;
        for (int k = 0; k < w.length; k++) {
            w[k] = 0.2 + random.nextDouble();
            sum += w[k];
        }

        int given = 0, biggest = 0;
        for (int k = 0; k < w.length; k++) {
            int share = (int) (remaining * w[k] / sum);
            pct[wrong.get(k)] = share;
            given += share;
            if (w[k] > w[biggest]) biggest = k;
        }
        pct[wrong.get(biggest)] += remaining - given;   // rounding leftover

        return Arrays.stream(pct).boxed().toList();
    }

    private int randomVisibleWrong(KbcGame g, Question q) {
        List<Integer> opts = new ArrayList<>();
        for (int i = 0; i < q.choices().size(); i++)
            if (i != q.answerIndex() && !g.hiddenIndices.contains(i)) opts.add(i);
        return opts.get(random.nextInt(opts.size()));
    }

    private void finish(KbcGame g, KbcStatus status, long prize) {
        g.status = status;
        g.prizeWon = prize;
        mongo.save(g);
    }

    private long lostPrize(int level) {
        if (level > CHECKPOINT2) return PRIZES[CHECKPOINT2 - 1];
        if (level > CHECKPOINT1) return PRIZES[CHECKPOINT1 - 1];
        return 0;
    }

    private Difficulty difficulty(int level) {
        return level <= CHECKPOINT1 ? Difficulty.EASY
                : level <= CHECKPOINT2 ? Difficulty.MEDIUM
                : random.nextBoolean() ? Difficulty.HARD : Difficulty.EXPERT;
    }

    private int timeLimit(int level) {
        return level <= CHECKPOINT1 ? 30 : level <= CHECKPOINT2 ? 45 : 60;
    }

    private KbcGame load(String id) {
        KbcGame g = mongo.findById(id, KbcGame.class);
        if (g == null) throw new GameNotFoundException(id);
        return g;
    }

    private void requireActive(KbcGame g) {
        if (g.status != KbcStatus.IN_PROGRESS)
            throw new GameAlreadyFinishedException();
        repairMissingDeadline(g);
    }

    private void repairMissingDeadline(KbcGame g) {
        if (g.status == KbcStatus.IN_PROGRESS && g.questionDeadline == null) {
            g.questionDeadline = Instant.now().plusSeconds(timeLimit(g.currentLevel));
            mongo.save(g);
        }
    }
}
