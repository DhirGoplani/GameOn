package com.gameon.games.singleplayer;

import com.gameon.exception.GameException;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

/**
 * FlappyBirdGame: Physics-driven arcade obstacle navigation.
 */
public class FlappyBirdGame extends SinglePlayerGame {
    private double birdY;
    private double velocity;
    private int pipesPassed;
    private static final double GRAVITY = 1.2;
    private static final double JUMP_FORCE = -8.0;

    public FlappyBirdGame(Player player) {
        super(GameType.FLAPPY_BIRD, player);
    }

    @Override
    protected void initializeGame() {
        this.birdY = 250.0;
        this.velocity = 0.0;
        this.pipesPassed = 0;
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        if ("FLAP".equalsIgnoreCase(move.getAction()) || "JUMP".equalsIgnoreCase(move.getAction())) {
            this.velocity = JUMP_FORCE;
        } else {
            this.velocity += GRAVITY;
        }
        this.birdY += velocity;

        if (birdY <= 0 || birdY >= 600) {
            end();
            return false;
        }

        pipesPassed++;
        addScore(1);
        return true;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        String action = (args.length > 0 && args[0] != null) ? args[0].toString() : "FLAP";
        return applyMove(new Move(getPlayer().getId(), action));
    }

    @Override
    public void printGameState() {
        System.out.printf("  Flappy Bird State: Bird Y=%.1f, Velocity=%.1f, Pipes Passed=%d, Score=%d%n",
            birdY, velocity, pipesPassed, getScore());
    }

    public int getPipesPassed() {
        return pipesPassed;
    }
}
