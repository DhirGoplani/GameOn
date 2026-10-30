package com.gameon.interfaces;

/**
 * Scorable Interface
 * Abstraction defining scoring operations and metrics for game entities.
 */
public interface Scorable {
    int getScore();
    void addScore(int points);
    void resetScore();
}
