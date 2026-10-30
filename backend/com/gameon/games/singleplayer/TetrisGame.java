package com.gameon.games.singleplayer;

import com.gameon.exception.GameException;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

import java.util.Arrays;

/**
 * TetrisGame: Falling tetromino block placement and line clearing puzzle.
 * Demonstrates SinglePlayerGame inheritance, line clear calculations, and score multipliers.
 */
public class TetrisGame extends SinglePlayerGame {
    private final int rows = 20;
    private final int cols = 10;
    private int[][] matrix;
    private int linesCleared;

    public TetrisGame(Player player) {
        super(GameType.TETRIS, player);
    }

    @Override
    protected void initializeGame() {
        this.matrix = new int[rows][cols];
        for (int r = 0; r < rows; r++) {
            Arrays.fill(matrix[r], 0);
        }
        this.linesCleared = 0;
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        // Simulates dropping a tetromino block
        String action = move.getAction();
        int points = 40;
        if ("HARD_DROP".equalsIgnoreCase(action)) {
            points = 100;
            linesCleared++;
            addScore(points);
        } else if ("LINE_CLEAR".equalsIgnoreCase(action)) {
            linesCleared += 4; // Tetris!
            points = 800;
            addScore(points);
        } else {
            addScore(points);
        }
        return true;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        String action = (args.length > 0 && args[0] != null) ? args[0].toString() : "DROP";
        return applyMove(new Move(getPlayer().getId(), action));
    }

    @Override
    public void printGameState() {
        System.out.printf("  Tetris Game State: Score=%d, Lines Cleared=%d, Matrix=%dx%d%n",
            getScore(), linesCleared, rows, cols);
    }

    public int getLinesCleared() {
        return linesCleared;
    }
}
