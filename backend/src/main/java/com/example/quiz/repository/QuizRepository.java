package com.example.quiz.repository;

import com.example.quiz.model.Question;
import com.example.quiz.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizRepository extends MongoRepository<Quiz,String> {
}
