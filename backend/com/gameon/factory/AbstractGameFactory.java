package com.gameon.factory;

import com.gameon.games.core.Game;
import com.gameon.model.GameType;
import com.gameon.model.Player;

import java.util.List;

/**
 * AbstractGameFactory (Abstract Factory Pattern)
 * Defines the contract for family factories producing game instances.
 */
public interface AbstractGameFactory {
    Game createGame(GameType type, List<Player> players);
}
