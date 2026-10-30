package com.gameon.games.core;

import com.gameon.model.GameResult;
import com.gameon.model.GameType;
import com.gameon.model.Player;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * MultiPlayerGame Abstract Class
 * Demonstrates Hierarchical Inheritance and Turn Orchestration for multi-participant games.
 */
public abstract class MultiPlayerGame extends Game {
    private final List<Player> players;
    private int currentTurnIndex;
    private Player winner;
    private boolean draw;

    public MultiPlayerGame(GameType gameType, List<Player> players, int minPlayers, int maxPlayers) {
        super(gameType);
        if (players == null || players.size() < minPlayers || players.size() > maxPlayers) {
            throw new IllegalArgumentException(String.format(
                "Game %s requires between %d and %d players.",
                gameType.getDisplayName(), minPlayers, maxPlayers));
        }
        for (Player p : players) {
            Objects.requireNonNull(p, "Player in multiplayer roster cannot be null");
        }
        this.players = new ArrayList<>(players);
        this.currentTurnIndex = 0;
        this.winner = null;
        this.draw = false;
    }

    public List<Player> getPlayers() {
        return Collections.unmodifiableList(players);
    }

    public Player getCurrentPlayer() {
        return players.get(currentTurnIndex);
    }

    public void nextTurn() {
        currentTurnIndex = (currentTurnIndex + 1) % players.size();
    }

    public Player getWinner() {
        return winner;
    }

    protected void setWinner(Player winner) {
        this.winner = winner;
    }

    public boolean isDraw() {
        return draw;
    }

    protected void setDraw(boolean draw) {
        this.draw = draw;
    }

    @Override
    public String getPrimaryPlayerId() {
        return (winner != null) ? winner.getId() : getCurrentPlayer().getId();
    }

    @Override
    protected void onGameOver() {
        for (Player p : players) {
            p.incrementGamesPlayed();
        }
        if (winner != null) {
            winner.updateHighScore(getGameType(), getScore());
        }
    }

    @Override
    public GameResult getResult() {
        return new GameResult(
            getGameId(),
            getGameType(),
            winner,
            players,
            getScore(),
            draw
        );
    }
}
