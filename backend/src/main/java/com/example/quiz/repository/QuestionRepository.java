package com.example.quiz.repository;

import com.example.quiz.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface QuestionRepository extends MongoRepository<Question,String> {
    List<Question> findByIdIn(List<String> ids);
    
    long countByIdIn(List<String> ids);
    // Paginated methods
    // Page<Question> findByCategory(String category, Pageable pageable);
    // Page<Question> findByDifficulty(String difficulty, Pageable pageable);
    // Page<Question> findByCategoryAndDifficulty(String category, String difficulty, Pageable pageable);
    
}
