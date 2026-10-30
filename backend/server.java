package backend;

import com.gameon.builder.PlayerBuilder;
import com.gameon.command.MoveCommand;
import com.gameon.exception.GameException;
import com.gameon.factory.GameFactory;
import com.gameon.games.core.Game;
import com.gameon.games.core.MultiPlayerGame;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.GameResult;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;
import com.gameon.model.Score;
import com.gameon.repository.LeaderboardRepository;
import com.gameon.repository.PlayerRepository;
import com.gameon.service.GameServerFacade;
import com.gameon.service.LeaderboardService;
import com.gameon.strategy.ComboScoringStrategy;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================================
 * GAME ON - REFACTORED OOP BACKEND SERVER & DEMO FACADE
 * ============================================================================
 * Demonstrating complete Object-Oriented Architecture, SOLID Principles,
 * Design Patterns, and Concurrency & Thread-Safety:
 *
 * 1. THE 4 PILLARS OF OOP:
 *    - Encapsulation: Strict private state, defensive copies, domain invariants.
 *    - Abstraction: Clean interface contracts (Playable, Scorable, Repository).
 *    - Inheritance: Single (SinglePlayerGame -> Game), Multilevel (TetrisGame -> GridGame -> Game),
 *      and Hierarchical (10 concrete games branching from core abstractions).
 *    - Polymorphism: Compile-time overloading and runtime dynamic method dispatch.
 *
 * 2. DESIGN PATTERNS APPLIED:
 *    - Creational: Factory Method, Abstract Factory, Builder, Singleton.
 *    - Structural: Facade (GameServerFacade), Repository (Player/Leaderboard/Session).
 *    - Behavioral: State Pattern (GameState), Strategy Pattern (ScoringStrategy),
 *      Command Pattern (MoveCommand), Observer Pattern (GameEventPublisher).
 *
 * 3. CONCURRENCY & THREAD-SAFETY:
 *    - ConcurrentHashMap for thread-safe lock-free session and player maps.
 *    - ReentrantReadWriteLock for high-throughput concurrent leaderboard reads.
 *    - Fine-grained SessionLockManager (ReentrantLock) isolating per-match moves.
 *    - Producer-Consumer asynchronous score pipeline via BlockingQueue & Thread Pool.
 *    - Lock-free high-throughput metrics via AtomicLong and AtomicInteger.
 * ============================================================================
 */
public class server {
    private final GameServerFacade facade;

    public server() {
        this.facade = new GameServerFacade();
    }

    public void registerPlayer(Player player) {
        facade.registerPlayer(player);
        System.out.printf("[Server] Registered player: %s (%s)%n", player.getName(), player.getId());
    }

    public Player getPlayer(String id) {
        return facade.getPlayer(id).orElse(null);
    }

    public void registerActiveGame(Game game) {
        facade.registerActiveGame(game);
    }

    public void completeGame(Game game) {
        try {
            facade.completeGame(game);
        } catch (GameException e) {
            System.err.printf("[Server] Error completing game %s: %s%n", game.getGameId(), e.getMessage());
        }
    }

    public LeaderboardService getLeaderboard() {
        return facade.getLeaderboardService();
    }

    public GameServerFacade getFacade() {
        return facade;
    }

    // ------------------------------------------------------------------------
    // MAIN DEMO (COMPLETE OOP ARCHITECTURE & CONCURRENCY IN ACTION)
    // ------------------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("       GAME ON - OOP & CONCURRENCY BACKEND       ");
        System.out.println("=================================================\n");

