package com.gameon.interfaces;

import java.util.List;
import java.util.Optional;

/**
 * Generic Repository Pattern Interface
 * Demonstrates Abstraction, Generics, and the Repository Pattern for data access separation.
 *
 * @param <T>  The entity type
 * @param <ID> The entity identifier type
 */
public interface Repository<T, ID> {
    void save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    boolean deleteById(ID id);
    boolean existsById(ID id);
    long count();
}
