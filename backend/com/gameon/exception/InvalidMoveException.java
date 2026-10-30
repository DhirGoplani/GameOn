package com.gameon.exception;

/**
 * Thrown when an illegal, out-of-bounds, or out-of-turn move is attempted.
 */
public class InvalidMoveException extends GameException {
    private final String reason;

    public InvalidMoveException(String message) {
        super(message);
        this.reason = message;
    }

    public InvalidMoveException(String message, String reason) {
        super(String.format("%s (Reason: %s)", message, reason));
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }
}
