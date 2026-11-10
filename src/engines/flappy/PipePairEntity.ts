import { Entity, Hitbox } from './Entity';
import { BirdEntity } from './BirdEntity';

/**
 * ============================================================================
 * GAME ON - FLAPPY BIRD OOP ARCHITECTURE: PIPE PAIR ENTITY
 * ============================================================================
 * Encapsulates an obstacle column consisting of an inverted top pipe and
 * an upright bottom pipe.
 *
 * Performance-Engineered for Pure GPU Matrix Transforms:
 * - Fixed pre-baked texture height (TEXTURE_HEIGHT = 800px)
 * - Zero dynamic layout changes to 'height' or 'top'
 * - Hardware transforms:
 *     Top Pipe:    translateY = gapY - TEXTURE_HEIGHT
 *     Bottom Pipe: translateY = gapY + gapSize
 * ============================================================================
 */
export class PipePairEntity extends Entity {
  public static readonly DEFAULT_WIDTH = 66;
  public static readonly DEFAULT_GAP = 195;
  public static readonly TEXTURE_HEIGHT = 800;

  public gapY: number;
  public gapSize: number;
  public passed: boolean = false;

  constructor(
    id: string,
    x: number,
    gapY: number,
    gapSize: number = PipePairEntity.DEFAULT_GAP,
    width: number = PipePairEntity.DEFAULT_WIDTH
  ) {
    super(id, x, 0, width, 0);
    this.gapY = gapY;
    this.gapSize = gapSize;
  }

  /**
   * Top pipe GPU translateY position.
   */
  public get topTranslateY(): number {
    return this.gapY - PipePairEntity.TEXTURE_HEIGHT;
  }

  /**
   * Bottom pipe GPU translateY position.
   */
  public get bottomTranslateY(): number {
    return this.gapY + this.gapSize;
  }

  /**
   * Moves obstacle leftward based on game speed and delta time.
   */
  public update(dt: number, speed: number = 2.8): void {
    this.x -= speed * dt;
  }

  /**
   * Tests whether bird has successfully traversed past this pipe column.
   */
  public checkPassed(birdX: number, dt: number, speed: number = 2.8): boolean {
    if (!this.passed && this.x + this.width < birdX) {
      this.passed = true;
      return true;
    }
    return false;
  }

  /**
   * Tests collision against bird hitbox for both top pipe and bottom pipe.
   */
  public collidesWithBird(bird: BirdEntity): boolean {
    if (!this.active || bird.isDead) return false;
    const b = bird.getHitbox();

    // Check horizontal overlap first (fast fail)
    const pipeLeft = this.x + 4;
    const pipeRight = this.x + this.width - 4;
    const birdLeft = b.x;
    const birdRight = b.x + b.width;

    if (birdRight <= pipeLeft || birdLeft >= pipeRight) {
      return false;
    }

    // Horizontal overlap detected! Check vertical collision with pipes
    const topObstacleBottom = this.gapY;
    const bottomObstacleTop = this.gapY + this.gapSize;

    // Bird hits top pipe
    if (b.y < topObstacleBottom) {
      return true;
    }

    // Bird hits bottom pipe
    if (b.y + b.height > bottomObstacleTop) {
      return true;
    }

    return false;
  }

  /**
   * Repositions pipe pair ahead in the queue with a fresh gap opening.
   */
  public reset(x: number, gapY: number, gapSize: number = PipePairEntity.DEFAULT_GAP): void {
    this.x = x;
    this.gapY = gapY;
    this.gapSize = gapSize;
    this.passed = false;
    this.active = true;
  }
}
