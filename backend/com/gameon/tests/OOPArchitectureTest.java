package com.gameon.tests;

import com.gameon.builder.PlayerBuilder;
import com.gameon.command.CommandInvoker;
import com.gameon.command.MoveCommand;
import com.gameon.factory.GameFactory;
import com.gameon.games.core.Game;
import com.gameon.games.core.MultiPlayerGame;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.games.singleplayer.Game2048;
import com.gameon.games.singleplayer.SnakeGame;
import com.gameon.games.singleplayer.TetrisGame;
import com.gameon.games.multiplayer.Connect4Game;
import com.gameon.games.multiplayer.TicTacToeGame;
import com.gameon.model.Coordinate;
import com.gameon.model.GameStatus;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;
import com.gameon.model.Score;
import com.gameon.observer.GameEvent;
import com.gameon.repository.PlayerRepository;
import com.gameon.strategy.ComboScoringStrategy;
import com.gameon.strategy.NormalScoringStrategy;
import com.gameon.strategy.TimeAttackScoringStrategy;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * OOPArchitectureTest
 * Validates all OOP concepts, SOLID design, behavioral patterns, and contracts.
 */
public class OOPArchitectureTest {

    public static void runAll() {
        System.out.println("--------------------------------------------------");
        System.out.println(">>> RUNNING: OOP Architecture & Design Tests <<<");
        System.out.println("--------------------------------------------------");

        testEncapsulationAndValidation();
        testCopyConstructorAndImmutability();
        testInheritanceHierarchies();
        testPolymorphismAndDynamicDispatch();
        testMethodOverloadingAndOverriding();
        testStatePatternLifecycle();
        testStrategyPatternScoring();
        testCommandPatternAndHistory();
        testObserverPatternEventBus();
        testBuilderPattern();
        testFactoryPatternAllTenGames();
        testRepositoryPattern();

        System.out.println("[PASS] All OOP Architecture Tests Passed Successfully!\n");
    }

    private static void assertEquals(Object expected, Object actual, String message) {
        if (expected == null && actual == null) return;
        if (expected != null && expected.equals(actual)) return;
        throw new AssertionError("Assertion Failed: " + message + " (Expected: " + expected + ", Got: " + actual + ")");
    }

