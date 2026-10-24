package com.example.quiz.mapper;

import com.example.quiz.dto.QuestionRequest;
import com.example.quiz.dto.QuestionResponse;
import com.example.quiz.model.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionMapper {
    @Mapping(source = "category", target = "categoryName")
    @Mapping(target = "source", constant = "MANUAL")
    Question toQuestion(QuestionRequest questionRequest);

    QuestionResponse toQuestionResponse(Question question);

    List<QuestionResponse> toQuestionResponseList(List<Question> questions);

    List<Question> toQuestionList(List<QuestionRequest> questionRequests);
}
