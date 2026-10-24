package com.example.quiz.service;

import com.example.quiz.model.KbcGame;
import com.example.quiz.model.KbcStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
public class GameAbandonmentScheduler {
    private final MongoTemplate mongo;
    private final Duration maximumGameDuration;

    public GameAbandonmentScheduler(
            MongoTemplate mongo,
            @Value("${game.maximum-duration:PT30M}") Duration maximumGameDuration) {
        this.mongo = mongo;
        this.maximumGameDuration = maximumGameDuration;
    }

    @Scheduled(fixedDelayString = "${game.abandonment-scan-interval-ms:60000}")
    public void abandonInactiveGames() {
        Instant cutoff = Instant.now().minus(maximumGameDuration);
        Query query = Query.query(Criteria.where("status").is(KbcStatus.IN_PROGRESS)
                .and("createdAt").lt(cutoff));
        Update update = new Update()
                .set("status", KbcStatus.ABANDONED)
                .set("abandonedAt", Instant.now());
        mongo.updateMulti(query, update, KbcGame.class);
    }
}
