package com.gameon.observer;

/**
 * GameEventListener (Observer Pattern Subscriber Interface)
 */
@FunctionalInterface
public interface GameEventListener {
    void onGameEvent(GameEvent event);
}
