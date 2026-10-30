package com.gameon.model;

import java.util.Objects;
import java.util.Optional;

/**
 * Move Value Object
 * Encapsulates player move actions across varied game types (directional, grid placement, column drop).
 * Demonstrates Constructor Overloading and Method Overloading.
 */
public final class Move {
    private final String playerId;
    private final Coordinate coordinate;
    private final String action;
    private final int value;

    /**
     * Parameterized Constructor 1: Grid position move (e.g., Tic-Tac-Toe, Sudoku).
     */
    public Move(String playerId, Coordinate coordinate, int value) {
        this.playerId = Objects.requireNonNull(playerId, "Player ID cannot be null");
        this.coordinate = coordinate;
        this.action = "PLACE";
        this.value = value;
    }

    /**
     * Parameterized Constructor 2: Overloaded for simple 2D coordinates without value.
     */
    public Move(String playerId, int row, int col) {
        this(playerId, new Coordinate(col, row), 0);
    }

    /**
     * Parameterized Constructor 3: Directional move (e.g., 2048, Snake swipe).
     */
    public Move(String playerId, String direction) {
        this.playerId = Objects.requireNonNull(playerId, "Player ID cannot be null");
        this.coordinate = null;
        this.action = Objects.requireNonNull(direction, "Direction cannot be null").toUpperCase();
        this.value = 0;
    }

    /**
     * Parameterized Constructor 4: Column drop move (e.g., Connect 4).
     */
    public Move(String playerId, int column) {
        this.playerId = Objects.requireNonNull(playerId, "Player ID cannot be null");
        this.coordinate = new Coordinate(column, -1);
        this.action = "DROP";
        this.value = column;
    }

    public String getPlayerId() {
        return playerId;
    }

    public Optional<Coordinate> getCoordinate() {
        return Optional.ofNullable(coordinate);
    }

    public String getAction() {
        return action;
    }

    public int getValue() {
        return value;
    }

    @Override
    public String toString() {
        if (coordinate != null && coordinate.getY() >= 0) {
            return String.format("Move[player=%s, pos=%s, val=%d]", playerId, coordinate, value);
        } else if ("DROP".equals(action)) {
            return String.format("Move[player=%s, dropCol=%d]", playerId, value);
        } else {
            return String.format("Move[player=%s, action=%s]", playerId, action);
        }
    }
}
