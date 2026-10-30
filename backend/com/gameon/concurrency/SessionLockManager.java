package com.gameon.concurrency;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * SessionLockManager
 * Concurrency Specialist Primitive: Provides fine-grained per-session ReentrantLock synchronization.
 * Prevents race conditions during simultaneous turns on the same game match,
 * while allowing disjoint game sessions to execute in parallel without lock contention.
 */
public class SessionLockManager {
    private final ConcurrentMap<String, ReentrantLock> locks = new ConcurrentHashMap<>();

    public ReentrantLock getLock(String sessionId) {
        return locks.computeIfAbsent(sessionId, id -> new ReentrantLock(true)); // Fair locking
    }

    public void removeLock(String sessionId) {
        locks.remove(sessionId);
    }

    public int getActiveLockCount() {
        return locks.size();
    }
}
