package com.example.quiz.loader;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryFileLoader {
    private final ObjectMapper objectMapper;

    public CategoryFileLoader(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Map<String, String> loadCategoriesFile(String filename) {
        String normalizedFilename = filename == null ? "" : filename.trim();
        if (normalizedFilename.isEmpty()) {
            throw new IllegalArgumentException("Filename must not be blank");
        }

        String resourcePath = normalizedFilename.startsWith("data/")
                ? normalizedFilename
                : "data/" + normalizedFilename;

        ClassPathResource resource = new ClassPathResource(resourcePath);
        if (!resource.exists()) {
            throw new IllegalArgumentException("File not found on classpath: " + resourcePath);
        }

        try (InputStream inputStream = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(inputStream);
            JsonNode mappingsNode = root.get("categoryMappings");
            if (mappingsNode == null) {
                throw new IllegalStateException("Missing 'categoryMappings' field in: " + resourcePath);
            }
            Map<String, String> mappings = objectMapper.convertValue(
                    mappingsNode, new TypeReference<Map<String, String>>() {
                    });
            return mappings.entrySet().stream()
                    .collect(Collectors.toMap(
                            e -> e.getKey().trim().toLowerCase(Locale.ROOT),
                            e -> e.getValue().trim()));
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to load category file: " + resourcePath, exception);
        }
    }
}