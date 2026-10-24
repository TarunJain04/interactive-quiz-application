package com.example.quiz.model;

public enum QuestionType {
    MULTIPLE_CHOICE,
    TRUE_FALSE,
    MULTIPLE,
    BOOLEAN;

    public static QuestionType fromExternal(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        return switch (normalized) {
            case "MULTIPLE_CHOICE" -> MULTIPLE_CHOICE;
            case "TRUE_FALSE" -> TRUE_FALSE;
            case "MULTIPLE" -> MULTIPLE;
            case "BOOLEAN" -> BOOLEAN;
            default -> valueOf(normalized);
        };
    }
}
