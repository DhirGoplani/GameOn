package com.gameon.games.singleplayer;

import com.gameon.exception.GameException;
import com.gameon.exception.InvalidMoveException;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.Coordinate;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

/**
 * SudokuGame: 9x9 Logic Grid Puzzle.
 * Demonstrates 2D array validation, sub-grid check, and rule enforcement.
 */
public class SudokuGame extends SinglePlayerGame {
    private final int[][] grid = new int[9][9];
    private int filledCells = 0;

    public SudokuGame(Player player) {
        super(GameType.SUDOKU, player);
    }

    @Override
    protected void initializeGame() {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                grid[r][c] = 0;
            }
        }
        // Seed standard clue cells
        grid[0][0] = 5;
        grid[1][1] = 3;
        grid[4][4] = 7;
        grid[8][8] = 9;
        filledCells = 4;
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        Coordinate coord = move.getCoordinate()
            .orElseThrow(() -> new InvalidMoveException("Coordinate required for Sudoku placement"));

        int r = coord.getY();
        int c = coord.getX();
        int val = move.getValue();

        if (r < 0 || r >= 9 || c < 0 || c >= 9) {
            throw new InvalidMoveException("Sudoku coordinates must be between 0 and 8");
        }
        if (val < 1 || val > 9) {
            throw new InvalidMoveException("Sudoku value must be between 1 and 9");
        }
        if (!isValidPlacement(r, c, val)) {
            throw new InvalidMoveException(String.format("Invalid move: %d conflicts with row, column, or 3x3 box", val));
        }

        grid[r][c] = val;
        filledCells++;
        addScore(15);

        if (filledCells >= 81) {
            addScore(1000); // completion bonus
            end();
        }
        return true;
    }

    private boolean isValidPlacement(int row, int col, int val) {
        // Check row and column
        for (int i = 0; i < 9; i++) {
            if (grid[row][i] == val) return false;
            if (grid[i][col] == val) return false;
        }
        // Check 3x3 box
        int boxRow = (row / 3) * 3;
        int boxCol = (col / 3) * 3;
        for (int r = 0; r < 3; r++) {
            for (int c = 0; c < 3; c++) {
                if (grid[boxRow + r][boxCol + c] == val) return false;
            }
        }
        return true;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        if (args.length < 3) {
            throw new InvalidMoveException("Sudoku turn requires row, col, and value");
        }
        int row = (int) args[0];
        int col = (int) args[1];
        int val = (int) args[2];
        return applyMove(new Move(getPlayer().getId(), new Coordinate(col, row), val));
    }

    @Override
    public void printGameState() {
        System.out.printf("  Sudoku State: Filled Cells=%d/81, Score=%d%n", filledCells, getScore());
    }

    public int getFilledCells() {
        return filledCells;
    }
}
