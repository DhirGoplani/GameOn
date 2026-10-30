package com.gameon.strategy;

/**
 * ScoringStrategy (Behavioral Strategy Pattern)
 * Defines pluggable scoring calculation algorithms, allowing scoring rules to vary independently from games.
 */
public interface ScoringStrategy {
    int calculatePoints(int basePoints, int consecutiveStreak, long turnDurationMs);
    String getStrategyName();
}
