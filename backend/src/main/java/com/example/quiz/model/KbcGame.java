package com.example.quiz.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document("kbc_games")
public class KbcGame {
    @Id
    public String id;
    public KbcStatus status;
    public int currentLevel;
    public String currentQuestionId;
    public Difficulty questionDifficulty;
    public List<String> usedQuestionIds = new ArrayList<>();
    public Instant questionDeadline;
    public Set<Lifeline> lifelinesUsed = new HashSet<>();
    public List<Integer> hiddenIndices = new ArrayList<>();
    public List<String> flippedQuestionIds = new ArrayList<>();
    public long prizeWon;
    public Instant createdAt = Instant.now();
    public Instant lastActivityAt = Instant.now();
    @Version
    public Long version;
}
