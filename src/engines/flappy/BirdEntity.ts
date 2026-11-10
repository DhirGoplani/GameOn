import { Entity, Hitbox } from './Entity';

/**
 * ============================================================================
 * GAME ON - FLAPPY BIRD OOP ARCHITECTURE: BIRD ENTITY
 * ============================================================================
 * Encapsulates bird kinematics, flap impulses, aerodynamic rotation,
 * and multi-frame animation state.
 * ============================================================================
 */
export class BirdEntity extends Entity {
  public static readonly DEFAULT_SIZE = 56;
  public static readonly GRAVITY = 0.36;
  public static readonly JUMP_FORCE = -7.4;
  public static readonly TERMINAL_VELOCITY = 11.0;

  public rotation: number = 0;
  public flapFrame: number = 1; // 0: Wing Up, 1: Wing Mid, 2: Wing Down
  private animTimer: number = 0;
  public isDead: boolean = false;

  constructor(startX: number = 80, startY: number = 300, size: number = BirdEntity.DEFAULT_SIZE) {
    super('bird_player', startX, startY, size, size);
  }

  /**
   * Applies an instantaneous upward flap impulse.
   */
  public flap(): void {
    if (this.isDead) return;
    this.vy = BirdEntity.JUMP_FORCE;
    this.rotation = -22;
    this.flapFrame = 0; // Snap to wing up immediately on flap
    this.animTimer = 0;
  }

  /**
   * Advances aerodynamic trajectory and rotation over dt.
   */
  public update(dt: number): void {
    if (this.isDead) {
      // Tumble down smoothly into ground
      this.rotation = Math.min(85, this.rotation + 8 * dt);
      return;
    }

    // Kinematic integration
    this.vy = Math.min(BirdEntity.TERMINAL_VELOCITY, this.vy + BirdEntity.GRAVITY * dt);
    this.y += this.vy * dt;

    // Aerodynamic tilt calculation
    if (this.vy < 0) {
      this.rotation = Math.max(-24, this.rotation - 6 * dt);
    } else if (this.vy < 2.0) {
      this.rotation = this.rotation + (-4 - this.rotation) * 0.14 * dt;
    } else {
      const diveTarget = Math.min(80, (this.vy - 2.0) * 12);
      this.rotation = this.rotation + (diveTarget - this.rotation) * 0.16 * dt;
    }

    // Wing flap cycling (advances based on physics velocity)
    this.animTimer += dt;
    const flapInterval = this.vy < 0 ? 4 : 8; // Flap faster when rising
    if (this.animTimer >= flapInterval) {
      this.animTimer = 0;
      this.flapFrame = (this.flapFrame + 1) % 3;
    }
  }

  /**
   * Tight hitbox margin (8px inset) for fair arcade gameplay collision detection.
   */
  public override getHitbox(): Hitbox {
    const insetH = 10;
    const insetV = 8;
    return {
      x: this.x + insetH,
      y: this.y + insetV,
      width: this.width - insetH * 2,
      height: this.height - insetV * 2,
    };
  }

  /**
   * Resets bird back to ready/hover state.
   */
  public reset(startX: number, startY: number): void {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.flapFrame = 1;
    this.animTimer = 0;
    this.isDead = false;
    this.active = true;
  }
}
