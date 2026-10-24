package com.example.quiz.model;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks the constructor MapStruct should use when a class exposes more than
 * one.
 * MapStruct selects any constructor annotated with an annotation whose simple
 * name is {@code Default}, regardless of its package.
 */
@Retention(RetentionPolicy.CLASS)
@Target(ElementType.CONSTRUCTOR)
@interface Default {
}
