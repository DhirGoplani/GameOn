package com.gameon.games.singleplayer;

import com.gameon.exception.GameException;
import com.gameon.games.core.SinglePlayerGame;
import com.gameon.model.Coordinate;
import com.gameon.model.GameType;
import com.gameon.model.Move;
import com.gameon.model.Player;

import java.util.LinkedList;
import java.util.Random;

/**
 * SnakeGame: Grid-based serpent navigation, food consumption, and growth.
 */
public class SnakeGame extends SinglePlayerGame {
    private final int gridWidth;
    private final int gridHeight;
    private final LinkedList<Coordinate> snake = new LinkedList<>();
    private Coordinate food;
    private String currentDirection = "RIGHT";
    private final Random random = new Random();

    public SnakeGame(Player player, int gridWidth, int gridHeight) {
        super(GameType.SNAKE, player);
        this.gridWidth = Math.max(10, gridWidth);
        this.gridHeight = Math.max(10, gridHeight);
    }

    public SnakeGame(Player player) {
        this(player, 20, 20);
    }

    @Override
    protected void initializeGame() {
        snake.clear();
        int midX = gridWidth / 2;
        int midY = gridHeight / 2;
        snake.add(new Coordinate(midX, midY));
        snake.add(new Coordinate(midX - 1, midY));
        snake.add(new Coordinate(midX - 2, midY));
        spawnFood();
    }

    private void spawnFood() {
        food = new Coordinate(random.nextInt(gridWidth), random.nextInt(gridHeight));
    }

    @Override
    protected boolean applyMove(Move move) throws GameException {
        if (move.getAction() != null) {
            this.currentDirection = move.getAction();
        }
        Coordinate head = snake.getFirst();
        Coordinate newHead;

        switch (currentDirection) {
            case "UP":
                newHead = head.translate(0, -1);
                break;
            case "DOWN":
                newHead = head.translate(0, 1);
                break;
            case "LEFT":
                newHead = head.translate(-1, 0);
                break;
            case "RIGHT":
            default:
                newHead = head.translate(1, 0);
                break;
        }

        // Wall collision check
        if (newHead.getX() < 0 || newHead.getX() >= gridWidth ||
            newHead.getY() < 0 || newHead.getY() >= gridHeight) {
            end();
            return false;
        }

        // Self-collision check
        if (snake.contains(newHead)) {
            end();
            return false;
        }

        snake.addFirst(newHead);
        if (newHead.equals(food)) {
            addScore(10);
            spawnFood();
        } else {
            snake.removeLast();
        }
        return true;
    }

    @Override
    protected boolean processRawTurn(Object... args) throws GameException {
        String dir = (args.length > 0 && args[0] != null) ? args[0].toString() : currentDirection;
        return applyMove(new Move(getPlayer().getId(), dir));
    }

    @Override
    public void printGameState() {
        System.out.printf("  Snake Game State: Length=%d, Score=%d, Head=%s, Food=%s%n",
            snake.size(), getScore(), snake.peekFirst(), food);
    }

    public int getSnakeLength() {
        return snake.size();
    }
}
