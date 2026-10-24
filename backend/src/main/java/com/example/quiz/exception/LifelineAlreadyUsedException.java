package com.example.quiz.exception;

public class LifelineAlreadyUsedException extends RuntimeException {
    public LifelineAlreadyUsedException() {
        super("Lifeline already used");
    }
}
