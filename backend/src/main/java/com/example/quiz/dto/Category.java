package com.example.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.NonNull;

public record Category(String name, String slug) {
}
