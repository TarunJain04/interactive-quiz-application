package com.example.quiz.converter;

import com.example.quiz.model.Difficulty;
import org.jspecify.annotations.NonNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Component
public class DifficultyConverter implements Converter<String, Difficulty> {
    public Difficulty convert(@NonNull String source) {
        if (!StringUtils.hasText(source)) return null;
        return Difficulty.valueOf(source.toUpperCase(Locale.ROOT).trim());
    }
}
