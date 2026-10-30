package com.gameon.repository;

import com.gameon.games.core.Game;
import com.gameon.interfaces.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * SessionRepository Interface & Thread-Safe Implementation.
 * Eliminates HashMap concurrency defects from the original server.java.
 */
public interface SessionRepository extends Repository<Game, String> {

    class InMemorySessionRepository implements SessionRepository {
        private final ConcurrentMap<String, Game> sessions = new ConcurrentHashMap<>();

        @Override
        public void save(Game game) {
            if (game != null) {
                sessions.put(game.getGameId(), game);
            }
        }

        @Override
        public Optional<Game> findById(String id) {
            if (id == null) return Optional.empty();
            return Optional.ofNullable(sessions.get(id));
        }

        @Override
        public List<Game> findAll() {
            return new ArrayList<>(sessions.values());
        }

        @Override
        public boolean deleteById(String id) {
            if (id == null) return false;
            return sessions.remove(id) != null;
        }

        @Override
        public boolean existsById(String id) {
            if (id == null) return false;
            return sessions.containsKey(id);
        }

        @Override
        public long count() {
            return sessions.size();
        }
    }
}
