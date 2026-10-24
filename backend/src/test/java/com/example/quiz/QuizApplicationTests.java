package com.example.quiz;

import com.example.quiz.dto.GameState;
import com.example.quiz.model.KbcGame;
import com.example.quiz.model.KbcStatus;
import com.example.quiz.service.KbcService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class QuizApplicationTests {
	@Autowired
	private MongoTemplate mongo;

	@Autowired
	private KbcService kbcService;

	private String gameIdToCleanUp;

	@Test
	void contextLoads() {
	}

	@Test
	void quitRepairsDeadlineOfLegacyFlippedGame() {
		KbcGame game = new KbcGame();
		game.status = KbcStatus.IN_PROGRESS;
		game.currentLevel = 1;
		game.currentQuestionId = "legacy-flipped-question";
		game.questionDeadline = null;
		mongo.save(game);
		gameIdToCleanUp = game.id;

		GameState result = kbcService.quit(game.id);

		assertEquals(KbcStatus.QUIT, result.status());
	}

	@AfterEach
	void cleanUpGame() {
		if (gameIdToCleanUp != null) {
			mongo.remove(Query.query(Criteria.where("_id").is(gameIdToCleanUp)), KbcGame.class);
		}
	}

}
