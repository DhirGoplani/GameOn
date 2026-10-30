package com.gameon.games.multiplayer;

import com.gameon.exception.GameException;
import com.gameon.exception.InvalidMoveException;
import com.gameon.games.core.MultiPlayerGame;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

import java.util.Arrays;
import java.util.List;

/**
 * Connect4Game: 2-Player 6x7 vertical disc drop board game.
 * Demonstrates 4-in-a-row alignment evaluation across rows, columns, and diagonals.
 */
public class Connect4Game extends MultiPlayerGame {
    private static final int ROWS = 6;
    private static final int COLS = 7;
    private char[][] grid;
    private int movesCount;

    public Connect4Game(Player player1, Player player2) {
        super(GameType.CONNECT4, Arrays.asList(player1, player2), 2, 2);
    }

    public Connect4Game(List<Player> players) {
        super(GameType.CONNECT4, players, 2, 2);
    }

    @Override
    protected void initializeGame() {
        this.grid = new char[ROWS][COLS];
        for (int r = 0; r < ROWS; r++) {
            Arrays.fill(grid[r], '.');
        }
        this.movesCount = 0;
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        int col = move.getValue();
        if (col < 0 || col >= COLS) {
            throw new InvalidMoveException("Connect 4 column must be between 0 and " + (COLS - 1));
        }

        Player current = getCurrentPlayer();
        if (!current.getId().equals(move.getPlayerId())) {
            throw new InvalidMoveException("It is not player " + move.getPlayerId() + "'s turn");
        }

        char token = (current == getPlayers().get(0)) ? 'R' : 'Y';

        // Drop token to lowest open row
        int placedRow = -1;
        for (int r = ROWS - 1; r >= 0; r--) {
            if (grid[r][col] == '.') {
                grid[r][col] = token;
                placedRow = r;
                movesCount++;
                break;
            }
        }

        if (placedRow == -1) {
            throw new InvalidMoveException("Column " + col + " is completely full");
        }

        addScore(25);

        if (checkWin(placedRow, col, token)) {
            addScore(150);
            setWinner(current);
            end();
            return true;
        }

        if (movesCount >= ROWS * COLS) {
            setDraw(true);
            end();
            return true;
        }

        nextTurn();
        return true;
    }

    private boolean checkWin(int r, int c, char token) {
        // Horizontal, Vertical, Diagonal checks
        int[][] directions = {{0, 1}, {1, 0}, {1, 1}, {1, -1}};
        for (int[] d : directions) {
            int count = 1;
            // forward
            for (int step = 1; step < 4; step++) {
                int nr = r + d[0] * step;
                int nc = c + d[1] * step;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] == token) count++;
                else break;
            }
            // backward
            for (int step = 1; step < 4; step++) {
                int nr = r - d[0] * step;
                int nc = c - d[1] * step;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] == token) count++;
                else break;
            }
            if (count >= 4) return true;
        }
        return false;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        if (args.length < 1) {
            throw new InvalidMoveException("Connect 4 turn requires column index");
        }
        int col = (int) args[0];
        return applyMove(new Move(getCurrentPlayer().getId(), col));
    }

    @Override
    public void printGameState() {
        System.out.println("  Connect 4 Grid (Top to Bottom):");
        for (int r = 0; r < ROWS; r++) {
            System.out.print("    ");
            for (int c = 0; c < COLS; c++) {
                System.out.print(grid[r][c] + " ");
            }
            System.out.println();
        }
    }
}
