package com.gameon.repository;

import com.gameon.interfaces.Repository;
import com.gameon.model.Player;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * PlayerRepository Interface & Thread-Safe In-Memory Implementation.
 * Demonstrates:
 * - Repository Pattern.
 * - Concurrency & Thread-Safety: Backed by ConcurrentHashMap for lock-free read scalability.
 */
public interface PlayerRepository extends Repository<Player, String> {

    class InMemoryPlayerRepository implements PlayerRepository {
        private final ConcurrentMap<String, Player> storage = new ConcurrentHashMap<>();

        @Override
        public void save(Player player) {
            if (player != null) {
                storage.put(player.getId(), player);
            }
        }

        @Override
        public Optional<Player> findById(String id) {
            if (id == null) return Optional.empty();
            return Optional.ofNullable(storage.get(id));
        }

        @Override
        public List<Player> findAll() {
            return new ArrayList<>(storage.values());
        }

        @Override
        public boolean deleteById(String id) {
            if (id == null) return false;
            return storage.remove(id) != null;
        }

        @Override
        public boolean existsById(String id) {
            if (id == null) return false;
            return storage.containsKey(id);
        }

        @Override
        public long count() {
            return storage.size();
        }
    }
}
