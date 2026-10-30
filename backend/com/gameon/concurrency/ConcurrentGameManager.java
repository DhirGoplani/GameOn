package com.gameon.concurrency;

import com.gameon.exception.ConcurrencyException;
import com.gameon.exception.GameException;
import com.gameon.exception.GameSessionNotFoundException;
import com.gameon.games.core.Game;
import com.gameon.model.GameResult;
import com.gameon.model.Move;
import com.gameon.model.Score;
import com.gameon.repository.SessionRepository;

import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

/**
 * ConcurrentGameManager
 * Concurrency Specialist Orchestrator:
 * - Thread-safe session management.
 * - Per-session lock acquisition to serialize turns and prevent race conditions.
 * - Deadlock prevention via consistent lock ordering and tryLock timeout.
 * - Non-blocking asynchronous score submission to AsyncScoreProcessor.
 */
public class ConcurrentGameManager {
    private final SessionRepository sessionRepository;
    private final SessionLockManager lockManager;
    private final AsyncScoreProcessor scoreProcessor;
    private final ConcurrencyMetrics metrics;
    private final java.util.concurrent.ConcurrentMap<String, GameResult> completedResults = new java.util.concurrent.ConcurrentHashMap<>();

    public ConcurrentGameManager(SessionRepository sessionRepository,
                                 SessionLockManager lockManager,
                                 AsyncScoreProcessor scoreProcessor,
                                 ConcurrencyMetrics metrics) {
        this.sessionRepository = Objects.requireNonNull(sessionRepository, "SessionRepository cannot be null");
        this.lockManager = Objects.requireNonNull(lockManager, "LockManager cannot be null");
        this.scoreProcessor = Objects.requireNonNull(scoreProcessor, "ScoreProcessor cannot be null");
        this.metrics = Objects.requireNonNull(metrics, "Metrics cannot be null");
    }

    public void registerSession(Game game) {
        sessionRepository.save(game);
        metrics.incrementActiveSessions();
    }

    public boolean executeTurn(String sessionId, Move move) throws GameException {
        Game game = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new GameSessionNotFoundException(sessionId));

        ReentrantLock lock = lockManager.getLock(sessionId);
        boolean acquired = false;
        long startNanos = System.nanoTime();

        try {
            // Deadlock prevention: attempt acquisition with timeout rather than blocking indefinitely
            acquired = lock.tryLock(2, TimeUnit.SECONDS);
            if (!acquired) {
                throw new ConcurrencyException("Timeout acquiring lock for session: " + sessionId + " (potential deadlock avoided)");
            }

            boolean success = game.executeTurn(move);
            metrics.recordTurnExecution(System.nanoTime() - startNanos);
            return success;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ConcurrencyException("Turn interrupted during lock acquisition", e);
        } finally {
            if (acquired) {
                lock.unlock();
            }
        }
    }

    public GameResult completeGame(String sessionId) throws GameSessionNotFoundException {
        Game game = sessionRepository.findById(sessionId).orElse(null);
        if (game == null) {
            GameResult cached = completedResults.get(sessionId);
            if (cached != null) {
                return cached;
            }
            throw new GameSessionNotFoundException(sessionId);
        }

        ReentrantLock lock = lockManager.getLock(sessionId);
        lock.lock();
        try {
            if (!game.isGameOver()) {
                game.end();
            }

            GameResult result = game.getResult();

            // Submit final score asynchronously through producer-consumer pipeline
            if (result.getFinalScore() > 0 && result.getWinner().isPresent()) {
                Score score = new Score(
                    result.getWinner().get().getId(),
                    result.getWinner().get().getName(),
                    result.getGameType(),
                    result.getFinalScore()
                );
                scoreProcessor.submitScore(score);
            } else if (result.getFinalScore() > 0 && !result.getParticipants().isEmpty()) {
                Score score = new Score(
                    result.getParticipants().get(0).getId(),
                    result.getParticipants().get(0).getName(),
                    result.getGameType(),
                    result.getFinalScore()
                );
                scoreProcessor.submitScore(score);
            }

            completedResults.put(sessionId, result);
            sessionRepository.deleteById(sessionId);
            lockManager.removeLock(sessionId);
            metrics.decrementActiveSessions();
            return result;
        } finally {
            lock.unlock();
        }
    }

    public ConcurrencyMetrics getMetrics() {
        return metrics;
    }
}
