package com.gameon.service;

import com.gameon.model.GameType;
import com.gameon.model.Score;
import com.gameon.repository.LeaderboardRepository;

import java.util.List;
import java.util.Objects;

/**
 * LeaderboardService
 * Handles score rankings, high score displays, and leaderboard audits.
 */
public class LeaderboardService {
    private final LeaderboardRepository leaderboardRepository;

    public LeaderboardService(LeaderboardRepository leaderboardRepository) {
        this.leaderboardRepository = Objects.requireNonNull(leaderboardRepository, "LeaderboardRepository cannot be null");
    }

    public void recordScore(Score score) {
        leaderboardRepository.recordScore(score);
    }

    public List<Score> getTopScores(GameType gameType, int limit) {
        return leaderboardRepository.getTopScores(gameType, limit);
    }

    public List<Score> getTopScores(GameType gameType) {
        return getTopScores(gameType, 10);
    }

    public void printLeaderboard(GameType gameType) {
        System.out.println("=== LEADERBOARD: " + gameType.getDisplayName() + " ===");
        List<Score> scores = getTopScores(gameType);
        if (scores.isEmpty()) {
            System.out.println("  (No scores recorded yet)");
        } else {
            for (int i = 0; i < scores.size(); i++) {
                System.out.printf("  #%d. %s%n", i + 1, scores.get(i));
            }
        }
        System.out.println();
    }
}
