package com.gameon.factory;

import com.gameon.games.core.Game;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.games.singleplayer.BlockodukoGame;
import com.gameon.games.singleplayer.DinoJumpGame;
import com.gameon.games.singleplayer.FlappyBirdGame;
import com.gameon.games.singleplayer.Game2048;
import com.gameon.games.singleplayer.SnakeGame;
import com.gameon.games.singleplayer.SudokuGame;
import com.gameon.games.singleplayer.TetrisGame;
import com.gameon.model.GameType;
import com.gameon.model.Player;

import java.util.List;
import java.util.Objects;

/**
 * SinglePlayerGameFactory (Concrete Factory for 1-Player Games)
 */
public class SinglePlayerGameFactory implements AbstractGameFactory {

    @Override
    public Game createGame(GameType type, List<Player> players) {
        if (players == null || players.isEmpty()) {
            throw new IllegalArgumentException("Single-player game requires at least 1 player");
        }
        return create(type, players.get(0));
    }

    public SinglePlayerGame create(GameType type, Player player) {
        Objects.requireNonNull(type, "GameType cannot be null");
        Objects.requireNonNull(player, "Player cannot be null");

        switch (type) {
            case GAME_2048:
                return new Game2048(player);
            case SNAKE:
                return new SnakeGame(player);
            case TETRIS:
                return new TetrisGame(player);
            case FLAPPY_BIRD:
                return new FlappyBirdGame(player);
            case SUDOKU:
                return new SudokuGame(player);
            case DINO_JUMP:
                return new DinoJumpGame(player);
            case BLOCKODUKO:
                return new BlockodukoGame(player);
            default:
                throw new IllegalArgumentException("Type " + type + " is not a single-player game");
        }
    }
}
