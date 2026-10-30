package com.gameon.command;

import com.gameon.exception.GameException;

/**
 * GameCommand Interface (Behavioral Command Pattern)
 * Encapsulates game operations/moves as first-class objects.
 * Supports execution, undo capabilities, and audit/history logging.
 */
public interface GameCommand {
    boolean execute() throws GameException;
    void undo() throws UnsupportedOperationException;
    String getDescription();
}
