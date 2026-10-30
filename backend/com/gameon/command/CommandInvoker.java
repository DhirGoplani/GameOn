package com.gameon.command;

import com.gameon.exception.GameException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;

/**
 * CommandInvoker (Command Pattern Orchestrator)
 * Manages command execution, history stack, and undo/redo operations.
 */
public class CommandInvoker {
    private final Deque<GameCommand> history = new LinkedList<>();
    private final Deque<GameCommand> redoStack = new LinkedList<>();
    private static final int MAX_HISTORY_SIZE = 100;

    public synchronized boolean invoke(GameCommand command) throws GameException {
        boolean success = command.execute();
        if (success) {
            history.push(command);
            redoStack.clear();
            if (history.size() > MAX_HISTORY_SIZE) {
                history.removeLast();
            }
        }
        return success;
    }

    public synchronized boolean canUndo() {
        return !history.isEmpty();
    }

    public synchronized void undo() {
        if (!canUndo()) return;
        GameCommand command = history.pop();
        try {
            command.undo();
            redoStack.push(command);
        } catch (UnsupportedOperationException e) {
            // Undo not supported by this concrete game command
        }
    }

    public synchronized List<GameCommand> getHistory() {
        return Collections.unmodifiableList(new ArrayList<>(history));
    }

    public synchronized void clear() {
        history.clear();
        redoStack.clear();
    }
}
