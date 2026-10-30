package com.gameon.concurrency;

import com.gameon.model.Score;
import com.gameon.repository.LeaderboardRepository;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * AsyncScoreProcessor (Producer-Consumer Pattern)
 * Concurrency Specialist Pattern:
 * - Producers: Game sessions push completed scores to a thread-safe LinkedBlockingQueue.
 * - Consumer: A dedicated background thread drains the queue and persists scores to LeaderboardRepository.
 * Prevents game turn thread blocking during heavy score write throughput.
 */
public class AsyncScoreProcessor implements AutoCloseable {
    private final BlockingQueue<Score> scoreQueue = new LinkedBlockingQueue<>(10_000);
    private final LeaderboardRepository leaderboardRepository;
    private final ConcurrencyMetrics metrics;
    private final AtomicBoolean running = new AtomicBoolean(true);
    private final Thread consumerThread;

    public AsyncScoreProcessor(LeaderboardRepository leaderboardRepository, ConcurrencyMetrics metrics) {
        this.leaderboardRepository = leaderboardRepository;
        this.metrics = metrics;
        this.consumerThread = new Thread(this::consumeScores, "GameOn-ScoreProcessor");
        this.consumerThread.setDaemon(true);
        this.consumerThread.start();
    }

    /**
     * Producer: Pushes score to the queue. Non-blocking with fallback.
     */
    public boolean submitScore(Score score) {
        if (!running.get() || score == null) return false;
        boolean accepted = scoreQueue.offer(score);
        if (accepted && metrics != null) {
            metrics.recordScoreEvent();
        }
        return accepted;
    }

    /**
     * Consumer Loop: Continuously consumes scores from the BlockingQueue.
     */
    private void consumeScores() {
        while (running.get() || !scoreQueue.isEmpty()) {
            try {
                Score score = scoreQueue.poll(50, TimeUnit.MILLISECONDS);
                if (score != null) {
                    leaderboardRepository.recordScore(score);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    public int getPendingQueueSize() {
        return scoreQueue.size();
    }

    public void flushAndStop() {
        running.set(false);
        try {
            consumerThread.join(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @Override
    public void close() {
        flushAndStop();
    }
}
