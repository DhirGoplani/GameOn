package com.gameon.observer;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * GameEventPublisher (Observer Pattern Subject)
 * Thread-safe event dispatcher utilizing CopyOnWriteArrayList for lock-free subscriber iteration.
 */
public class GameEventPublisher {
    private final List<GameEventListener> listeners = new CopyOnWriteArrayList<>();

    public void addListener(GameEventListener listener) {
        if (listener != null) {
            listeners.add(listener);
        }
    }

    public void removeListener(GameEventListener listener) {
        listeners.remove(listener);
    }

    public void publish(GameEvent event) {
        for (GameEventListener listener : listeners) {
            try {
                listener.onGameEvent(event);
            } catch (Exception e) {
                System.err.printf("[GameEventPublisher] Error notifying listener: %s%n", e.getMessage());
            }
        }
    }

    public int getListenerCount() {
        return listeners.size();
    }
}
