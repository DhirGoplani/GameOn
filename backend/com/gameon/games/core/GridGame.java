package com.gameon.games.core;

import com.gameon.model.Coordinate;
import com.gameon.model.GameType;

/**
 * GridGame Abstract Class
 * Demonstrates Multilevel Inheritance (Game -> GridGame -> Concrete Games).
 * Provides 2D grid matrix encapsulation, boundary validation, and coordinate utilities.
 */
public abstract class GridGame extends Game {
    private final int rows;
    private final int columns;

    public GridGame(GameType gameType, int rows, int columns) {
        super(gameType);
        if (rows <= 0 || columns <= 0) {
            throw new IllegalArgumentException("Grid dimensions must be positive integers");
        }
        this.rows = rows;
        this.columns = columns;
    }

    public int getRows() {
        return rows;
    }

    public int getColumns() {
        return columns;
    }

    public boolean isInBounds(int row, int col) {
        return row >= 0 && row < rows && col >= 0 && col < columns;
    }

    public boolean isInBounds(Coordinate coordinate) {
        if (coordinate == null) return false;
        return isInBounds(coordinate.getY(), coordinate.getX());
    }

    public int getTotalCells() {
        return rows * columns;
    }
}
