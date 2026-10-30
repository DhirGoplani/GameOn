package com.gameon.repository;

import com.gameon.model.GameType;
import com.gameon.model.Score;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * LeaderboardRepository Interface & Thread-Safe In-Memory Implementation.
 * Demonstrates:
 * - Concurrency & Thread-Safety: ReentrantReadWriteLock allowing unlimited concurrent reads
 *   while ensuring atomic exclusive writes during score insertions.
 * - Defensive Copying: Unmodifiable score list returns.
 */
public interface LeaderboardRepository {
    void recordScore(Score score);
    List<Score> getTopScores(GameType gameType, int limit);
    int getTotalScoresCount(GameType gameType);
    void clear();

    class InMemoryLeaderboardRepository implements LeaderboardRepository {
        private final Map<GameType, List<Score>> scoresByGame = new EnumMap<>(GameType.class);
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock(true); // fair lock
        private final Lock readLock = rwLock.readLock();
        private final Lock writeLock = rwLock.writeLock();
        private static final int MAX_ENTRIES_PER_GAME = 50;

        public InMemoryLeaderboardRepository() {
            for (GameType type : GameType.values()) {
                scoresByGame.put(type, new ArrayList<>());
            }
        }

        @Override
        public void recordScore(Score score) {
            if (score == null) return;
            writeLock.lock();
            try {
                List<Score> list = scoresByGame.get(score.getGameType());
                list.add(score);
                Collections.sort(list); // Sorted via Score.compareTo
                if (list.size() > MAX_ENTRIES_PER_GAME) {
                    list.remove(list.size() - 1);
                }
            } finally {
                writeLock.unlock();
            }
        }

        @Override
        public List<Score> getTopScores(GameType gameType, int limit) {
            readLock.lock();
            try {
                List<Score> list = scoresByGame.get(gameType);
                if (list == null || list.isEmpty()) {
                    return Collections.emptyList();
                }
                int count = Math.min(limit, list.size());
                return Collections.unmodifiableList(new ArrayList<>(list.subList(0, count)));
            } finally {
                readLock.unlock();
            }
        }

        @Override
        public int getTotalScoresCount(GameType gameType) {
            readLock.lock();
            try {
                List<Score> list = scoresByGame.get(gameType);
                return (list != null) ? list.size() : 0;
            } finally {
                readLock.unlock();
            }
        }

        @Override
        public void clear() {
            writeLock.lock();
            try {
                for (List<Score> list : scoresByGame.values()) {
                    list.clear();
                }
            } finally {
                writeLock.unlock();
            }
        }
    }
}
