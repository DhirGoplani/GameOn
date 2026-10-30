package com.gameon.service;

import com.gameon.builder.PlayerBuilder;
import com.gameon.exception.PlayerValidationException;
import com.gameon.model.Player;
import com.gameon.repository.PlayerRepository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * PlayerService
 * Business logic service encapsulating player registration, profile updates, and lookups.
 */
public class PlayerService {
    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = Objects.requireNonNull(playerRepository, "PlayerRepository cannot be null");
    }

    public Player registerPlayer(String name, String email) throws PlayerValidationException {
        Player player = new PlayerBuilder()
            .setName(name)
            .setEmail(email)
            .build();
        playerRepository.save(player);
        return player;
    }

    public Player registerPlayer(String name) throws PlayerValidationException {
        return registerPlayer(name, null);
    }

    public void registerPlayer(Player player) {
        if (player != null) {
            playerRepository.save(player);
        }
    }

    public Optional<Player> getPlayer(String id) {
        return playerRepository.findById(id);
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }
}
