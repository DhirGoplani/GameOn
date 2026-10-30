package com.gameon.games.core;

import com.gameon.command.CommandInvoker;
import com.gameon.exception.GameException;
import com.gameon.exception.InvalidMoveException;
import com.gameon.interfaces.Identifiable;
import com.gameon.interfaces.Playable;
import com.gameon.interfaces.Scorable;
import com.gameon.model.GameResult;
import com.gameon.model.GameStatus;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.observer.GameEvent;
import com.gameon.observer.GameEventPublisher;
import com.gameon.state.GameState;
import com.gameon.state.InitializedState;
import com.gameon.strategy.NormalScoringStrategy;
import com.gameon.strategy.ScoringStrategy;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Game Abstract Base Class
 * Demonstrates:
 * - Abstraction: Implements Playable, Scorable, and Identifiable.
 * - Template Method Pattern: Defines standard turn and lifecycle workflows with polymorphic hooks.
 * - State Pattern: Delegates lifecycle state to GameState interface.
 * - Strategy Pattern: Configurable ScoringStrategy.
 * - Command Pattern: Embedded CommandInvoker for move validation and history.
 * - Observer Pattern: Embedded GameEventPublisher for real-time notifications.
 */
public abstract class Game implements Playable, Scorable, Identifiable<String> {
    private final String gameId;
    private final GameType gameType;
    private GameState state;
    private int score;
    private int streak;
    private ScoringStrategy scoringStrategy;
    private final CommandInvoker commandInvoker;
    private final GameEventPublisher eventPublisher;
    private final LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    public Game(GameType gameType) {
        this.gameId = UUID.randomUUID().toString().substring(0, 8);
        this.gameType = Objects.requireNonNull(gameType, "GameType cannot be null");
        this.state = new InitializedState();
        this.score = 0;
        this.streak = 0;
        this.scoringStrategy = new NormalScoringStrategy();
        this.commandInvoker = new CommandInvoker();
        this.eventPublisher = new GameEventPublisher();
        this.createdAt = LocalDateTime.now();
    }

    @Override
    public String getId() {
        return gameId;
    }

    public String getGameId() {
        return gameId;
    }

    public GameType getGameType() {
        return gameType;
    }

    public GameStatus getStatus() {
        return state.getStatus();
    }

    public GameState getState() {
        return state;
    }

    public void transitionToState(GameState newState) {
        this.state = Objects.requireNonNull(newState, "New state cannot be null");
    }

    public ScoringStrategy getScoringStrategy() {
        return scoringStrategy;
    }

    public void setScoringStrategy(ScoringStrategy scoringStrategy) {
        if (scoringStrategy != null) {
            this.scoringStrategy = scoringStrategy;
        }
    }

    public CommandInvoker getCommandInvoker() {
        return commandInvoker;
    }

    public GameEventPublisher getEventPublisher() {
        return eventPublisher;
    }

    @Override
    public int getScore() {
        return score;
    }

    @Override
    public synchronized void addScore(int points) {
        if (points > 0) {
            int calculated = scoringStrategy.calculatePoints(points, streak, 0);
            this.score += calculated;
            this.streak++;
            eventPublisher.publish(new GameEvent(
                GameEvent.Type.SCORE_AWARDED,
                gameId,
                gameType,
                getPrimaryPlayerId(),
                "Points awarded: +" + calculated,
                this.score
            ));
        }
    }

    @Override
    public synchronized void resetScore() {
        this.score = 0;
        this.streak = 0;
    }

    protected void resetStreak() {
        this.streak = 0;
    }

    @Override
    public void start() {
        try {
            state.start(this);
            this.startedAt = LocalDateTime.now();
            initializeGame();
            eventPublisher.publish(new GameEvent(
                GameEvent.Type.GAME_STARTED,
                gameId,
                gameType,
                getPrimaryPlayerId(),
                "Game started",
                score
            ));
        } catch (GameException e) {
            System.err.printf("[%s] Cannot start: %s%n", gameType.getDisplayName(), e.getMessage());
        }
    }

    @Override
    public void pause() {
        try {
            state.pause(this);
        } catch (GameException e) {
            System.err.printf("[%s] Cannot pause: %s%n", gameType.getDisplayName(), e.getMessage());
        }
    }

    @Override
    public void resume() {
        try {
            state.resume(this);
        } catch (GameException e) {
            System.err.printf("[%s] Cannot resume: %s%n", gameType.getDisplayName(), e.getMessage());
        }
    }

    @Override
    public void end() {
        try {
            state.end(this);
            this.endedAt = LocalDateTime.now();
            onGameOver();
            eventPublisher.publish(new GameEvent(
                GameEvent.Type.GAME_OVER,
                gameId,
                gameType,
                getPrimaryPlayerId(),
                "Game concluded. Final score: " + score,
                score
            ));
        } catch (GameException e) {
            System.err.printf("[%s] Cannot end: %s%n", gameType.getDisplayName(), e.getMessage());
        }
    }

    @Override
    public boolean isGameOver() {
        return state.getStatus() == GameStatus.GAME_OVER;
    }

    /**
     * Executes a move turn with validation and event dispatching.
     * Demonstrates Method Overloading for multiple turn formats.
     */
    public synchronized boolean executeTurn(Move move) throws GameException {
        if (!state.canPlayTurn()) {
            throw new InvalidMoveException("Cannot execute turn: game is in " + state.getStatus() + " state");
        }
        boolean success = applyMove(move);
        if (success) {
            eventPublisher.publish(new GameEvent(
                GameEvent.Type.MOVE_PLAYED,
                gameId,
                gameType,
                move.getPlayerId(),
                "Move: " + move,
                score
            ));
        }
        return success;
    }

    /**
     * Method Overloading: Turn execution with variable arguments for compatibility.
     */
    public boolean playTurn(Object... turnArgs) {
        if (!state.canPlayTurn()) return false;
        try {
            return processRawTurn(turnArgs);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Method Overloading: Turn execution with direction string.
     */
    public boolean playTurn(String direction) {
        return playTurn((Object) direction);
    }

    /**
     * Method Overloading: Turn execution with coordinates.
     */
    public boolean playTurn(int x, int y) {
        return playTurn(x, y);
    }

    public void undoLastTurn() throws UnsupportedOperationException {
        throw new UnsupportedOperationException("Undo not implemented for game: " + gameType.getDisplayName());
    }

    // Template Methods for Subclass Specialization
    protected abstract void initializeGame();
    protected abstract void onGameOver();
    public abstract void printGameState();
    protected abstract boolean applyMove(Move move) throws GameException;
    protected abstract boolean processRawTurn(Object... args) throws GameException;
    public abstract String getPrimaryPlayerId();
    public abstract GameResult getResult();
}
