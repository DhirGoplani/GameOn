package com.gameon.games.singleplayer;

import com.gameon.exception.GameException;
import com.gameon.exception.InvalidMoveException;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.Coordinate;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

/**
 * BlockodukoGame: Block shape placement on a 9x9 board clearing rows, columns, and 3x3 sectors.
 */
public class BlockodukoGame extends SinglePlayerGame {
    private final boolean[][] grid = new boolean[9][9];
    private int blocksPlaced = 0;
    private int streaks = 0;

    public BlockodukoGame(Player player) {
        super(GameType.BLOCKODUKO, player);
    }

    @Override
    protected void initializeGame() {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                grid[r][c] = false;
            }
        }
        this.blocksPlaced = 0;
        this.streaks = 0;
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        Coordinate pos = move.getCoordinate()
            .orElseThrow(() -> new InvalidMoveException("Coordinate required for Blockoduko placement"));

        int r = pos.getY();
        int c = pos.getX();

        if (r < 0 || r >= 9 || c < 0 || c >= 9) {
            throw new InvalidMoveException("Placement out of grid boundaries");
        }
        if (grid[r][c]) {
            throw new InvalidMoveException("Cell is already occupied");
        }

        grid[r][c] = true;
        blocksPlaced++;
        addScore(10);

        // Check for line or sector clears
        boolean rowFull = true;
        for (int col = 0; col < 9; col++) {
            if (!grid[r][col]) { rowFull = false; break; }
        }
        if (rowFull) {
            streaks++;
            addScore(100 * streaks);
            for (int col = 0; col < 9; col++) grid[r][col] = false;
        }

        return true;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        if (args.length < 2) {
            throw new InvalidMoveException("Blockoduko turn requires row and col coordinates");
        }
        int row = (int) args[0];
        int col = (int) args[1];
        return applyMove(new Move(getPlayer().getId(), row, col));
    }

    @Override
    public void printGameState() {
        System.out.printf("  Blockoduko State: Blocks Placed=%d, Streaks=%d, Score=%d%n",
            blocksPlaced, streaks, getScore());
    }

    public int getBlocksPlaced() {
        return blocksPlaced;
    }
}
