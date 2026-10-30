package com.gameon.model;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * GameResult Value Object
 * Captures the immutable outcome of a finished game session.
 */
public final class GameResult {
    private final String gameId;
    private final GameType gameType;
    private final Player winner;
    private final List<Player> participants;
    private final int finalScore;
    private final boolean isDraw;
    private final LocalDateTime completedAt;

    public GameResult(String gameId, GameType gameType, Player winner, List<Player> participants, int finalScore, boolean isDraw) {
        this.gameId = gameId;
        this.gameType = gameType;
        this.winner = winner;
        this.participants = (participants != null) ? List.copyOf(participants) : Collections.emptyList();
        this.finalScore = finalScore;
        this.isDraw = isDraw;
        this.completedAt = LocalDateTime.now();
    }

    public String getGameId() { return gameId; }
    public GameType getGameType() { return gameType; }
    public Optional<Player> getWinner() { return Optional.ofNullable(winner); }
    public List<Player> getParticipants() { return participants; }
    public int getFinalScore() { return finalScore; }
    public boolean isDraw() { return isDraw; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    @Override
    public String toString() {
        if (isDraw) {
            return String.format("[%s #%s] Draw! Score: %d", gameType.getDisplayName(), gameId, finalScore);
        } else if (winner != null) {
            return String.format("[%s #%s] Winner: %s, Score: %d", gameType.getDisplayName(), gameId, winner.getName(), finalScore);
        } else {
            return String.format("[%s #%s] Finished with score %d", gameType.getDisplayName(), gameId, finalScore);
        }
    }
}
