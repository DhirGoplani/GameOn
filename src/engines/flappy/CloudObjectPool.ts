import { CloudObstacleEntity } from './CloudObstacleEntity';

/**
 * ============================================================================
 * GAME ON - FLAPPY BIRD OOP ARCHITECTURE: CLOUD OBJECT POOL
 * ============================================================================
 * Creational Object Pool Pattern for aerial Cloud Obstacles.
 * Pre-allocates static CloudObstacleEntity instances at startup so zero objects
 * are created or garbage-collected during active flight.
 * ============================================================================
 */
export class CloudObjectPool {
  public static readonly POOL_SIZE = 4;

  private readonly pool: CloudObstacleEntity[] = [];
  private screenHeight: number = 800;

  constructor(poolSize: number = CloudObjectPool.POOL_SIZE) {
    for (let i = 0; i < poolSize; i++) {
      this.pool.push(new CloudObstacleEntity(`cloud_obs_${i}`, 3000, 200));
    }
  }

  public getEntities(): readonly CloudObstacleEntity[] {
    return this.pool;
  }

  /**
   * Generates a fair randomized altitude for a cloud obstacle.
   * High enough to fly under, or low enough to flap over.
   */
  public generateRandomAltitude(screenHeight: number, groundHeight: number = 78): number {
    const minAlt = screenHeight * 0.16;
    const maxAlt = screenHeight - groundHeight - CloudObstacleEntity.DEFAULT_HEIGHT - screenHeight * 0.18;
    return minAlt + Math.random() * (maxAlt - minAlt);
  }

  /**
   * Initializes cloud positions midway between the pipe columns.
   */
  public initialize(firstPipeX: number, pipeSpacing: number, screenHeight: number, groundHeight: number = 78): void {
    this.screenHeight = screenHeight;
    for (let i = 0; i < this.pool.length; i++) {
      // Position each cloud midway between pipe pairs
      const cloudX = firstPipeX + i * pipeSpacing + pipeSpacing * 0.5;
      const alt = this.generateRandomAltitude(screenHeight, groundHeight);
      this.pool[i].reset(cloudX, alt);
    }
  }

  /**
   * Updates all active clouds and recycles any that have scrolled past left boundary.
   */
  public update(dt: number, speed: number, pipeSpacing: number, groundHeight: number = 78): void {
    for (let i = 0; i < this.pool.length; i++) {
      const cloud = this.pool[i];
      cloud.update(dt, speed);

      // Recycle cloud when completely off-screen left
      if (cloud.x < -CloudObstacleEntity.DEFAULT_WIDTH - 30) {
        let maxX = -Infinity;
        for (let j = 0; j < this.pool.length; j++) {
          if (this.pool[j].x > maxX) {
            maxX = this.pool[j].x;
          }
        }
        const nextX = maxX + pipeSpacing;
        const nextAlt = this.generateRandomAltitude(this.screenHeight, groundHeight);
        cloud.reset(nextX, nextAlt);
      }
    }
  }

  /**
   * Moves all clouds off-screen when resetting game.
   */
  public reset(): void {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].reset(3000 + i * 350, 200);
    }
  }
}
