package com.example.quiz.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String code,
        String error,
        String message,
        List<FieldIssue> issues,
        String path) {

    public record FieldIssue(String field, String message) {
    }

    public ErrorResponse(
            HttpStatus status,
            String code,
            String message,
            String path) {
        this(Instant.now(), status.value(), code,
                status.getReasonPhrase(), message, null, path);
    }

    public ErrorResponse(
            HttpStatus status,
            String code,
            List<FieldIssue> issues,
            String path) {
        this(Instant.now(), status.value(), code,
                status.getReasonPhrase(), null, issues, path);
    }

    public ErrorResponse(
            HttpStatusCode status,
            String error,
            String code,
            String message,
            String path) {
        this(Instant.now(), status.value(), code, error, message, null, path);
    }
}