        try (GameServerFacade server = new GameServerFacade()) {

            // 1. Builder Pattern & Encapsulation: Registering Players
            System.out.println(">>> 1. BUILDER PATTERN & ENCAPSULATION: REGISTERING PLAYERS <<<");
            Player alice = new PlayerBuilder()
                .setId("p1")
                .setName("Alice")
                .setEmail("alice@gameon.app")
                .build();

            Player bob = new PlayerBuilder()
                .setId("p2")
                .setName("Bob")
                .setEmail("bob@gameon.app")
                .build();

            server.registerPlayer(alice);
            server.registerPlayer(bob);
            System.out.printf("  [Registered] %s (%s)%n", alice.getName(), alice.getEmail());
            System.out.printf("  [Registered] %s (%s)%n%n", bob.getName(), bob.getEmail());

            // 2. Factory Pattern & Inheritance: Single-Player (2048) with Strategy Pattern
            System.out.println(">>> 2. FACTORY & STRATEGY PATTERNS: SINGLE-PLAYER (2048) <<<");
            Game game2048 = GameFactory.createSinglePlayerGame(GameType.GAME_2048, alice);
            game2048.setScoringStrategy(new ComboScoringStrategy()); // Strategy Pattern injected
            server.registerActiveGame(game2048);

            game2048.start();
            game2048.printGameState();
            game2048.playTurn("UP");
            game2048.playTurn("RIGHT");
            game2048.addScore(256);
            game2048.printGameState();
            server.completeGame(game2048);
            System.out.println();

            // 3. Command Pattern & Observer Pattern: Single-Player (Snake)
            System.out.println(">>> 3. COMMAND & OBSERVER PATTERNS: SINGLE-PLAYER (SNAKE) <<<");
            Game snake = GameFactory.createSinglePlayerGame(GameType.SNAKE, alice);
            server.registerActiveGame(snake);

            // Observer subscription
            snake.getEventPublisher().addListener(event -> {
                System.out.printf("  [Observer Event] %s -> %s%n", event.getType(), event.getMessage());
            });

            snake.start();
            // Command Pattern invocation
            snake.getCommandInvoker().invoke(new MoveCommand(snake, new Move(alice.getId(), "RIGHT")));
            snake.getCommandInvoker().invoke(new MoveCommand(snake, new Move(alice.getId(), "DOWN")));
            snake.printGameState();
            System.out.printf("  [Command History Size] %d move(s) recorded%n", snake.getCommandInvoker().getHistory().size());
            server.completeGame(snake);
            System.out.println();

            // 4. Multilevel Inheritance: Tetris
            System.out.println(">>> 4. MULTILEVEL INHERITANCE: SINGLE-PLAYER (TETRIS) <<<");
            Game tetris = GameFactory.createSinglePlayerGame(GameType.TETRIS, alice);
            server.registerActiveGame(tetris);
            tetris.start();
            tetris.playTurn("HARD_DROP");
            tetris.playTurn("LINE_CLEAR");
            tetris.printGameState();
            server.completeGame(tetris);
            System.out.println();

            // 5. Multiplayer Game: Turn Rotation & Dynamic Dispatch (Tic-Tac-Toe)
            System.out.println(">>> 5. MULTIPLAYER DYNAMIC DISPATCH: TIC-TAC-TOE <<<");
            Game ttt = GameFactory.createMultiPlayerGame(GameType.TICTACTOE, alice, bob);
            server.registerActiveGame(ttt);
            ttt.start();
            ttt.printGameState();

            // Turns: Alice (X), Bob (O)
            server.playTurn(ttt.getGameId(), new Move(alice.getId(), 0, 0));
            server.playTurn(ttt.getGameId(), new Move(bob.getId(), 1, 0));
            server.playTurn(ttt.getGameId(), new Move(alice.getId(), 0, 1));
            server.playTurn(ttt.getGameId(), new Move(bob.getId(), 1, 1));
            server.playTurn(ttt.getGameId(), new Move(alice.getId(), 0, 2)); // Alice completes row 0 -> Wins!
            ttt.printGameState();
            GameResult tttResult = server.completeGame(ttt);
            System.out.printf("  [Result] %s%n%n", tttResult);

            // 6. Multiplayer Game: Connect 4 with Column Drop Logic
            System.out.println(">>> 6. MULTIPLAYER BOARD GAME: CONNECT 4 <<<");
            Game c4 = GameFactory.createMultiPlayerGame(GameType.CONNECT4, alice, bob);
            server.registerActiveGame(c4);
            c4.start();
            server.playTurn(c4.getGameId(), new Move(alice.getId(), 3));
            server.playTurn(c4.getGameId(), new Move(bob.getId(), 3));
            server.playTurn(c4.getGameId(), new Move(alice.getId(), 4));
            c4.printGameState();
            server.completeGame(c4);
            System.out.println();

            // 7. Multiplayer Asymmetric Game: Tom and Jerry
            System.out.println(">>> 7. MULTIPLAYER ASYMMETRIC GAME: TOM AND JERRY <<<");
            Game tomJerry = GameFactory.createMultiPlayerGame(GameType.TOM_AND_JERRY, alice, bob);
            server.registerActiveGame(tomJerry);
            tomJerry.start();
            server.playTurn(tomJerry.getGameId(), new Move(alice.getId(), "RIGHT"));
            server.playTurn(tomJerry.getGameId(), new Move(bob.getId(), "LEFT"));
            tomJerry.printGameState();
            server.completeGame(tomJerry);
            System.out.println();

            // 8. Producer-Consumer Asynchronous Score Queue & Leaderboards
            System.out.println(">>> 8. CONCURRENCY: PRODUCER-CONSUMER QUEUE & LEADERBOARDS <<<");
            // Allow background score worker brief interval to drain queue
            Thread.sleep(150);

            server.displayLeaderboard(GameType.GAME_2048);
            server.displayLeaderboard(GameType.SNAKE);
            server.displayLeaderboard(GameType.TICTACTOE);
            server.displayLeaderboard(GameType.TETRIS);

            // 9. Concurrency Metrics Summary
            System.out.println(">>> 9. CONCURRENCY & THROUGHPUT METRICS <<<");
            System.out.printf("  %s%n", server.getMetrics());

            System.out.println("\nPlayer Profiles:");
            System.out.printf("  %s -> High Scores: %s, Total Games: %d%n",
                alice.getName(), alice.getHighScores(), alice.getTotalGamesPlayed());
            System.out.printf("  %s -> High Scores: %s, Total Games: %d%n",
                bob.getName(), bob.getHighScores(), bob.getTotalGamesPlayed());

            System.out.println("\n=================================================");
            System.out.println("       OOP BACKEND DEMO COMPLETED SUCCESSFULLY   ");
            System.out.println("=================================================");

        } catch (Exception e) {
            System.err.println("[FATAL ERROR] Server execution encountered an unexpected error:");
            e.printStackTrace();
        }
    }
}
