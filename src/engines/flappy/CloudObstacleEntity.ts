import { Entity, Hitbox } from './Entity';
import { BirdEntity } from './BirdEntity';

/**
 * ============================================================================
 * GAME ON - FLAPPY BIRD OOP ARCHITECTURE: CLOUD OBSTACLE ENTITY
 * ============================================================================
 * Floating aerial cloud obstacle positioned in the open spaces between pipes.
 *
 * Performance-Engineered:
 * - Fixed pre-baked dimensions (80x46)
 * - Gentle sinusoidal vertical float physics
 * - Tight fair hitbox (fluffy cloud margins forgiven)
 * - 100% GPU matrix translate positioning
 * ============================================================================
 */
export class CloudObstacleEntity extends Entity {
  public static readonly DEFAULT_WIDTH = 80;
  public static readonly DEFAULT_HEIGHT = 46;

  public floatPhase: number;
  public baseAltitudeY: number;

  constructor(id: string, startX: number = 2000, startY: number = 200) {
    super(id, startX, startY, CloudObstacleEntity.DEFAULT_WIDTH, CloudObstacleEntity.DEFAULT_HEIGHT);
    this.baseAltitudeY = startY;
    this.floatPhase = Math.random() * Math.PI * 2;
  }

  /**
   * Advances cloud horizontally with game scroll speed and gently bobs vertically.
   */
  public update(dt: number, speed: number = 2.8): void {
    this.x -= speed * dt;
    this.floatPhase += 0.035 * dt;
    this.y = this.baseAltitudeY + Math.sin(this.floatPhase) * 7;
  }

  /**
   * Calibrated fair hitbox (10px horizontal inset, 7px vertical inset)
   * so slight touches on the outer cloud mist do not trigger unfair deaths.
   */
  public override getHitbox(): Hitbox {
    const insetH = 10;
    const insetV = 7;
    return {
      x: this.x + insetH,
      y: this.y + insetV,
      width: this.width - insetH * 2,
      height: this.height - insetV * 2,
    };
  }

  /**
   * Tests AABB intersection with bird's calibrated hitbox.
   */
  public collidesWithBird(bird: BirdEntity): boolean {
    if (!this.active || bird.isDead) return false;
    const c = this.getHitbox();
    const b = bird.getHitbox();

    return (
      c.x < b.x + b.width &&
      c.x + c.width > b.x &&
      c.y < b.y + b.height &&
      c.y + c.height > b.y
    );
  }

  /**
   * Repositions cloud ahead in the queue at a new randomized altitude.
   */
  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.baseAltitudeY = y;
    this.active = true;
  }
}
