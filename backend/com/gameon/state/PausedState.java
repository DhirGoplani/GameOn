package com.gameon.state;

import com.gameon.exception.GameException;
import com.gameon.games.core.Game;
import com.gameon.model.GameStatus;

/**
 * PausedState: Gameplay temporarily suspended.
 */
public class PausedState implements GameState {

    @Override
    public GameStatus getStatus() {
        return GameStatus.PAUSED;
    }

    @Override
    public void start(Game game) throws GameException {
        throw new GameException("Game is paused; use resume() instead of start()");
    }

    @Override
    public void pause(Game game) {
        // Already paused; no-op
    }

    @Override
    public void resume(Game game) {
        game.transitionToState(new RunningState());
    }

    @Override
    public void end(Game game) {
        game.transitionToState(new GameOverState());
    }

    @Override
    public boolean canPlayTurn() {
        return false;
    }

    @Override
    public String toString() {
        return "PAUSED";
    }
}
