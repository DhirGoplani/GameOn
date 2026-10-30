package com.gameon.strategy;

/**
 * NormalScoringStrategy: Standard 1:1 base point allocation.
 */
public class NormalScoringStrategy implements ScoringStrategy {

    @Override
    public int calculatePoints(int basePoints, int consecutiveStreak, long turnDurationMs) {
        return Math.max(0, basePoints);
    }

    @Override
    public String getStrategyName() {
        return "Standard";
    }
}
