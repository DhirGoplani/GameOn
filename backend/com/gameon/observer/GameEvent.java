package com.gameon.observer;

import com.gameon.model.GameType;

import java.time.LocalDateTime;

/**
 * GameEvent (Value Object)
 * Represents an asynchronous domain notification within the gaming platform.
 */
public final class GameEvent {
    public enum Type {
        GAME_STARTED,
        MOVE_PLAYED,
        SCORE_AWARDED,
        NEW_HIGH_SCORE,
        GAME_OVER
    }

    private final Type type;
    private final String gameId;
    private final GameType gameType;
    private final String playerId;
    private final String message;
    private final int value;
    private final LocalDateTime timestamp;

    public GameEvent(Type type, String gameId, GameType gameType, String playerId, String message, int value) {
        this.type = type;
        this.gameId = gameId;
        this.gameType = gameType;
        this.playerId = playerId;
        this.message = message;
        this.value = value;
        this.timestamp = LocalDateTime.now();
    }

    public Type getType() { return type; }
    public String getGameId() { return gameId; }
    public GameType getGameType() { return gameType; }
    public String getPlayerId() { return playerId; }
    public String getMessage() { return message; }
    public int getValue() { return value; }
    public LocalDateTime getTimestamp() { return timestamp; }

    @Override
    public String toString() {
        return String.format("[%s] %s (Game: %s, Player: %s, Val: %d)",
            type, message, gameId, playerId, value);
    }
}
