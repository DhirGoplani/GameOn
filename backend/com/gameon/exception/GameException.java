package com.gameon.exception;

/**
 * Base domain exception for the GameOn platform.
 * Establishes a clear exception hierarchy for architectural error handling.
 */
public class GameException extends Exception {
    public GameException(String message) {
        super(message);
    }

    public GameException(String message, Throwable cause) {
        super(message, cause);
    }
}
