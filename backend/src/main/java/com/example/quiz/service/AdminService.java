package com.example.quiz.service;

import com.example.quiz.dto.*;
import com.example.quiz.exception.InvalidFilterException;
import com.example.quiz.exception.QuestionNotFoundException;
import com.example.quiz.loader.OpenTDBLoader;
import com.example.quiz.loader.QuizApiLoader;
import com.example.quiz.loader.TriviaApiLoader;
import com.example.quiz.mapper.QuestionMapper;
import com.example.quiz.model.*;
import com.example.quiz.repository.QuestionRepository;
import com.example.quiz.util.Slugifier;
import com.mongodb.bulk.BulkWriteResult;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.FindAndReplaceOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;
    private final MongoTemplate mongoTemplate;
    private final OpenTDBLoader openTDBLoader;
    private final QuizApiLoader quizApiLoader;
    private final TriviaApiLoader triviaApiLoader;

    public AdminService(QuestionRepository questionRepository, QuestionMapper questionMapper, MongoTemplate mongoTemplate,
                        OpenTDBLoader openTDBLoader, QuizApiLoader quizApiLoader, TriviaApiLoader triviaApiLoader) {
        this.questionRepository = questionRepository;
        this.questionMapper = questionMapper;
        this.mongoTemplate = mongoTemplate;
        this.openTDBLoader = openTDBLoader;
        this.quizApiLoader = quizApiLoader;
        this.triviaApiLoader = triviaApiLoader;
    }

    public Question addQuestion(QuestionRequest questionRequest) {
        return questionRepository.save(questionMapper.toQuestion(questionRequest));
    }

    public List<Question> addManyQuestions(List<QuestionRequest> questions) {
        return questionRepository.saveAll(questionMapper.toQuestionList(questions));
    }

    public ApiResults addFromOpenTrivia(int amount, Integer category, String type, String difficulty, boolean verbose) {
        List<Question> questions = openTDBLoader.fetchQuestions(amount, category, type, difficulty);
        List<Question> insertedQuestions = bulkSave(questions);
        return new ApiResults(amount, questions.size(), insertedQuestions.size(), verbose ? insertedQuestions : List.of());
    }

    public ApiResults addFromQuizApi(int limit, int offset, String category, String type, String difficulty, boolean verbose) {
        List<Question> questions = quizApiLoader.fetchQuestions(limit, offset, category, type, difficulty);
        List<Question> insertedQuestions = bulkSave(questions);
        return new ApiResults(limit, questions.size(), insertedQuestions.size(), verbose ? insertedQuestions : List.of());
    }

    public ApiResults addFromTriviaApi(int limit, String category, String difficulty, boolean verbose) {
        List<Question> questions = triviaApiLoader.fetchQuestions(limit, category, difficulty);
        List<Question> insertedQuestions = bulkSave(questions);
        return new ApiResults(limit, questions.size(), insertedQuestions.size(), verbose ? insertedQuestions : List.of());
    }

    private List<Question> bulkSave(List<Question> questions) {
        if (questions == null || questions.isEmpty()) return List.of();
        BulkOperations bulkOps = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, Question.class);

        questions.forEach(q -> bulkOps.replaceOne(
                new Query(Criteria.where("_id").is(q.id())), q,
                FindAndReplaceOptions.options().upsert()));

        BulkWriteResult result = bulkOps.execute();
        return result.getUpserts().stream().map(u -> questions.get(u.getIndex())).toList();
    }

    // private List<Question> bulkSave(List<Question> questions) {
    //     BulkOperations bulkOps = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, Question.class);
    //     for (Question question : questions) {
    //         Document doc = new Document();
    //         mongoTemplate.getConverter().write(question, doc);
    //         Update update = Update.fromDocument(doc, "_id");
    //         Query query = Query.query(Criteria.where("_id").is(question.id()));
    //         bulkOps.upsert(query, update);
    //     }
    //     BulkWriteResult result = bulkOps.execute();
    //     return result.getUpserts().stream().map(u->questions.get(u.getIndex())).toList();
    // }

    public void deleteQuestionById(String id) {
        if (!questionRepository.existsById(id)) {
            throw new QuestionNotFoundException( id);
        }
        questionRepository.deleteById(id);
    }

    public CountResponse deleteByFilters(String category, Difficulty difficulty, QuestionType type, Source source) {
        Query query = new Query();
        String categorySlug = Slugifier.slugify(category);
        if (StringUtils.hasText(categorySlug)) query.addCriteria(Criteria.where("categorySlug").is(categorySlug));
        if (difficulty != null) query.addCriteria(Criteria.where("difficulty").is(difficulty));
        if (type != null) query.addCriteria(Criteria.where("type").is(type));
        if (source != null) query.addCriteria(Criteria.where("source").is(source));
        if (query.getQueryObject().isEmpty()) {
            throw new InvalidFilterException("At least one filter required");
        }
        DeleteResult result = mongoTemplate.remove(query, Question.class);
        return new CountResponse(result.getDeletedCount());
    }

    public Map<String, Long> bulkUpdate(String category, Difficulty difficulty, QuestionType type, Source source, QuestionPatch patch) {
        String categorySlug = Slugifier.slugify(category);
        Query query = new Query();
        if (StringUtils.hasText(categorySlug)) query.addCriteria(Criteria.where("categorySlug").is(categorySlug));
        if (difficulty != null) query.addCriteria(Criteria.where("difficulty").is(difficulty));
        if (type != null) query.addCriteria(Criteria.where("type").is(type));
        if (source != null) query.addCriteria(Criteria.where("source").is(source));

        if (query.getQueryObject().isEmpty()) {
            throw new InvalidFilterException("At least one filter required");
        }

        Update update = new Update();
        if (patch.difficulty() != null) update.set("difficulty", patch.difficulty());
        if (patch.category() != null) {
            update.set("categoryName", patch.category());
            update.set("categorySlug", Slugifier.slugify(patch.category()));
        }
        if (patch.type() != null) update.set("type", patch.type());
        if (patch.source() != null) update.set("source", patch.source());

        if (update.getUpdateObject().isEmpty()) {
            return Map.of("matched", 0L, "modified", 0L);
        }

        UpdateResult result = mongoTemplate.updateMulti(query, update, Question.class);
        return Map.of(
                "matched", result.getMatchedCount(),
                "modified", result.getModifiedCount()
        );
    }
}
