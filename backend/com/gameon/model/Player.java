package com.gameon.model;

import com.gameon.interfaces.Identifiable;

import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;
import java.util.Objects;

/**
 * Player Domain Entity
 * Demonstrates:
 * - Strict Encapsulation: Private state, mutators with domain invariants.
 * - Constructor Chaining & Overloading.
 * - Defensive Copying: Read-only exposure of high scores collection.
 * - Copy Constructor for deep/isolated duplication.
 */
public class Player implements Identifiable<String> {
    private final String id;
    private String name;
    private String email;
    private final Map<GameType, Integer> highScores;
    private int totalGamesPlayed;

    /**
     * Parameterized Constructor 1: Fully specified.
     */
    public Player(String id, String name, String email) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Player ID must not be empty");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Player name must not be empty");
        }
        this.id = id.trim();
        this.name = name.trim();
        this.email = (email != null) ? email.trim() : "player@gameon.app";
        this.highScores = new EnumMap<>(GameType.class);
        this.totalGamesPlayed = 0;
    }

    /**
     * Constructor Chaining: Delegates to fully specified constructor with default email.
     */
    public Player(String id, String name) {
        this(id, name, name.toLowerCase().replaceAll("\\s+", ".") + "@gameon.app");
    }

    /**
     * Copy Constructor.
     */
    public Player(Player other) {
        Objects.requireNonNull(other, "Player to copy cannot be null");
        this.id = other.id;
        this.name = other.name;
        this.email = other.email;
        this.highScores = new EnumMap<>(other.highScores);
        this.totalGamesPlayed = other.totalGamesPlayed;
    }

    @Override
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name.trim();
        }
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email != null && email.contains("@")) {
            this.email = email.trim();
        }
    }

    public int getTotalGamesPlayed() {
        return totalGamesPlayed;
    }

    public synchronized void incrementGamesPlayed() {
        this.totalGamesPlayed++;
    }

    public synchronized int getHighScore(GameType gameType) {
        return highScores.getOrDefault(gameType, 0);
    }

    public synchronized boolean updateHighScore(GameType gameType, int score) {
        int current = getHighScore(gameType);
        if (score > current) {
            highScores.put(gameType, score);
            return true;
        }
        return false;
    }

    /**
     * Encapsulation: Returns an unmodifiable view of internal map to prevent external tampering.
     */
    public synchronized Map<GameType, Integer> getHighScores() {
        return Collections.unmodifiableMap(new EnumMap<>(highScores));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Player)) return false;
        Player player = (Player) o;
        return Objects.equals(id, player.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("Player[id=%s, name=%s, gamesPlayed=%d]", id, name, totalGamesPlayed);
    }
}
