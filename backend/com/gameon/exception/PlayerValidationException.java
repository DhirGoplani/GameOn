package com.gameon.exception;

/**
 * Thrown when player creation or modification fails validation invariants.
 */
public class PlayerValidationException extends GameException {
    public PlayerValidationException(String message) {
        super(message);
    }
}
