import { BaseEngine } from '../BaseEngine';
import { DinoPlayer, DinoPose } from './DinoPlayer';
import { Obstacle, ObstacleFactory, ObstacleKind, CactusVariant, BirdAltitude } from './Obstacle';

export interface DinoObstacleSnapshot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: ObstacleKind;
  variant?: CactusVariant;
  altitude?: BirdAltitude;
  wingPhase?: number;
}

export interface DinoEngineSnapshot {
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    pose: DinoPose;
    runFrame: number;
    duckFrame: number;
  };
  obstacles: DinoObstacleSnapshot[];
  score: number;
  highScore: number;
  speed: number;
  gameOver: boolean;
  gameStarted: boolean;
  distance: number;
}

/**
 * ============================================================================
 * DINO RUNNER OOP ENGINE
 * ============================================================================
 * Concrete game engine implementing BaseEngine adhering to the 4 pillars of OOP:
 * - Abstraction: Exposes clean tick/input controls, hides physics integration.
 * - Encapsulation: Manages player instance, obstacle array, and difficulty state internally.
 * - Inheritance: Extends BaseEngine<DinoEngineSnapshot>.
 * - Polymorphism: Handles heterogeneous Obstacle subclasses seamlessly via Entity.
 * ============================================================================
 */
export class DinoEngine extends BaseEngine<DinoEngineSnapshot> {
  private static readonly BASE_SPEED = 6.0;
  private static readonly MAX_SPEED = 14.5;
  private static readonly SPEED_ACCEL = 0.0015;

  private player: DinoPlayer;
  private obstacles: Obstacle[] = [];
  private speed: number = DinoEngine.BASE_SPEED;
  private distance: number = 0;
  private gameStarted: boolean = false;
  private nextSpawnDistance: number = 300;

  constructor(initialHighScore: number = 0) {
    super(initialHighScore);
    this.player = new DinoPlayer(40, 0);
  }

  public getState(): DinoEngineSnapshot {
    return {
      player: {
        x: this.player.x,
        y: this.player.y,
        width: this.player.width,
        height: this.player.height,
        pose: this.player.pose,
        runFrame: this.player.runFrame,
        duckFrame: this.player.duckFrame,
      },
      obstacles: this.obstacles.map((obs) => ({
        id: obs.id,
        x: obs.x,
        y: obs.y,
        width: obs.width,
        height: obs.height,
        kind: obs.kind,
        variant: (obs as any).variant,
        altitude: (obs as any).altitude,
        wingPhase: (obs as any).wingPhase,
      })),
      score: this.score,
      highScore: this.highScore,
      speed: this.speed,
      gameOver: this.gameOver,
      gameStarted: this.gameStarted,
      distance: this.distance,
    };
  }

  public getPlayer(): DinoPlayer {
    return this.player;
  }

  public getObstacles(): readonly Obstacle[] {
    return this.obstacles;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public start(): void {
    if (this.gameStarted) return;
    this.reset();
    this.gameStarted = true;
    this.player.pose = 'RUNNING';
    this.player.updateDimensions();
    this.notify();
  }

  public reset(): void {
    this.player.reset(40, 0);
    this.obstacles = [];
    this.speed = DinoEngine.BASE_SPEED;
    this.distance = 0;
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.nextSpawnDistance = 350;
    this.notify();
  }

  public jump(): boolean {
    if (this.gameOver) return false;
    if (!this.gameStarted) {
      this.start();
    }
    const jumped = this.player.jump();
    if (jumped) this.notify();
    return jumped;
  }

  public duck(isDown: boolean): void {
    if (this.gameOver || !this.gameStarted) return;
    this.player.duck(isDown);
    this.notify();
  }

  /**
   * Main game tick executed on animation frame.
   * @param dt Frame delta time
   * @param screenWidth Viewport width for spawning
   */
  public tick(dt: number = 1.0, screenWidth: number = 380): boolean {
    if (this.gameOver || !this.gameStarted) return false;

    // 1. Advance Game Distance & Speed
    this.distance += this.speed * dt;
    this.speed = Math.min(DinoEngine.MAX_SPEED, this.speed + DinoEngine.SPEED_ACCEL * dt);

    // 2. Score Increment (1 point per 4 distance units)
    this.setScore(Math.floor(this.distance / 4));

    // 3. Update Player Physics & Animation
    this.player.update(dt);

    // 4. Update & Prune Obstacles
    for (const obs of this.obstacles) {
      obs.update(dt, this.speed);
    }
    this.obstacles = this.obstacles.filter((obs) => obs.active);

    // 5. Spawning Logic via Factory
    const rightmostX = this.obstacles.length > 0
      ? Math.max(...this.obstacles.map((o) => o.x))
      : 0;

    if (this.obstacles.length === 0 || rightmostX < screenWidth + 100) {
      if (screenWidth + 250 - rightmostX > this.nextSpawnDistance) {
        const spawnX = Math.max(screenWidth + 40, rightmostX + this.nextSpawnDistance);
        const newObs = ObstacleFactory.create(spawnX, this.score);
        this.obstacles.push(newObs);

        // Calculate dynamic randomized gap for next obstacle based on current speed
        const minGap = 260 + this.speed * 12;
        const maxGap = minGap + 180 + this.speed * 8;
        this.nextSpawnDistance = minGap + Math.random() * (maxGap - minGap);
      }
    }

    // 6. Collision Detection (Polymorphic AABB)
    for (const obs of this.obstacles) {
      if (this.player.collidesWith(obs)) {
        this.player.die();
        this.gameOver = true;
        this.notify();
        return true; // Collision occurred
      }
    }

    return false;
  }
}
