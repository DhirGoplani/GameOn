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
 * TomAndJerryGame: Asymmetric 2-Player Cat & Mouse Grid Chase Game.
 * Player 1 (Tom) attempts to catch Player 2 (Jerry). Jerry attempts to collect cheeses and reach the mouse hole.
 */
public class TomAndJerryGame extends MultiPlayerGame {
    private Coordinate tomPos;
    private Coordinate jerryPos;
    private int cheeseCollected;
    private int turnsElapsed;
    private static final int GRID_SIZE = 12;

    public TomAndJerryGame(Player player1, Player player2) {
        super(GameType.TOM_AND_JERRY, Arrays.asList(player1, player2), 2, 2);
    }

    public TomAndJerryGame(List<Player> players) {
        super(GameType.TOM_AND_JERRY, players, 2, 2);
    }

    @Override
    protected void initializeGame() {
        this.tomPos = new Coordinate(0, 0);
        this.jerryPos = new Coordinate(GRID_SIZE - 1, GRID_SIZE - 1);
        this.cheeseCollected = 0;
        this.turnsElapsed = 0;
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        Player current = getCurrentPlayer();
        if (!current.getId().equals(move.getPlayerId())) {
            throw new InvalidMoveException("Not your turn!");
        }

        String direction = move.getAction();
        boolean isTom = (current == getPlayers().get(0));
        Coordinate activePos = isTom ? tomPos : jerryPos;
        Coordinate nextPos;

        switch (direction) {
            case "UP":
                nextPos = activePos.translate(0, -1);
                break;
            case "DOWN":
                nextPos = activePos.translate(0, 1);
                break;
            case "LEFT":
                nextPos = activePos.translate(-1, 0);
                break;
            case "RIGHT":
            default:
                nextPos = activePos.translate(1, 0);
                break;
        }

        if (nextPos.getX() < 0 || nextPos.getX() >= GRID_SIZE ||
            nextPos.getY() < 0 || nextPos.getY() >= GRID_SIZE) {
            throw new InvalidMoveException("Move out of grid boundaries");
        }

        if (isTom) {
            this.tomPos = nextPos;
        } else {
            this.jerryPos = nextPos;
            cheeseCollected++;
            addScore(20);
        }

        turnsElapsed++;

        // Catch condition: Tom lands on Jerry
        if (tomPos.equals(jerryPos)) {
            addScore(200);
            setWinner(getPlayers().get(0)); // Tom wins
            end();
            return true;
        }

        // Jerry escape condition after collecting 5 cheeses
        if (cheeseCollected >= 5) {
            addScore(300);
            setWinner(getPlayers().get(1)); // Jerry wins
            end();
            return true;
        }

        nextTurn();
        return true;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        String dir = (args.length > 0 && args[0] != null) ? args[0].toString() : "RIGHT";
        return applyMove(new Move(getCurrentPlayer().getId(), dir));
    }

    @Override
    public void printGameState() {
        System.out.printf("  Tom and Jerry State: Tom=%s, Jerry=%s, Cheese Collected=%d, Turns=%d%n",
            tomPos, jerryPos, cheeseCollected, turnsElapsed);
    }

    public Coordinate getTomPos() { return tomPos; }
    public Coordinate getJerryPos() { return jerryPos; }
    public int getCheeseCollected() { return cheeseCollected; }
}
