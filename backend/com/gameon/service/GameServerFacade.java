package com.gameon.service;

import com.gameon.concurrency.AsyncScoreProcessor;
import com.gameon.concurrency.ConcurrencyMetrics;
import com.gameon.concurrency.ConcurrentGameManager;
import com.gameon.concurrency.SessionLockManager;
import com.gameon.concurrency.WorkerThreadPool;
import com.gameon.exception.GameException;
import com.gameon.factory.GameFactory;
import com.gameon.games.core.Game;
import com.gameon.model.GameResult;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;
import com.gameon.model.Score;
import com.gameon.repository.LeaderboardRepository;
import com.gameon.repository.PlayerRepository;
import com.gameon.repository.SessionRepository;

import java.util.List;
import java.util.Optional;

/**
 * GameServerFacade (Structural Facade Pattern)
 * Provides a single, clean, cohesive architectural entry point for all client interactions,
 * shielding external consumers from subsystem complexity (concurrency locks, thread pools,
 * repositories, factories, state machines, and queues).
 */
public class GameServerFacade implements AutoCloseable {
    private final PlayerRepository playerRepository;
    private final LeaderboardRepository leaderboardRepository;
    private final SessionRepository sessionRepository;
    private final SessionLockManager lockManager;
    private final ConcurrencyMetrics metrics;
    private final AsyncScoreProcessor scoreProcessor;
    private final ConcurrentGameManager gameManager;
    private final PlayerService playerService;
    private final LeaderboardService leaderboardService;

    public GameServerFacade() {
        this.playerRepository = new PlayerRepository.InMemoryPlayerRepository();
        this.leaderboardRepository = new LeaderboardRepository.InMemoryLeaderboardRepository();
        this.sessionRepository = new SessionRepository.InMemorySessionRepository();
        this.lockManager = new SessionLockManager();
        this.metrics = new ConcurrencyMetrics();
        this.scoreProcessor = new AsyncScoreProcessor(leaderboardRepository, metrics);
        this.gameManager = new ConcurrentGameManager(sessionRepository, lockManager, scoreProcessor, metrics);
        this.playerService = new PlayerService(playerRepository);
        this.leaderboardService = new LeaderboardService(leaderboardRepository);
    }

    // --- Player Management ---
    public void registerPlayer(Player player) {
        playerService.registerPlayer(player);
    }

    public Player registerPlayer(String name, String email) throws GameException {
        return playerService.registerPlayer(name, email);
    }

    public Optional<Player> getPlayer(String id) {
        return playerService.getPlayer(id);
    }

    public List<Player> getAllPlayers() {
        return playerService.getAllPlayers();
    }

    // --- Game Session Management ---
    public Game createGame(GameType type, Player... players) {
        Game game = GameFactory.createGame(type, players);
        gameManager.registerSession(game);
        return game;
    }

    public void registerActiveGame(Game game) {
        gameManager.registerSession(game);
    }

    public Optional<Game> getActiveGame(String sessionId) {
        return sessionRepository.findById(sessionId);
    }

    // --- Turn Execution (Method Overloading) ---
    public boolean playTurn(String sessionId, Move move) throws GameException {
        return gameManager.executeTurn(sessionId, move);
    }

    public boolean playTurn(String sessionId, String direction) throws GameException {
        Game game = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new GameException("Session not found: " + sessionId));
        return playTurn(sessionId, new Move(game.getPrimaryPlayerId(), direction));
    }

    public boolean playTurn(String sessionId, int row, int col) throws GameException {
        Game game = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new GameException("Session not found: " + sessionId));
        return playTurn(sessionId, new Move(game.getPrimaryPlayerId(), row, col));
    }

    public GameResult completeGame(Game game) throws GameException {
        return gameManager.completeGame(game.getGameId());
    }

    public GameResult completeGame(String sessionId) throws GameException {
        return gameManager.completeGame(sessionId);
    }

    // --- Leaderboards ---
    public LeaderboardService getLeaderboardService() {
        return leaderboardService;
    }

    public List<Score> getTopScores(GameType type) {
        return leaderboardService.getTopScores(type);
    }

    public void displayLeaderboard(GameType type) {
        leaderboardService.printLeaderboard(type);
    }

    // --- Concurrency Metrics & Lifecycles ---
    public ConcurrencyMetrics getMetrics() {
        return metrics;
    }

    public void submitAsyncTask(Runnable task) {
        WorkerThreadPool.getInstance().submit(task);
    }

    @Override
    public void close() {
        scoreProcessor.close();
        WorkerThreadPool.getInstance().shutdownGracefully();
    }
}
