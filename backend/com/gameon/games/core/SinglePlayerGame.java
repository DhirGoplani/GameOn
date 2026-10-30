package com.gameon.games.core;

import com.gameon.model.GameResult;
import com.gameon.model.GameType;
import com.gameon.model.Player;
import com.gameon.observer.GameEvent;

import java.util.Collections;
import java.util.Objects;

/**
 * SinglePlayerGame Abstract Class
 * Demonstrates Hierarchical Inheritance and Single Responsibility for 1-player games.
 */
public abstract class SinglePlayerGame extends Game {
    private final Player player;

    public SinglePlayerGame(GameType gameType, Player player) {
        super(gameType);
        this.player = Objects.requireNonNull(player, "Player cannot be null");
    }

    public Player getPlayer() {
        return player;
    }

    @Override
    public String getPrimaryPlayerId() {
        return player.getId();
    }

    @Override
    protected void onGameOver() {
        player.incrementGamesPlayed();
        boolean isNewHigh = player.updateHighScore(getGameType(), getScore());
        if (isNewHigh) {
            getEventPublisher().publish(new GameEvent(
                GameEvent.Type.NEW_HIGH_SCORE,
                getGameId(),
                getGameType(),
                player.getId(),
                "New high score achieved: " + getScore(),
                getScore()
            ));
        }
    }

    @Override
    public GameResult getResult() {
        return new GameResult(
            getGameId(),
            getGameType(),
            player,
            Collections.singletonList(player),
            getScore(),
            false
        );
    }
}
