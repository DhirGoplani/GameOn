import { Entity, Hitbox } from './Entity';

export type ObstacleKind = 'cactus' | 'bird';

/**
 * Abstract Base Obstacle Entity
 * Extends Entity to handle ambient speed translation and despawning.
 */
export abstract class Obstacle extends Entity {
  public abstract readonly kind: ObstacleKind;
  public passed: boolean = false;

  constructor(id: string, x: number, y: number, width: number, height: number) {
    super(id, x, y, width, height);
  }

  public override update(dt: number, speed: number = 6): void {
    this.x -= speed * dt;
    if (this.x + this.width < -100) {
      this.active = false;
    }
  }
}

/**
 * Cactus Obstacle Entity
 */
export type CactusVariant = 'small' | 'double' | 'large';

export class CactusObstacle extends Obstacle {
  public readonly kind: ObstacleKind = 'cactus';
  public readonly variant: CactusVariant;

  constructor(id: string, x: number, variant: CactusVariant = 'small') {
    let width = 28;
    let height = 44;
    if (variant === 'double') {
      width = 52;
      height = 44;
    } else if (variant === 'large') {
      width = 36;
      height = 54;
    }

    super(id, x, 0, width, height);
    this.variant = variant;
  }

  public override getHitbox(): Hitbox {
    return {
      x: this.x + 6,
      y: this.y,
      width: this.width - 12,
      height: this.height - 4,
    };
  }
}

/**
 * Bird (Pterodactyl) Obstacle Entity
 * Flaps wings between two frames and flies at Low or High altitudes.
 */
export type BirdAltitude = 'low' | 'high';

export class BirdObstacle extends Obstacle {
  public readonly kind: ObstacleKind = 'bird';
  public readonly altitude: BirdAltitude;
  public wingPhase: 0 | 1 = 0;
  private wingTimer: number = 0;

  constructor(id: string, x: number, altitude: BirdAltitude = 'low') {
    // low altitude requires jump; high altitude requires duck
    const y = altitude === 'high' ? 36 : 10;
    super(id, x, y, 48, 32);
    this.altitude = altitude;
  }

  public override update(dt: number, speed: number = 6): void {
    // Birds glide slightly faster than ground speed
    super.update(dt, speed * 1.08);

    // Flap wings smoothly
    this.wingTimer += dt * 0.016;
    if (this.wingTimer >= 0.14) {
      this.wingTimer = 0;
      this.wingPhase = this.wingPhase === 0 ? 1 : 0;
    }
  }

  public override getHitbox(): Hitbox {
    return {
      x: this.x + 8,
      y: this.y + 6,
      width: this.width - 16,
      height: this.height - 12,
    };
  }
}

/**
 * ObstacleFactory (Factory Design Pattern)
 * Encapsulates dynamic creation and difficulty scaling for obstacle encounters.
 */
export class ObstacleFactory {
  private static counter = 0;

  public static create(spawnX: number, score: number): Obstacle {
    const id = `obs-${++this.counter}`;
    const rand = Math.random();

    // After score 200, birds start appearing
    if (score > 180 && rand < 0.35) {
      const isHigh = Math.random() > 0.5;
      return new BirdObstacle(id, spawnX, isHigh ? 'high' : 'low');
    }

    // Cactus variations
    if (rand < 0.40) {
      return new CactusObstacle(id, spawnX, 'small');
    } else if (rand < 0.75) {
      return new CactusObstacle(id, spawnX, 'double');
    } else {
      return new CactusObstacle(id, spawnX, 'large');
    }
  }
}
