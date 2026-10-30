package com.gameon.state;

import com.gameon.games.core.Game;
import com.gameon.model.GameStatus;

/**
 * RunningState: Active gameplay state where turns are accepted.
 */
public class RunningState implements GameState {

    @Override
    public GameStatus getStatus() {
        return GameStatus.RUNNING;
    }

    @Override
    public void start(Game game) {
        // Already running; no-op
    }

    @Override
    public void pause(Game game) {
        game.transitionToState(new PausedState());
    }

    @Override
    public void resume(Game game) {
        // Already running; no-op
    }

    @Override
    public void end(Game game) {
        game.transitionToState(new GameOverState());
    }

    @Override
    public boolean canPlayTurn() {
        return true;
    }

    @Override
    public String toString() {
        return "RUNNING";
    }
}
