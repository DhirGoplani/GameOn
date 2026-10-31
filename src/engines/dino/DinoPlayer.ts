import { Entity, Hitbox } from './Entity';

export type DinoPose = 'IDLE' | 'RUNNING' | 'JUMPING' | 'DUCKING' | 'DEAD';

/**
 * DinoPlayer Entity
 * Inherits from Entity and encapsulates player state, jump/duck mechanics,
 * gravity integration, and animation frame progression.
 */
export class DinoPlayer extends Entity {
  public static readonly GROUND_Y = 0;
  public static readonly GRAVITY = -0.95;
  public static readonly JUMP_FORCE = 15.5;
  public static readonly FAST_DROP_FORCE = -8.5;

  public pose: DinoPose = 'IDLE';
  public runFrame: number = 0;
  public duckFrame: number = 0;
  private frameTimer: number = 0;
  public isDucking: boolean = false;

  constructor(x: number = 40, y: number = 0) {
    super('dino-player', x, y, 72, 56);
    this.updateDimensions();
  }

  public updateDimensions(): void {
    if (this.pose === 'DUCKING') {
      this.width = 78;
      this.height = 32;
    } else if (this.pose === 'DEAD') {
      this.width = 78;
      this.height = 48;
    } else if (this.pose === 'JUMPING') {
      this.width = 64;
      this.height = 54;
    } else {
      // RUNNING or IDLE
      this.width = 72;
      this.height = 56;
    }
  }

  public update(dt: number): void {
    if (this.pose === 'DEAD') return;

    // Vertical Physics Integration
    if (this.y > DinoPlayer.GROUND_Y || this.vy !== 0) {
      this.y += this.vy * dt;
      this.vy += DinoPlayer.GRAVITY * dt;

      if (this.y <= DinoPlayer.GROUND_Y) {
        this.y = DinoPlayer.GROUND_Y;
        this.vy = 0;
        this.pose = this.isDucking ? 'DUCKING' : 'RUNNING';
      } else {
        this.pose = 'JUMPING';
      }
    } else {
      this.pose = this.isDucking ? 'DUCKING' : 'RUNNING';
    }
    this.updateDimensions();

    // 9-Frame Animation cadence (~16 fps stepping for fluid cartoon sprint)
    if (this.pose === 'RUNNING') {
      this.frameTimer += dt * 0.016;
      if (this.frameTimer >= 0.062) {
        this.frameTimer = 0;
        this.runFrame = (this.runFrame + 1) % 9;
        this.duckFrame = (this.duckFrame + 1) % 2;
      }
    }
  }

  public jump(): boolean {
    if (this.pose === 'DEAD') return false;
    if (this.y === DinoPlayer.GROUND_Y) {
      this.vy = DinoPlayer.JUMP_FORCE;
      this.pose = 'JUMPING';
      this.updateDimensions();
      return true;
    }
    return false;
  }

  public duck(isDown: boolean): void {
    if (this.pose === 'DEAD') return;
    this.isDucking = isDown;
    if (isDown) {
      if (this.y > DinoPlayer.GROUND_Y) {
        // Fast drop when player swipes down in mid-air
        this.vy += DinoPlayer.FAST_DROP_FORCE;
      } else {
        this.pose = 'DUCKING';
      }
    } else if (this.y === DinoPlayer.GROUND_Y) {
      this.pose = 'RUNNING';
    }
    this.updateDimensions();
  }

  public die(): void {
    this.pose = 'DEAD';
    this.vy = 0;
    this.updateDimensions();
  }

  public override getHitbox(): Hitbox {
    if (this.pose === 'DUCKING') {
      return {
        x: this.x + 8,
        y: this.y,
        width: 58,
        height: 28,
      };
    }
    // Standing / Jumping hitbox for Red T-Rex
    return {
      x: this.x + 12,
      y: this.y + 4,
      width: 46,
      height: 48,
    };
  }

  public override reset(x: number = 40, y: number = 0): void {
    super.reset(x, y);
    this.pose = 'IDLE';
    this.runFrame = 0;
    this.duckFrame = 0;
    this.frameTimer = 0;
    this.isDucking = false;
    this.updateDimensions();
  }
}
