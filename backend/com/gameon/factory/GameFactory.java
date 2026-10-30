package com.gameon.factory;

import com.gameon.games.core.Game;
import com.gameon.games.core.MultiPlayerGame;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.GameType;
import com.gameon.model.Player;

import java.util.Arrays;
import java.util.List;

/**
 * GameFactory (Factory Facade & Creational Coordinator)
 * Demonstrates:
 * - Factory Method Pattern.
 * - Method Overloading: Polymorphic creation signatures.
 * - Backward compatibility with previous server.java signatures.
 */
public final class GameFactory {
    private static final SinglePlayerGameFactory SP_FACTORY = new SinglePlayerGameFactory();
    private static final MultiPlayerGameFactory MP_FACTORY = new MultiPlayerGameFactory();

    private GameFactory() {
        // Prevent instantiation of static utility class
    }

    /**
     * Factory Method 1: Single-player creation.
     */
    public static SinglePlayerGame createSinglePlayerGame(GameType type, Player player) {
        return SP_FACTORY.create(type, player);
    }

    /**
     * Factory Method 2: Multiplayer creation (2 players).
     */
    public static MultiPlayerGame createMultiPlayerGame(GameType type, Player p1, Player p2) {
        return MP_FACTORY.create(type, p1, p2);
    }

    /**
     * Factory Method 3: Method Overloading for dynamic player list dispatch.
     */
    public static Game createGame(GameType type, List<Player> players) {
        if (type.isMultiplayer()) {
            return MP_FACTORY.createGame(type, players);
        } else {
            return SP_FACTORY.createGame(type, players);
        }
    }

    /**
     * Factory Method 4: Method Overloading with varargs.
     */
    public static Game createGame(GameType type, Player... players) {
        return createGame(type, Arrays.asList(players));
    }
}
