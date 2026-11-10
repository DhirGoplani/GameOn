import { PipePairEntity } from './PipePairEntity';

/**
 * ============================================================================
 * GAME ON - FLAPPY BIRD OOP ARCHITECTURE: PIPE OBJECT POOL
 * ============================================================================
 * Implements the Creational Object Pool Pattern.
 *
 * Solves the critical mobile latency problem:
 * - Pre-allocates a fixed array of PipePairEntity instances at startup.
 * - NEVER allocates, instantiates, or deletes objects during gameplay.
 * - Prevents JavaScript Garbage Collection (GC) pauses and micro-stutters.
 * ============================================================================
 */
export class PipeObjectPool {
  public static readonly POOL_SIZE = 4;
  public static readonly SPACING = 350; // Increased horizontal distance between pipes

  private readonly pool: PipePairEntity[] = [];
  private screenHeight: number = 800;
  private gapSize: number = PipePairEntity.DEFAULT_GAP;

  constructor(poolSize: number = PipeObjectPool.POOL_SIZE, gapSize: number = PipePairEntity.DEFAULT_GAP) {
    this.gapSize = gapSize;
    for (let i = 0; i < poolSize; i++) {
      this.pool.push(new PipePairEntity(`pipe_${i}`, 2000, 250, gapSize));
    }
  }

  /**
   * Returns all pre-allocated pipe instances in the pool.
   */
  public getEntities(): readonly PipePairEntity[] {
    return this.pool;
  }

  /**
   * Generates a fair randomized vertical gap position.
   */
  public generateRandomGapY(screenHeight: number, groundHeight: number = 78): number {
    const minGapY = screenHeight * 0.14;
    const maxGapY = screenHeight - groundHeight - this.gapSize - screenHeight * 0.12;
    return minGapY + Math.random() * (maxGapY - minGapY);
  }

  /**
   * Initializes pipe layout ahead of the player.
   */
  public initialize(leadInX: number, screenHeight: number, groundHeight: number = 78): void {
    this.screenHeight = screenHeight;
    for (let i = 0; i < this.pool.length; i++) {
      const pipeX = leadInX + i * PipeObjectPool.SPACING;
      const gapY = this.generateRandomGapY(screenHeight, groundHeight);
      this.pool[i].reset(pipeX, gapY, this.gapSize);
    }
  }

  /**
   * Updates all active pipes and recycles any that have scrolled past left boundary.
   */
  public update(dt: number, speed: number, groundHeight: number = 78): void {
    for (let i = 0; i < this.pool.length; i++) {
      const pipe = this.pool[i];
      pipe.update(dt, speed);

      // Recycle pipe when completely off-screen left
      if (pipe.x < -PipePairEntity.DEFAULT_WIDTH - 20) {
        let maxX = -Infinity;
        for (let j = 0; j < this.pool.length; j++) {
          if (this.pool[j].x > maxX) {
            maxX = this.pool[j].x;
          }
        }
        const jitter = (Math.random() - 0.5) * 16;
        const nextX = maxX + PipeObjectPool.SPACING + jitter;
        const nextGapY = this.generateRandomGapY(this.screenHeight, groundHeight);
        pipe.reset(nextX, nextGapY, this.gapSize);
      }
    }
  }

  /**
   * Resets all pipes far off-screen when resetting game.
   */
  public reset(): void {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].reset(3000 + i * PipeObjectPool.SPACING, 250, this.gapSize);
    }
  }
}
