package com.gameon.builder;

import com.gameon.model.GameType;
import com.gameon.model.Player;
import com.gameon.model.Score;

/**
 * ScoreBuilder (Creational Builder Pattern)
 * Fluent creation of Score instances with parameter validation.
 */
public class ScoreBuilder {
    private String playerId;
    private String playerName;
    private GameType gameType;
    private int value;

    public ScoreBuilder setPlayer(Player player) {
        if (player != null) {
            this.playerId = player.getId();
            this.playerName = player.getName();
        }
        return this;
    }

    public ScoreBuilder setPlayerId(String playerId) {
        this.playerId = playerId;
        return this;
    }

    public ScoreBuilder setPlayerName(String playerName) {
        this.playerName = playerName;
        return this;
    }

    public ScoreBuilder setGameType(GameType gameType) {
        this.gameType = gameType;
        return this;
    }

    public ScoreBuilder setValue(int value) {
        this.value = Math.max(0, value);
        return this;
    }

    public Score build() {
        if (playerId == null || playerId.trim().isEmpty()) {
            throw new IllegalStateException("Player ID is required to build a Score");
        }
        if (playerName == null || playerName.trim().isEmpty()) {
            this.playerName = "Player-" + playerId;
        }
        if (gameType == null) {
            throw new IllegalStateException("GameType is required to build a Score");
        }
        return new Score(playerId, playerName, gameType, value);
    }
}
