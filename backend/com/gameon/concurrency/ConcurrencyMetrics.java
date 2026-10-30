package com.gameon.concurrency;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * ConcurrencyMetrics
 * Demonstrates lock-free high-throughput concurrency metrics using AtomicLong and AtomicInteger.
 */
public class ConcurrencyMetrics {
    private final AtomicLong totalTurnsExecuted = new AtomicLong(0);
    private final AtomicLong totalScoresRecorded = new AtomicLong(0);
    private final AtomicInteger activeSessionsCount = new AtomicInteger(0);
    private final AtomicLong totalTurnDurationNanos = new AtomicLong(0);

    public void recordTurnExecution(long durationNanos) {
        totalTurnsExecuted.incrementAndGet();
        totalTurnDurationNanos.addAndGet(durationNanos);
    }

    public void recordScoreEvent() {
        totalScoresRecorded.incrementAndGet();
    }

    public void incrementActiveSessions() {
        activeSessionsCount.incrementAndGet();
    }

    public void decrementActiveSessions() {
        activeSessionsCount.decrementAndGet();
    }

    public long getTotalTurnsExecuted() {
        return totalTurnsExecuted.get();
    }

    public long getTotalScoresRecorded() {
        return totalScoresRecorded.get();
    }

    public int getActiveSessionsCount() {
        return activeSessionsCount.get();
    }

    public double getAverageTurnDurationMs() {
        long turns = totalTurnsExecuted.get();
        if (turns == 0) return 0.0;
        return (totalTurnDurationNanos.get() / (double) turns) / 1_000_000.0;
    }

    @Override
    public String toString() {
        return String.format("Metrics[turns=%d, scores=%d, activeSessions=%d, avgTurn=%.3f ms]",
            totalTurnsExecuted.get(), totalScoresRecorded.get(), activeSessionsCount.get(), getAverageTurnDurationMs());
    }
}
