import { BaseEngine } from '../BaseEngine';
import { BirdEntity } from './BirdEntity';
import { PipeObjectPool } from './PipeObjectPool';
import { PipePairEntity } from './PipePairEntity';
import { CloudObjectPool } from './CloudObjectPool';
import { CloudObstacleEntity } from './CloudObstacleEntity';

export type FlappyGameStatus = 'idle' | 'playing' | 'paused' | 'game_over';

export interface PipeSnapshot {
  id: string;
  x: number;
  gapY: number;
  gapSize: number;
  topTranslateY: number;
  bottomTranslateY: number;
  passed: boolean;
}

export interface CloudSnapshot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlappySnapshot {
  bird: {
    x: number;
    y: number;
    vy: number;
    rotation: number;
    frameIndex: number;
    isDead: boolean;
  };
  pipes: PipeSnapshot[];
  clouds: CloudSnapshot[];
  score: number;
  highScore: number;
  status: FlappyGameStatus;
}

/**
 * ============================================================================
 * GAME ON - FLAPPY BIRD OOP ENGINE
 * ============================================================================
 * Concrete game engine implementing BaseEngine with the 4 pillars of OOP:
 * - Abstraction: Exposes clean input, physics, and state methods.
 * - Encapsulation: Manages BirdEntity, PipeObjectPool, CloudObjectPool, and physics parameters privately.
 * - Inheritance: Extends BaseEngine<FlappySnapshot>.
 * - Polymorphism: Coordinates entities seamlessly via Entity contracts.
 * ============================================================================
 */
export class FlappyEngine extends BaseEngine<FlappySnapshot> {
  public static readonly BASE_SPEED = 2.8;
  public static readonly GROUND_HEIGHT = 78;

  private bird: BirdEntity;
  private pipePool: PipeObjectPool;
  private cloudPool: CloudObjectPool;
  private status: FlappyGameStatus = 'idle';
  private screenWidth: number = 390;
  private screenHeight: number = 844;
  private speed: number = FlappyEngine.BASE_SPEED;

  constructor(initialHighScore: number = 0) {
    super(initialHighScore);
    this.bird = new BirdEntity(80, 320);
    this.pipePool = new PipeObjectPool(4);
    this.cloudPool = new CloudObjectPool(4);
  }

  public getBird(): BirdEntity {
    return this.bird;
  }

  public getPipePool(): PipeObjectPool {
    return this.pipePool;
  }

  public getCloudPool(): CloudObjectPool {
    return this.cloudPool;
  }

  public getStatus(): FlappyGameStatus {
    return this.status;
  }

  public setDimensions(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    const birdX = Math.floor(Math.min(width * 0.24, 150));
    this.bird.x = birdX;
    this.speed = FlappyEngine.BASE_SPEED * Math.min(Math.max(width / 390, 0.95), 1.2);
  }

  public getState(): FlappySnapshot {
    return {
      bird: {
        x: this.bird.x,
        y: this.bird.y,
        vy: this.bird.vy,
        rotation: this.bird.rotation,
        frameIndex: this.bird.flapFrame,
        isDead: this.bird.isDead,
      },
      pipes: this.pipePool.getEntities().map((p) => ({
        id: p.id,
        x: p.x,
        gapY: p.gapY,
        gapSize: p.gapSize,
        topTranslateY: p.topTranslateY,
        bottomTranslateY: p.bottomTranslateY,
        passed: p.passed,
      })),
      clouds: this.cloudPool.getEntities().map((c) => ({
        id: c.id,
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
      })),
      score: this.score,
      highScore: this.highScore,
      status: this.status,
    };
  }

  /**
   * Starts or triggers flap action.
   */
  public flap(): boolean {
    if (this.status === 'game_over') return false;

    if (this.status === 'idle') {
      this.status = 'playing';
      const leadIn = Math.max(this.screenWidth * 0.9, 460);
      this.pipePool.initialize(leadIn, this.screenHeight, FlappyEngine.GROUND_HEIGHT);
      this.cloudPool.initialize(leadIn, PipeObjectPool.SPACING, this.screenHeight, FlappyEngine.GROUND_HEIGHT);
      this.bird.flap();
      this.notify();
      return true;
    }

    if (this.status === 'playing') {
      this.bird.flap();
      return true;
    }

    return false;
  }

  /**
   * Advances physics step over delta time (dt).
   * Returns event flags for audio/haptics without requiring React re-renders.
   */
  public tick(dt: number): { scored: boolean; gameOver: boolean } {
    if (this.status !== 'playing') {
      return { scored: false, gameOver: false };
    }

    // 1. Advance Bird Physics
    this.bird.update(dt);

    // 2. Floor or Ceiling collision
    const floorLimit = this.screenHeight - FlappyEngine.GROUND_HEIGHT - this.bird.height;
    if (this.bird.y < 0 || this.bird.y > floorLimit) {
      this.bird.y = Math.min(this.bird.y, floorLimit);
      this.triggerGameOver();
      return { scored: false, gameOver: true };
    }

    // 3. Update Pipe Pool & Check Pipe Collisions / Scoring
    this.pipePool.update(dt, this.speed, FlappyEngine.GROUND_HEIGHT);

    let scored = false;
    for (const pipe of this.pipePool.getEntities()) {
      if (pipe.collidesWithBird(this.bird)) {
        this.triggerGameOver();
        return { scored: false, gameOver: true };
      }

      if (pipe.checkPassed(this.bird.x, dt, this.speed)) {
        this.addScore(1);
        scored = true;
      }
    }

    // 4. Update Cloud Obstacle Pool & Check Cloud Collisions
    this.cloudPool.update(dt, this.speed, PipeObjectPool.SPACING, FlappyEngine.GROUND_HEIGHT);

    for (const cloud of this.cloudPool.getEntities()) {
      if (cloud.collidesWithBird(this.bird)) {
        this.triggerGameOver();
        return { scored: false, gameOver: true };
      }
    }

    if (scored) {
      this.notify();
    }

    return { scored, gameOver: false };
  }

  private triggerGameOver(): void {
    this.status = 'game_over';
    this.gameOver = true;
    this.bird.isDead = true;
    this.notify();
  }

  public togglePause(): void {
    if (this.status === 'game_over' || this.status === 'idle') return;
    this.status = this.status === 'paused' ? 'playing' : 'paused';
    this.notify();
  }

  public override reset(): void {
    this.status = 'idle';
    this.gameOver = false;
    this.score = 0;
    const birdX = Math.floor(Math.min(this.screenWidth * 0.24, 150));
    this.bird.reset(birdX, this.screenHeight * 0.42);
    this.pipePool.reset();
    this.cloudPool.reset();
    this.notify();
  }
}

