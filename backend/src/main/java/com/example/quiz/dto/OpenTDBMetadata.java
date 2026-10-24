package com.example.quiz.dto;

import java.util.List;


public record OpenTDBMetadata(
                List<CategoryInfo> categories,
                List<String> types,
                List<String> difficulties) {

        public record CategoryInfo(int id, String name) {
        }
}
