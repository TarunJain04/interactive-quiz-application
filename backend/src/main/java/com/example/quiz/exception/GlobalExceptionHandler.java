package com.example.quiz.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import tools.jackson.core.exc.StreamReadException;
import tools.jackson.databind.DatabindException;
import tools.jackson.databind.exc.InvalidFormatException;
import tools.jackson.databind.exc.MismatchedInputException;
import tools.jackson.databind.exc.UnrecognizedPropertyException;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidAnswerException.class)
    public ResponseEntity<ErrorResponse> invalidAnswer(InvalidAnswerException ex, WebRequest request) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_ANSWER", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(QuestionNotFoundException.class)
    public ResponseEntity<ErrorResponse> questionNotFound(QuestionNotFoundException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(HttpStatus.NOT_FOUND, "QUESTION_NOT_FOUND", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(QuizAlreadySubmittedException.class)
    public ResponseEntity<ErrorResponse> quizAlreadySubmitted(QuizAlreadySubmittedException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT, "QUIZ_ALREADY_SUBMITTED", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(QuizNotFoundException.class)
    public ResponseEntity<ErrorResponse> quizNotFound(QuizNotFoundException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(HttpStatus.NOT_FOUND, "QUIZ_NOT_FOUND", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(InvalidCategoryException.class)
    public ResponseEntity<ErrorResponse> invalidCategory(InvalidCategoryException ex, WebRequest request) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_CATEGORY", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(InvalidFilterException.class)
    public ResponseEntity<ErrorResponse> invalidFilter(InvalidFilterException ex, WebRequest request) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_FILTER", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(ExternalServiceException.class)
    public ResponseEntity<ErrorResponse> externalServiceError(ExternalServiceException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, "EXTERNAL_SERVICE_UNAVAILABLE", ex.getMessage(),
                        path(request)));
    }

    @ExceptionHandler(GameNotFoundException.class)
    public ResponseEntity<ErrorResponse> gameNotFound(GameNotFoundException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(HttpStatus.NOT_FOUND, "GAME_NOT_FOUND", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(GameAlreadyFinishedException.class)
    public ResponseEntity<ErrorResponse> gameAlreadyFinished(GameAlreadyFinishedException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT, "GAME_ALREADY_FINISHED", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(CurrentQuestionMismatchException.class)
    public ResponseEntity<ErrorResponse> currentQuestionMismatch(CurrentQuestionMismatchException ex,
            WebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT, "CURRENT_QUESTION_MISMATCH", ex.getMessage(),
                        path(request)));
    }

    @ExceptionHandler(LifelineAlreadyUsedException.class)
    public ResponseEntity<ErrorResponse> lifelineAlreadyUsed(LifelineAlreadyUsedException ex, WebRequest request) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST, "LIFELINE_ALREADY_USED", ex.getMessage(),
                        path(request)));
    }

    @ExceptionHandler(GameTimedOutException.class)
    public ResponseEntity<ErrorResponse> gameTimedOut(GameTimedOutException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT, "GAME_TIMED_OUT", ex.getMessage(), path(request)));
    }

    @ExceptionHandler(QuestionsUnavailableException.class)
    public ResponseEntity<ErrorResponse> questionsUnavailable(QuestionsUnavailableException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, "QUESTIONS_UNAVAILABLE", ex.getMessage(),
                        path(request)));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex,
            WebRequest request) {
        List<ErrorResponse.FieldIssue> issues = ex.getConstraintViolations().stream()
                .map(v -> {
                    String path = v.getPropertyPath().toString();
                    return new ErrorResponse.FieldIssue(path.substring(path.lastIndexOf('.') + 1), v.getMessage());
                }).toList();

        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", issues, path(request)));
    }

    @ExceptionHandler(HttpStatusCodeException.class)
    public ResponseEntity<ErrorResponse> handleHttpErrors(HttpStatusCodeException ex, WebRequest request) {
        String message = ex.getMessage().replace("\\", "").replace("\"", "'");
        return ResponseEntity.status(ex.getStatusCode())
                .body(new ErrorResponse(HttpStatus.valueOf(ex.getStatusCode().value()), "UPSTREAM_HTTP_ERROR", message,
                        path(request)));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleInvalidMethodArgument(MethodArgumentNotValidException ex,
            WebRequest request) {
        List<ErrorResponse.FieldIssue> issues = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> new ErrorResponse.FieldIssue(err.getField(), err.getDefaultMessage()))
                .toList();
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", issues, path(request)));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
            WebRequest request) {
        Class<?> targetType = ex.getRequiredType();
        String message;
        if (targetType != null && targetType.isEnum()) {
            String allowed = Arrays.stream(targetType.getEnumConstants())
                    .map(Object::toString)
                    .collect(Collectors.joining(", "));
            message = String.format("Invalid value for parameter: '%s'. Allowed values: %s",
                    ex.getName(), allowed);
        } else
            message = "Invalid value for parameter: " + ex.getName();
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST, "REQUEST_PARAMETER_INVALID",
                        message, path(request)));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, WebRequest request) {
        Throwable cause = ex.getCause();
        String message;
        String code = "REQUEST_BODY_INVALID";
        if (cause instanceof InvalidFormatException ife) {
            Class<?> targetType = ife.getTargetType();
            if (targetType != null && targetType.isEnum()) {
                String allowed = Arrays.stream(targetType.getEnumConstants())
                        .map(Object::toString)
                        .collect(Collectors.joining(", "));
                message = String.format("Field '%s' has invalid value '%s'. Allowed values: %s",
                        fieldPath(ife), ife.getValue(), allowed);
            } else {
                message = String.format("Field '%s' has an invalid value", fieldPath(ife));
            }
        } else if (cause instanceof UnrecognizedPropertyException upe) {
            message = String.format("Field '%s' is not recognized", fieldPath(upe));
        } else if (cause instanceof MismatchedInputException mie) {
            message = String.format("Field '%s' has an invalid type or is missing", fieldPath(mie));
        } else if (cause instanceof StreamReadException) {
            code = "MALFORMED_JSON";
            message = "Request contains malformed JSON";
        } else {
            message = "Invalid request format";
        }

        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST, code, message, path(request)));
    }

    private String fieldPath(DatabindException ex) {
        return ex.getPath().stream()
                .map(DatabindException.Reference::getPropertyName)
                .filter(Objects::nonNull)
                .collect(Collectors.joining("."));
    }

    private String path(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }
}
