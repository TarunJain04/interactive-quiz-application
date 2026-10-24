package com.example.quiz.service;

import com.example.quiz.dto.*;
import com.example.quiz.exception.InvalidAnswerException;
import com.example.quiz.exception.QuestionNotFoundException;
import com.example.quiz.exception.QuizAlreadySubmittedException;
import com.example.quiz.exception.QuizNotFoundException;
import com.example.quiz.mapper.QuestionMapper;
import com.example.quiz.model.*;
import com.example.quiz.repository.QuestionRepository;
import com.example.quiz.repository.QuizRepository;
import com.example.quiz.util.Slugifier;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {
    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;
    private final MongoTemplate mongoTemplate;
    private final QuizRepository quizRepository;

    public QuizService(QuestionRepository questionRepository, QuestionMapper questionMapper,
                       MongoTemplate mongoTemplate,
                       QuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.questionMapper = questionMapper;
        this.mongoTemplate = mongoTemplate;
        this.quizRepository = quizRepository;
    }

    public QuestionResponse getQuestionById(String id) {
        return questionMapper.toQuestionResponse(
                questionRepository.findById(id)
                        .orElseThrow(() -> new QuestionNotFoundException(
                                 id)));
    }

    public Page<QuestionResponse> getQuestions(String category, QuestionType type, Difficulty difficulty,
                                               Pageable pageable) {
        Query query = new Query();
        String categorySlug = Slugifier.slugify(category);
        if (StringUtils.hasText(categorySlug))
            query.addCriteria(Criteria.where("categorySlug").is(categorySlug));
        if (type != null)
            query.addCriteria(
                    Criteria.where("type")
                            .is(type));
        if (difficulty != null)
            query.addCriteria(
                    Criteria.where("difficulty")
                            .is(difficulty));

        long total = mongoTemplate.count(query, Question.class);
        query.with(pageable);
        List<QuestionResponse> content = questionMapper.toQuestionResponseList(
                mongoTemplate.find(query, Question.class));

        return new PageImpl<>(content, pageable, total);
    }

    // public java.util.List<QuestionResponse> sampleQuestions(String category,
    // QuestionType type, Difficulty difficulty, int size) {
    // String categorySlug = Slugifier.slugify(category);
    //
    // Criteria criteria = null;
    // if (StringUtils.hasText(categorySlug)) {
    // criteria = Criteria.where("categorySlug").is(categorySlug);
    // }
    // if (type != null) {
    // criteria = (criteria == null) ? Criteria.where("type").is(type) :
    // criteria.and("type").is(type);
    // }
    // if (difficulty != null) {
    // criteria = (criteria == null) ? Criteria.where("difficulty").is(difficulty) :
    // criteria.and("difficulty").is(difficulty);
    // }
    //
    // Aggregation agg;
    // if (criteria != null) {
    // agg = Aggregation.newAggregation(Aggregation.match(criteria),
    // Aggregation.sample(size));
    // } else {
    // agg = Aggregation.newAggregation(Aggregation.sample(size));
    // }
    //
    // List<Question> questions = mongoTemplate.aggregate(agg, "questions",
    // Question.class).getMappedResults();
    // return questionMapper.toQuestionResponseList(questions);
    // }
    public List<QuestionResponse> sampleQuestions(List<String> categories, List<QuestionType> types,
                                                  List<Difficulty> difficulties, int size) {
        List<String> categorySlugs = categories == null ? null
                : categories.stream().map(Slugifier::slugify)
                .filter(StringUtils::hasText).toList();
        List<Criteria> filters = new ArrayList<>();
        if (categorySlugs != null && !categorySlugs.isEmpty())
            filters.add(Criteria.where("categorySlug").in(categorySlugs));
        if (types != null && !types.isEmpty())
            filters.add(Criteria.where("type").in(types));
        if (difficulties != null && !difficulties.isEmpty())
            filters.add(Criteria.where("difficulty").in(difficulties));

        List<AggregationOperation> stages = new ArrayList<>();
        if (!filters.isEmpty()) {
            stages.add(Aggregation.match(new Criteria().andOperator(filters.toArray(new Criteria[0]))));
        }
        stages.add(Aggregation.sample(size));

        Aggregation agg = Aggregation.newAggregation(stages);
        List<Question> questions = mongoTemplate.aggregate(agg, "questions", Question.class).getMappedResults();
        return questionMapper.toQuestionResponseList(questions);
    }

    public Filters getFilters() {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.group("categoryName", "categorySlug"),
                Aggregation.project()
                        .and("_id.categoryName").as("name")
                        .and("_id.categorySlug").as("slug"));

        List<Category> categories = mongoTemplate
                .aggregate(agg, "questions", Category.class)
                .getMappedResults()
                .stream()
                .sorted(Comparator.comparing(Category::name))
                .toList();

        return new Filters(categories, List.of(Difficulty.values()), List.of(QuestionType.values()),
                List.of(Source.values()));
    }

    public Facets getFacets() {
        long total = mongoTemplate.count(new Query(), Question.class);
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.facet(
                                Aggregation.group("categoryName").count().as("count"),
                                Aggregation.sort(Sort.Direction.ASC, "_id")).as("byCategory")
                        .and(
                                Aggregation.group("type").count().as("count"))
                        .as("byType")
                        .and(
                                Aggregation.group("difficulty").count().as("count"))
                        .as("byDifficulty")
                        .and(
                                Aggregation.group("source").count().as("count"))
                        .as("bySource"));
        Document result = mongoTemplate.aggregate(agg, "questions", Document.class)
                .getUniqueMappedResult();
        if (result == null) {
            return new Facets(Map.of(), Map.of(), Map.of(), Map.of(), total);
        }
        Map<String, Long> byCategory = result.getList("byCategory", Document.class).stream()
                .collect(Collectors.toMap(
                        d -> d.getString("_id"),
                        d -> d.get("count", Number.class).longValue()));
        Map<QuestionType, Long> byType = result.getList("byType", Document.class).stream()
                .collect(Collectors.toMap(
                        d -> QuestionType.valueOf(d.getString("_id")),
                        d -> d.get("count", Number.class).longValue()));
        Map<Difficulty, Long> byDifficulty = result.getList("byDifficulty", Document.class).stream()
                .collect(Collectors.toMap(
                        d -> Difficulty.valueOf(d.getString("_id")),
                        d -> d.get("count", Number.class).longValue()));
        Map<Source, Long> bySource = result.getList("bySource", Document.class).stream()
                .collect(Collectors.toMap(
                        d -> Source.valueOf(d.getString("_id")),
                        d -> d.get("count", Number.class).longValue()));
        return new Facets(byCategory, byDifficulty, byType, bySource, total);
    }

    public CountResponse countByFilters(List<String> categories, List<Difficulty> difficulties,
                                        List<QuestionType> types, List<Source> sources) {
        Query query = new Query();
        List<String> categorySlugs = categories == null ? null
                : categories.stream().map(Slugifier::slugify)
                .filter(StringUtils::hasText).toList();
        List<Criteria> filters = new ArrayList<>();
        if (categorySlugs != null && !categorySlugs.isEmpty())
            filters.add(Criteria.where("categorySlug").in(categorySlugs));
        if (types != null && !types.isEmpty())
            filters.add(Criteria.where("type").in(types));
        if (difficulties != null && !difficulties.isEmpty())
            filters.add(Criteria.where("difficulty").in(difficulties));
        if (sources != null && !sources.isEmpty())
            filters.add(Criteria.where("source").in(sources));

        if (!filters.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(filters.toArray(new Criteria[0])));
        }

        return new CountResponse(mongoTemplate.count(query, Question.class));
    }

    public SampleQuiz getQuiz(List<String> category, List<QuestionType> types, List<Difficulty> difficulties,
                              int size) {
        List<QuestionResponse> questions = sampleQuestions(category, types, difficulties, size);
        String quizId = UUID.randomUUID().toString();
        quizRepository.save(
                new Quiz(quizId, questions.stream().map(QuestionResponse::id).toList(), false, 0,
                        questions.size(), 0, Instant.now()));
        return new SampleQuiz(quizId, questions);
    }

    public QuizResult getQuizResult(String quizId, QuizSubmission quizSubmission) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(
                () -> new QuizNotFoundException("No quiz exists with id " + quizId));
        if (quiz.submitted())
            throw new QuizAlreadySubmittedException("Quiz already submitted");

        List<Question> quizQuestions = questionRepository.findByIdIn(quiz.questionIds());
        if (quizQuestions.size() != quiz.questionIds().size())
            throw new QuestionNotFoundException("Some questions in the quiz are missing");

        Map<String, QuizSubmission.Submission> uniqueSubmissions = quizSubmission.submissions().stream()
                .collect(Collectors.toMap(
                        QuizSubmission.Submission::questionId,
                        s -> s,
                        (first, duplicate) -> first));
        List<QuizResult.QuestionResult> answers = quizQuestions.stream()
                .map(q -> new QuizResult.QuestionResult(q.id(), q.answerIndex())).toList();
        Map<String, Question> questionMap = quizQuestions.stream()
                .collect(Collectors.toMap(Question::id, q -> q));

        int score = 0;
        for (QuizSubmission.Submission submission : uniqueSubmissions.values()) {
            Question question = questionMap.get(submission.questionId());

            if (question == null) {
                throw new QuestionNotFoundException(
                        "No question exists in the quiz with questionId "
                                + submission.questionId());
            }

            if (submission.selectedIndex() < 0 || submission.selectedIndex() >= question.choices().size()) {
                throw new InvalidAnswerException(
                        "Invalid answer index for question " + submission.questionId());
            }

            if (submission.selectedIndex() == question.answerIndex()) {
                score++;
            }
        }
        Query query = new Query(Criteria.where("_id").is(quizId));
        Update update = new Update().set("submitted", true)
                .set("score", score).set("attempted", uniqueSubmissions.size());
        mongoTemplate.updateFirst(query, update, Quiz.class);
        return new QuizResult(answers, score, uniqueSubmissions.size(), quiz.total());
    }
    // public List<Category> getCategories() {
    // Aggregation.group("categoryName", "categorySlug")
    // Aggregation.project()
    // .and("_id.categoryName").as("name")
    // .and("_id.categorySlug").as("slug")
    // Aggregation agg = Aggregation.newAggregation(
    // Aggregation.group("categoryName", "categorySlug")
    // );
    //
    // List<Document> results = mongoTemplate.aggregate(agg, "questions",
    // Document.class)
    // .getMappedResults();
    //
    // return results.stream()
    // .map(d -> {
    // Document id = (Document) d.get("_id");
    // return new Category(id.getString("categoryName"),
    // id.getString("categorySlug"));
    // })
    // .sorted(Comparator.comparing(Category::name))
    // .toList();
    // }
}
