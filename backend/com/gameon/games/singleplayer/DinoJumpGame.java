package com.gameon.games.singleplayer;

import com.gameon.exception.GameException;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

/**
 * DinoJumpGame: Endless obstacle jumper runner.
 */
public class DinoJumpGame extends SinglePlayerGame {
    private boolean isJumping;
    private int distanceTraveled;
    private int obstaclesDodged;

    public DinoJumpGame(Player player) {
        super(GameType.DINO_JUMP, player);
    }

    @Override
    protected void initializeGame() {
        this.isJumping = false;
        this.distanceTraveled = 0;
        this.obstaclesDodged = 0;
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        if ("JUMP".equalsIgnoreCase(move.getAction())) {
            this.isJumping = true;
            obstaclesDodged++;
            addScore(20);
        } else {
            this.isJumping = false;
            distanceTraveled += 10;
            addScore(2);
        }
        return true;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        String action = (args.length > 0 && args[0] != null) ? args[0].toString() : "RUN";
        return applyMove(new Move(getPlayer().getId(), action));
    }

    @Override
    public void printGameState() {
        System.out.printf("  Dino Jump State: Distance=%dm, Obstacles Dodged=%d, Score=%d%n",
            distanceTraveled, obstaclesDodged, getScore());
    }

    public int getObstaclesDodged() {
        return obstaclesDodged;
    }
}
