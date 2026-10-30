package com.gameon.command;

import com.gameon.exception.GameException;
import com.gameon.games.core.Game;
import com.gameon.model.Move;

import java.util.Objects;

/**
 * MoveCommand: Encapsulates a player's move execution on a specific game session.
 */
public class MoveCommand implements GameCommand {
    private final Game game;
    private final Move move;
    private boolean executed;

    public MoveCommand(Game game, Move move) {
        this.game = Objects.requireNonNull(game, "Game cannot be null");
        this.move = Objects.requireNonNull(move, "Move cannot be null");
        this.executed = false;
    }

    @Override
    public boolean execute() throws GameException {
        boolean success = game.executeTurn(move);
        this.executed = success;
        return success;
    }

    @Override
    public void undo() throws UnsupportedOperationException {
        if (!executed) {
            throw new UnsupportedOperationException("Cannot undo a command that was not executed");
        }
        game.undoLastTurn();
    }

    @Override
    public String getDescription() {
        return String.format("[%s] %s", game.getGameType().getDisplayName(), move);
    }

    public Move getMove() {
        return move;
    }
}
