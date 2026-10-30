package com.gameon.state;

import com.gameon.exception.GameException;
import com.gameon.games.core.Game;
import com.gameon.model.GameStatus;

/**
 * GameState Interface (Behavioral State Pattern)
 * Encapsulates state-specific behavior and rules for valid lifecycle transitions.
 * Eliminates monolithic switch statements and procedural conditionals.
 */
public interface GameState {
    GameStatus getStatus();
    void start(Game game) throws GameException;
    void pause(Game game) throws GameException;
    void resume(Game game) throws GameException;
    void end(Game game) throws GameException;
    boolean canPlayTurn();
}