    private static void assertTrue(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError("Assertion Failed: " + message);
        }
    }

    private static void testEncapsulationAndValidation() {
        Player p = new Player("p1", "Alice", "alice@gameon.app");
        assertEquals("p1", p.getId(), "Player ID getter");
        assertEquals("Alice", p.getName(), "Player name getter");
        assertEquals("alice@gameon.app", p.getEmail(), "Player email getter");

        p.setName("Alice Updated");
        assertEquals("Alice Updated", p.getName(), "Setter mutates state validly");

        p.setName(""); // Invalid name mutation should be rejected
        assertEquals("Alice Updated", p.getName(), "Setter rejects invalid empty name");

        // High scores defensive copying
        p.updateHighScore(GameType.SNAKE, 150);
        assertEquals(150, p.getHighScore(GameType.SNAKE), "High score updated");
        try {
            p.getHighScores().put(GameType.SNAKE, 9999);
            throw new AssertionError("Defensive copy failed; map was mutable");
        } catch (UnsupportedOperationException e) {
            // Expected: map is unmodifiable
        }
        System.out.println("  [OK] Encapsulation & Domain Invariants Verified");
    }

    private static void testCopyConstructorAndImmutability() {
        Coordinate c1 = new Coordinate(5, 10);
        Coordinate c2 = new Coordinate(c1);
        assertEquals(c1, c2, "Copy constructor produces equal object");
        assertTrue(c1 != c2, "Copy constructor creates distinct heap instance");

        Coordinate c3 = c1.translate(2, -3);
        assertEquals(7, c3.getX(), "Translation X");
        assertEquals(7, c3.getY(), "Translation Y");
        assertEquals(5, c1.getX(), "Original coordinate remains immutable");

        Score s1 = new Score("p1", "Alice", GameType.SNAKE, 250);
        Score s2 = new Score(s1);
        assertEquals(s1.getValue(), s2.getValue(), "Score copy constructor");
        assertTrue(s1 != s2, "Score copy is distinct instance");
        System.out.println("  [OK] Copy Constructors & Value Immutability Verified");
    }

    private static void testInheritanceHierarchies() {
        Player p1 = new Player("p1", "Alice");
        Player p2 = new Player("p2", "Bob");

        // Single inheritance: SinglePlayerGame extends Game
        SinglePlayerGame snake = (SinglePlayerGame) GameFactory.createSinglePlayerGame(GameType.SNAKE, p1);
        assertTrue(snake instanceof Game, "Snake is a Game (Polymorphic base)");
        assertTrue(snake instanceof SinglePlayerGame, "Snake is a SinglePlayerGame");

        // Multilevel inheritance: Tetris extends SinglePlayerGame extends Game
        TetrisGame tetris = new TetrisGame(p1);
        assertTrue(tetris instanceof SinglePlayerGame, "Tetris is SinglePlayerGame");
        assertTrue(tetris instanceof Game, "Tetris is Game");

        // Hierarchical inheritance: MultiPlayerGame extends Game
        MultiPlayerGame ttt = (MultiPlayerGame) GameFactory.createMultiPlayerGame(GameType.TICTACTOE, p1, p2);
        assertTrue(ttt instanceof Game, "TicTacToe is a Game");
        assertTrue(ttt instanceof MultiPlayerGame, "TicTacToe is a MultiPlayerGame");
        System.out.println("  [OK] Inheritance Hierarchies Verified (Single, Multilevel, Hierarchical)");
    }

    private static void testPolymorphismAndDynamicDispatch() {
        Player p1 = new Player("p1", "Alice");
        Player p2 = new Player("p2", "Bob");

        // Dynamic method dispatch through uniform Game interface reference
        Game[] games = new Game[]{
            GameFactory.createSinglePlayerGame(GameType.GAME_2048, p1),
            GameFactory.createSinglePlayerGame(GameType.SNAKE, p1),
            GameFactory.createMultiPlayerGame(GameType.TICTACTOE, p1, p2),
            GameFactory.createMultiPlayerGame(GameType.CONNECT4, p1, p2)
        };

        for (Game g : games) {
            g.start();
            assertEquals(GameStatus.RUNNING, g.getStatus(), "Polymorphic start()");
            assertTrue(g.isGameOver() == false, "Game is running");
            g.end();
            assertEquals(GameStatus.GAME_OVER, g.getStatus(), "Polymorphic end()");
        }
        System.out.println("  [OK] Polymorphism & Dynamic Method Dispatch Verified");
    }

    private static void testMethodOverloadingAndOverriding() {
        Player p1 = new Player("p1", "Alice");

        // Constructor overloading
        Player pOverload1 = new Player("id1", "Bob");
        Player pOverload2 = new Player("id2", "Charlie", "charlie@custom.org");
        assertTrue(pOverload1.getEmail().contains("@gameon.app"), "Overload 1 assigned default email");
        assertEquals("charlie@custom.org", pOverload2.getEmail(), "Overload 2 used explicit email");

        // Method Overriding: Turn execution on 2048
        Game2048 game2048 = new Game2048(p1);
        game2048.start();
        boolean turned = game2048.playTurn("UP"); // Overloaded playTurn(String)
        assertTrue(turned, "Turn executed via overloaded signature");

        // Method Overriding: Snake turn
        SnakeGame snake = new SnakeGame(p1);
        snake.start();
        snake.playTurn("RIGHT");
        assertTrue(snake.getScore() >= 0, "Overridden score update");
        System.out.println("  [OK] Method Overloading & Method Overriding Verified");
    }

    private static void testStatePatternLifecycle() {
        Player p = new Player("p1", "Alice");
        Game game = GameFactory.createSinglePlayerGame(GameType.GAME_2048, p);

        assertEquals(GameStatus.INITIALIZED, game.getStatus(), "Initial state");
        game.start();
        assertEquals(GameStatus.RUNNING, game.getStatus(), "Running state");
        game.pause();
        assertEquals(GameStatus.PAUSED, game.getStatus(), "Paused state");
        game.resume();
        assertEquals(GameStatus.RUNNING, game.getStatus(), "Resumed state");
        game.end();
        assertEquals(GameStatus.GAME_OVER, game.getStatus(), "Game over state");
        System.out.println("  [OK] State Pattern Lifecycle Transitions Verified");
    }

    private static void testStrategyPatternScoring() {
        Player p = new Player("p1", "Alice");
        Game game = GameFactory.createSinglePlayerGame(GameType.SNAKE, p);
        game.start();

        // Standard strategy
        game.setScoringStrategy(new NormalScoringStrategy());
        game.addScore(100);
        assertEquals(100, game.getScore(), "Normal scoring 1:1");

        // Combo multiplier strategy
        game.resetScore();
        game.setScoringStrategy(new ComboScoringStrategy());
        game.addScore(100); // 1st move (streak=0) -> 100
        game.addScore(100); // 2nd move (streak=1) -> 125 (total 225)
        assertTrue(game.getScore() >= 225, "Combo scoring applied multiplier on streak");

        // Time attack strategy
        game.resetScore();
        game.setScoringStrategy(new TimeAttackScoringStrategy());
        game.addScore(50);
        assertTrue(game.getScore() >= 50, "Time attack scoring");
        System.out.println("  [OK] Strategy Pattern Scoring Algorithms Verified");
    }

    private static void testCommandPatternAndHistory() {
        Player p = new Player("p1", "Alice");
        Game game = GameFactory.createSinglePlayerGame(GameType.GAME_2048, p);
        game.start();

        CommandInvoker invoker = new CommandInvoker();
        Move move1 = new Move("p1", "UP");
        Move move2 = new Move("p1", "LEFT");

        try {
            invoker.invoke(new MoveCommand(game, move1));
            invoker.invoke(new MoveCommand(game, move2));
            assertEquals(2, invoker.getHistory().size(), "Command history recorded 2 moves");
        } catch (Exception e) {
            throw new AssertionError("Command execution failed: " + e.getMessage());
        }
        System.out.println("  [OK] Command Pattern & Invocation History Verified");
    }

    private static void testObserverPatternEventBus() {
        Player p = new Player("p1", "Alice");
        Game game = GameFactory.createSinglePlayerGame(GameType.SNAKE, p);

        AtomicInteger eventCount = new AtomicInteger(0);
        game.getEventPublisher().addListener(event -> {
            eventCount.incrementAndGet();
        });

        game.start(); // Publishes GAME_STARTED
        game.addScore(10); // Publishes SCORE_AWARDED
        game.end(); // Publishes GAME_OVER

        assertTrue(eventCount.get() >= 3, "Observer received all lifecycle events");
        System.out.println("  [OK] Observer Pattern Real-Time Event Bus Verified");
    }

    private static void testBuilderPattern() {
        try {
            Player p = new PlayerBuilder()
                .setName("Dave")
                .setEmail("dave@gameon.app")
                .build();
            assertEquals("Dave", p.getName(), "Builder name");
            assertEquals("dave@gameon.app", p.getEmail(), "Builder email");
            assertTrue(p.getId().startsWith("p-"), "Builder generated ID");
        } catch (Exception e) {
            throw new AssertionError("Builder failed: " + e.getMessage());
        }
        System.out.println("  [OK] Builder Pattern Fluent Object Construction Verified");
    }

    private static void testFactoryPatternAllTenGames() {
        Player p1 = new Player("p1", "Alice");
        Player p2 = new Player("p2", "Bob");

        for (GameType type : GameType.values()) {
            Game game;
            if (type.isMultiplayer()) {
                game = GameFactory.createMultiPlayerGame(type, p1, p2);
            } else {
                game = GameFactory.createSinglePlayerGame(type, p1);
            }
            assertTrue(game != null, "Factory instantiated " + type);
            assertEquals(type, game.getGameType(), "GameType match");
        }
        System.out.println("  [OK] Factory Pattern Instantiation for All 10 Games Verified");
    }

    private static void testRepositoryPattern() {
        PlayerRepository repo = new PlayerRepository.InMemoryPlayerRepository();
        Player p1 = new Player("p1", "Alice");
        Player p2 = new Player("p2", "Bob");

        repo.save(p1);
        repo.save(p2);
        assertEquals(2L, repo.count(), "Repository count");
        assertTrue(repo.findById("p1").isPresent(), "Repository findById");
        assertTrue(repo.existsById("p2"), "Repository existsById");

        repo.deleteById("p1");
        assertEquals(1L, repo.count(), "Repository deleteById");
        System.out.println("  [OK] Generic Repository Pattern CRUD Verified");
    }
}
