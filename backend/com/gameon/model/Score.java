package com.gameon.model;

import com.gameon.interfaces.Identifiable;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.UUID;

/**
 * Score Model & Value Object
 * Demonstrates:
 * - Encapsulation: Strict private fields, validated invariants.
 * - Interface Implementation: Comparable<Score> and Identifiable<String>.
 * - Copy Constructor: Demonstrates object cloning semantics.
 */
public final class Score implements Comparable<Score>, Identifiable<String> {
    private final String id;
    private final String playerId;
    private final String playerName;
    private final GameType gameType;
    private final int value;
    private final LocalDateTime timestamp;

    /**
     * Parameterized Constructor.
     */
    public Score(String playerId, String playerName, GameType gameType, int value) {
        this.id = UUID.randomUUID().toString().substring(0, 8);
        this.playerId = Objects.requireNonNull(playerId, "Player ID cannot be null");
        this.playerName = Objects.requireNonNull(playerName, "Player name cannot be null");
        this.gameType = Objects.requireNonNull(gameType, "Game type cannot be null");
        this.value = Math.max(0, value);
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Copy Constructor.
     */
    public Score(Score other) {
        Objects.requireNonNull(other, "Score to copy cannot be null");
        this.id = other.id;
        this.playerId = other.playerId;
        this.playerName = other.playerName;
        this.gameType = other.gameType;
        this.value = other.value;
        this.timestamp = other.timestamp;
    }

    @Override
    public String getId() {
        return id;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getPlayerName() {
        return playerName;
    }

    public GameType getGameType() {
        return gameType;
    }

    public int getValue() {
        return value;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    @Override
    public int compareTo(Score other) {
        // Descending order for rankings; tie-break on timestamp
        int cmp = Integer.compare(other.value, this.value);
        if (cmp != 0) return cmp;
        return this.timestamp.compareTo(other.timestamp);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Score)) return false;
        Score score = (Score) o;
        return value == score.value &&
               Objects.equals(playerId, score.playerId) &&
               gameType == score.gameType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(playerId, gameType, value);
    }

    @Override
    public String toString() {
        return String.format("[%s] %s: %d pts (%s)",
            gameType.getDisplayName(), playerName, value,
            timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
    }
}
