package com.gameon.factory;

import com.gameon.games.core.Game;
import com.gameon.games.core.MultiPlayerGame;
import com.gameon.games.multiplayer.Connect4Game;
import com.gameon.games.multiplayer.TicTacToeGame;
import com.gameon.games.multiplayer.TomAndJerryGame;
import com.gameon.model.GameType;
import com.gameon.model.Player;

import java.util.List;
import java.util.Objects;

/**
 * MultiPlayerGameFactory (Concrete Factory for Multiplayer Games)
 */
public class MultiPlayerGameFactory implements AbstractGameFactory {

    @Override
    public Game createGame(GameType type, List<Player> players) {
        if (players == null || players.size() < 2) {
            throw new IllegalArgumentException("Multiplayer game requires at least 2 players");
        }
        return create(type, players.get(0), players.get(1));
    }

    public MultiPlayerGame create(GameType type, Player p1, Player p2) {
        Objects.requireNonNull(type, "GameType cannot be null");
        Objects.requireNonNull(p1, "Player 1 cannot be null");
        Objects.requireNonNull(p2, "Player 2 cannot be null");

        switch (type) {
            case TICTACTOE:
                return new TicTacToeGame(p1, p2);
            case CONNECT4:
                return new Connect4Game(p1, p2);
            case TOM_AND_JERRY:
                return new TomAndJerryGame(p1, p2);
            default:
                throw new IllegalArgumentException("Type " + type + " is not a multiplayer game");
        }
    }
}
