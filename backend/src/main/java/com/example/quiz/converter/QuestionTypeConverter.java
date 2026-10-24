package com.example.quiz.converter;

import com.example.quiz.model.Difficulty;
import com.example.quiz.model.QuestionType;
import org.jspecify.annotations.NonNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Component
public class QuestionTypeConverter implements Converter<String, QuestionType> {
    public QuestionType convert(@NonNull String source) {
        if (!StringUtils.hasText(source)) return null;
        return QuestionType.valueOf(source.trim().toUpperCase(Locale.ROOT));
    }
}
