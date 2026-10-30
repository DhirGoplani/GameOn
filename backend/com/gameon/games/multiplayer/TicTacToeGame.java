package com.gameon.games.multiplayer;

import com.gameon.exception.GameException;
import com.gameon.exception.InvalidMoveException;
import com.gameon.games.core.MultiPlayerGame;
import com.gameon.model.Coordinate;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

import java.util.Arrays;
import java.util.List;

/**
 * TicTacToeGame: 2-Player 3x3 turn-based board game.
 * Demonstrates MultiPlayerGame inheritance, turn rotation, win checking, and draw resolution.
 */
public class TicTacToeGame extends MultiPlayerGame {
    private char[][] board;
    private int movesCount;

    public TicTacToeGame(Player player1, Player player2) {
        super(GameType.TICTACTOE, Arrays.asList(player1, player2), 2, 2);
    }

    public TicTacToeGame(List<Player> players) {
        super(GameType.TICTACTOE, players, 2, 2);
    }

    @Override
    protected void initializeGame() {
        this.board = new char[3][3];
        for (int r = 0; r < 3; r++) {
            Arrays.fill(board[r], '-');
        }
        this.movesCount = 0;
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        Coordinate pos = move.getCoordinate()
            .orElseThrow(() -> new InvalidMoveException("Tic-Tac-Toe requires coordinates"));

        int r = pos.getY();
        int c = pos.getX();

        if (r < 0 || r >= 3 || c < 0 || c >= 3) {
            throw new InvalidMoveException("Move out of bounds (3x3 board)");
        }
        if (board[r][c] != '-') {
            throw new InvalidMoveException(String.format("Cell (%d, %d) is already occupied", r, c));
        }

        Player current = getCurrentPlayer();
        if (!current.getId().equals(move.getPlayerId())) {
            throw new InvalidMoveException("It is not player " + move.getPlayerId() + "'s turn");
        }

        char symbol = (current == getPlayers().get(0)) ? 'X' : 'O';
        board[r][c] = symbol;
        movesCount++;

        if (checkWin(symbol)) {
            addScore(100);
            setWinner(current);
            end();
            return true;
        }

        if (movesCount == 9) {
            setDraw(true);
            end(); // Game draw
            return true;
        }

        nextTurn();
        return true;
    }

    private boolean checkWin(char s) {
        for (int i = 0; i < 3; i++) {
            if (board[i][0] == s && board[i][1] == s && board[i][2] == s) return true;
            if (board[0][i] == s && board[1][i] == s && board[2][i] == s) return true;
        }
        if (board[0][0] == s && board[1][1] == s && board[2][2] == s) return true;
        return board[0][2] == s && board[1][1] == s && board[2][0] == s;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        if (args.length < 2) {
            throw new InvalidMoveException("Tic-Tac-Toe requires row and col");
        }
        int row = (int) args[0];
        int col = (int) args[1];
        return applyMove(new Move(getCurrentPlayer().getId(), row, col));
    }

    @Override
    public void printGameState() {
        System.out.println("  Tic-Tac-Toe Board:");
        for (int r = 0; r < 3; r++) {
            System.out.printf("    %c | %c | %c%n", board[r][0], board[r][1], board[r][2]);
        }
    }

    public char[][] getBoardCopy() {
        char[][] copy = new char[3][3];
        for (int r = 0; r < 3; r++) {
            copy[r] = Arrays.copyOf(board[r], 3);
        }
        return copy;
    }
}
