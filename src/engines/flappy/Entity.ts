/**
 * ============================================================================
 * GAME ON - FLAPPY BIRD OOP ARCHITECTURE: BASE ENTITY
 * ============================================================================
 * Abstract Base Class Entity providing core physical properties,
 * transformation logic, bounding hitboxes, and collision detection.
 * Adheres to Object-Oriented Principles:
 * - Abstraction: Common kinematic properties (x, y, vx, vy, width, height)
 * - Polymorphism: Overridable update() and getHitbox() methods
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
   * Advances entity state by delta time multiplier (dt).
   * 1.0 represents nominal ~16.67ms (60 FPS) frame step.
   */
  public abstract update(dt: number, speed?: number): void;

  /**
   * Returns Axis-Aligned Bounding Box (AABB) for collision calculation.
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
   * Performs standard AABB intersection test against another active entity.
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
}
