package com.gameon.state;

import com.gameon.exception.GameException;
import com.gameon.games.core.Game;
import com.gameon.model.GameStatus;

/**
 * InitializedState: Initial lifecycle state of a newly created game.
 */
public class InitializedState implements GameState {

    @Override
    public GameStatus getStatus() {
        return GameStatus.INITIALIZED;
    }

    @Override
    public void start(Game game) {
        game.transitionToState(new RunningState());
    }

    @Override
    public void pause(Game game) throws GameException {
        throw new GameException("Cannot pause a game that has not yet started");
    }

    @Override
    public void resume(Game game) throws GameException {
        throw new GameException("Cannot resume a game that has not yet started");
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
        return "INITIALIZED";
    }
}
