/**
 * ============================================================================
 * GAME ON - DINO RUNNER OOP ARCHITECTURE: BASE ENTITY
 * ============================================================================
 * Abstract Base Class Entity providing core physical properties,
 * transformation logic, bounding hitboxes, and collision detection.
 * ============================================================================
 */

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export abstract class Entity {
  public readonly id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public vx: number = 0;
  public vy: number = 0;
  public active: boolean = true;

  constructor(id: string, x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Advances entity state by delta time (dt).
   * @param dt Time multiplier (1.0 = ~16.6ms at 60fps)
   * @param speed Optional ambient game scroll speed
   */
  public abstract update(dt: number, speed?: number): void;

  /**
   * Returns the axis-aligned bounding box (AABB) for collision detection.
   * Can be overridden by subclasses to provide tight hitbox margins.
   */
  public getHitbox(): Hitbox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Checks AABB collision against another entity.
   */
  public collidesWith(other: Entity): boolean {
    if (!this.active || !other.active) return false;
    const a = this.getHitbox();
    const b = other.getHitbox();

    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Computes horizontal distance to another entity.
   */
  public distanceTo(other: Entity): number {
    return other.x - (this.x + this.width);
  }

  public reset(x: number = 0, y: number = 0): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.active = true;
  }
}
