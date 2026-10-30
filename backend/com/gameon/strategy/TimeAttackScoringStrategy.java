package com.gameon.strategy;

/**
 * TimeAttackScoringStrategy: Awards bonus points for fast turn completion.
 */
public class TimeAttackScoringStrategy implements ScoringStrategy {

    @Override
    public int calculatePoints(int basePoints, int consecutiveStreak, long turnDurationMs) {
        if (basePoints <= 0) return 0;
        int timeBonus = 0;
        if (turnDurationMs > 0 && turnDurationMs < 1000) {
            timeBonus = 50; // Under 1 sec
        } else if (turnDurationMs < 3000) {
            timeBonus = 20; // Under 3 secs
        }
        return basePoints + timeBonus;
    }

    @Override
    public String getStrategyName() {
        return "Time Attack Bonus";
    }
}
