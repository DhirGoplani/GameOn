package com.gameon.interfaces;

/**
 * Playable Interface
 * Core abstraction representing lifecycle contracts for any playable entity.
 * Hides internal state transitions behind a uniform protocol.
 */
public interface Playable {
    void start();
    void pause();
    void resume();
    void end();
    boolean isGameOver();
}
