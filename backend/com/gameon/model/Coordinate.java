package com.gameon.model;

import java.util.Objects;

/**
 * Coordinate Value Object
 * Demonstrates:
 * - Immutability & Encapsulation: Final fields, no setters.
 * - Constructor Overloading: Multiple construction pathways.
 * - Value Object Semantics: Overridden equals(), hashCode(), and toString().
 */
public final class Coordinate {
    private final int x;
    private final int y;

    /**
     * Default constructor (initializes origin).
     */
    public Coordinate() {
        this(0, 0);
    }

    /**
     * Parameterized constructor.
     *
     * @param x X coordinate (column)
     * @param y Y coordinate (row)
     */
    public Coordinate(int x, int y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Copy constructor (demonstrates copying mechanism in Java).
     *
     * @param other Existing coordinate to copy
     */
    public Coordinate(Coordinate other) {
        Objects.requireNonNull(other, "Coordinate to copy cannot be null");
        this.x = other.x;
        this.y = other.y;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    /**
     * Factory method for creating translated coordinates (Immutability pattern).
     */
    public Coordinate translate(int dx, int dy) {
        return new Coordinate(this.x + dx, this.y + dy);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Coordinate)) return false;
        Coordinate that = (Coordinate) o;
        return x == that.x && y == that.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return String.format("(%d, %d)", x, y);
    }
}
