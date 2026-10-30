package com.gameon.builder;

import com.gameon.exception.PlayerValidationException;
import com.gameon.model.Player;

import java.util.UUID;

/**
 * PlayerBuilder (Creational Builder Pattern)
 * Provides fluent, validated construction of Player objects with sensible defaults.
 */
public class PlayerBuilder {
    private String id;
    private String name;
    private String email;

    public PlayerBuilder() {
        this.id = "p-" + UUID.randomUUID().toString().substring(0, 6);
    }

    public PlayerBuilder setId(String id) {
        this.id = id;
        return this;
    }

    public PlayerBuilder setName(String name) {
        this.name = name;
        return this;
    }

    public PlayerBuilder setEmail(String email) {
        this.email = email;
        return this;
    }

    public Player build() throws PlayerValidationException {
        if (name == null || name.trim().isEmpty()) {
            throw new PlayerValidationException("Player name is mandatory for Player construction");
        }
        if (id == null || id.trim().isEmpty()) {
            this.id = "p-" + UUID.randomUUID().toString().substring(0, 6);
        }
        if (email == null || email.trim().isEmpty()) {
            this.email = name.trim().toLowerCase().replaceAll("\\s+", ".") + "@gameon.app";
        }
        return new Player(id, name, email);
    }
}
