package com.gameon.exception;

/**
 * Thrown when an asynchronous execution, lock acquisition, or concurrent pipeline fails.
 */
public class ConcurrencyException extends GameException {
    public ConcurrencyException(String message) {
        super(message);
    }

    public ConcurrencyException(String message, Throwable cause) {
        super(message, cause);
    }
}
