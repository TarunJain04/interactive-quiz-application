package com.example.quiz.converter;

import com.example.quiz.model.Source;
import lombok.NonNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Component
public class SourceConverter implements Converter<String, Source> {
    public Source convert(@NonNull String source) {
        if (!StringUtils.hasText(source)) return null;
        return Source.valueOf(source.toUpperCase(Locale.ROOT).trim());
    }
}
