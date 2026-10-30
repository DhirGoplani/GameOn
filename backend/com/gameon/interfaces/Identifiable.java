package com.gameon.interfaces;

/**
 * Contract for any entity with a unique identifier.
 * Demonstrates Abstraction and Generics in Interface Design.
 *
 * @param <ID> The type of the unique identifier
 */
public interface Identifiable<ID> {
    ID getId();
}
