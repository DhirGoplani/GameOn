package com.gameon.model;

/**
 * GameType Enum
 * Encapsulates game identity, metadata, player cardinality, and categories.
 */
public enum GameType {
    GAME_2048("2048", 1, 1, "Puzzle"),
    SNAKE("Snake", 1, 1, "Arcade"),
    TICTACTOE("Tic-Tac-Toe", 2, 2, "Board"),
    CONNECT4("Connect 4", 2, 2, "Board"),
    TETRIS("Tetris", 1, 1, "Puzzle"),
    FLAPPY_BIRD("Flappy Bird", 1, 1, "Arcade"),
    SUDOKU("Sudoku", 1, 1, "Logic"),
    DINO_JUMP("Dino Jump", 1, 1, "Action"),
    BLOCKODUKO("Blockoduko", 1, 1, "Puzzle"),
    TOM_AND_JERRY("Tom and Jerry", 2, 2, "Action");

    private final String displayName;
    private final int minPlayers;
    private final int maxPlayers;
    private final String category;

    GameType(String displayName, int minPlayers, int maxPlayers, String category) {
        this.displayName = displayName;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.category = category;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getMinPlayers() {
        return minPlayers;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public String getCategory() {
        return category;
    }

    public boolean isMultiplayer() {
        return maxPlayers > 1;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
