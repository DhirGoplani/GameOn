package com.gameon.concurrency;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * WorkerThreadPool (Singleton & Resource Lifecycle Management)
 * Manages an asynchronous worker thread pool for background tasks, score processing, and simulation.
 * Implements graceful shutdown hooks for clean resource destruction (RAII equivalent in Java).
 */
public final class WorkerThreadPool implements AutoCloseable {
    private static volatile WorkerThreadPool instance;
    private final ExecutorService executor;
    private final AtomicBoolean isShutdown = new AtomicBoolean(false);

    private WorkerThreadPool() {
        int coreCount = Math.max(2, Runtime.getRuntime().availableProcessors());
        this.executor = Executors.newFixedThreadPool(coreCount, r -> {
            Thread t = new Thread(r, "GameOn-Worker-" + System.currentTimeMillis() % 1000);
            t.setDaemon(true);
            return t;
        });

        // Register JVM shutdown hook for clean resource disposal
        Runtime.getRuntime().addShutdownHook(new Thread(this::shutdownGracefully, "GameOn-ShutdownHook"));
    }

    /**
     * Thread-Safe Double-Checked Locking Singleton Pattern.
     */
    public static WorkerThreadPool getInstance() {
        if (instance == null) {
            synchronized (WorkerThreadPool.class) {
                if (instance == null) {
                    instance = new WorkerThreadPool();
                }
            }
        }
        return instance;
    }

    public void submit(Runnable task) {
        if (!isShutdown.get()) {
            executor.submit(task);
        }
    }

    public ExecutorService getExecutor() {
        return executor;
    }

    public void shutdownGracefully() {
        if (isShutdown.compareAndSet(false, true)) {
            executor.shutdown();
            try {
                if (!executor.awaitTermination(2, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    @Override
    public void close() {
        shutdownGracefully();
    }
}
