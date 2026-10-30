package com.gameon.state;

import com.gameon.exception.GameException;
import com.gameon.games.core.Game;
import com.gameon.model.GameStatus;

/**
 * GameOverState: Terminal lifecycle state of a game.
 */
public class GameOverState implements GameState {

    @Override
    public GameStatus getStatus() {
        return GameStatus.GAME_OVER;
    }

    @Override
    public void start(Game game) {
        // Restarting game: reset and transition to running
        game.resetScore();
        game.transitionToState(new RunningState());
    }

    @Override
    public void pause(Game game) throws GameException {
        throw new GameException("Cannot pause a game that has ended");
    }

    @Override
    public void resume(Game game) throws GameException {
        throw new GameException("Cannot resume a game that has ended");
    }

    @Override
    public void end(Game game) {
        // Already ended; no-op
    }

    @Override
    public boolean canPlayTurn() {
        return false;
    }

    @Override
    public String toString() {
        return "GAME_OVER";
    }
}
