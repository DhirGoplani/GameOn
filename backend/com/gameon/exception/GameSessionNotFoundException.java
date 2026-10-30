package com.gameon.exception;

/**
 * Thrown when an active game session lookup fails.
 */
public class GameSessionNotFoundException extends GameException {
    private final String sessionId;

    public GameSessionNotFoundException(String sessionId) {
        super(String.format("Game session not found: %s", sessionId));
        this.sessionId = sessionId;
    }

    public String getSessionId() {
        return sessionId;
    }
}
