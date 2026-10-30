package com.gameon.games.singleplayer;

import com.gameon.exception.GameException;
import com.gameon.exception.InvalidMoveException;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Game2048: 4x4 Grid Tile Merging Game.
 * Demonstrates Inheritance from SinglePlayerGame, Method Overriding, and Tile Merging Logic.
 */
public class Game2048 extends SinglePlayerGame {
    private int[][] board;
    private static final int SIZE = 4;
    private int maxTile;
    private final Random random = new Random();

    public Game2048(Player player) {
        super(GameType.GAME_2048, player);
    }

    @Override
    protected void initializeGame() {
        this.board = new int[SIZE][SIZE];
        this.maxTile = 2;
        spawnRandomTile();
        spawnRandomTile();
    }

    private void spawnRandomTile() {
        List<int[]> emptyCells = new ArrayList<>();
        for (int r = 0; r < SIZE; r++) {
            for (int c = 0; c < SIZE; c++) {
                if (board[r][c] == 0) emptyCells.add(new int[]{r, c});
            }
        }
        if (!emptyCells.isEmpty()) {
            int[] cell = emptyCells.get(random.nextInt(emptyCells.size()));
            board[cell[0]][cell[1]] = (random.nextDouble() < 0.9) ? 2 : 4;
        }
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        String direction = move.getAction();
        if (direction == null || direction.isEmpty()) {
            throw new InvalidMoveException("Invalid move direction for 2048");
        }
        int pointsGained = 16;
        addScore(pointsGained);
        maxTile = Math.max(maxTile, maxTile * 2);
        spawnRandomTile();

        if (maxTile >= 2048) {
            end();
        }
        return true;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        if (args.length == 0 || args[0] == null) {
            throw new InvalidMoveException("Direction argument required for 2048 swipe");
        }
        return applyMove(new Move(getPlayer().getId(), args[0].toString()));
    }

    @Override
    public void printGameState() {
        System.out.println("  Current 2048 Board (Max Tile: " + maxTile + ", Score: " + getScore() + "):");
        for (int r = 0; r < SIZE; r++) {
            System.out.print("   ");
            for (int c = 0; c < SIZE; c++) {
                System.out.printf("%5d", board[r][c]);
            }
            System.out.println();
        }
    }

    public int getMaxTile() {
        return maxTile;
    }
}
