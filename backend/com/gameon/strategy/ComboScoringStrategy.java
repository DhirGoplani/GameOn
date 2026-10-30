package com.gameon.strategy;

/**
 * ComboScoringStrategy: Applies exponential multipliers based on consecutive successful moves.
 */
public class ComboScoringStrategy implements ScoringStrategy {

    @Override
    public int calculatePoints(int basePoints, int consecutiveStreak, long turnDurationMs) {
        if (basePoints <= 0) return 0;
        double multiplier = 1.0 + (Math.min(consecutiveStreak, 10) * 0.25); // up to 3.5x multiplier
        return (int) Math.round(basePoints * multiplier);
    }

    @Override
    public String getStrategyName() {
        return "Combo Multiplier";
    }
}
