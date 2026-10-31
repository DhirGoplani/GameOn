import { BaseEngine } from './BaseEngine';
import { PacmanDirection } from '../components/pacman/PacmanSprite';
import { GhostColor } from '../components/pacman/GhostSprite';

export { PacmanDirection } from '../components/pacman/PacmanSprite';

export interface PacmanMazePos {
  r: number;
  c: number;
}

export type PacmanDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type PacmanStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export interface GhostEntity {
  id: number;
  color: GhostColor;
  r: number;
  c: number;
  dir: PacmanDirection;
  spawnPos: PacmanMazePos;
  isFrightened: boolean;
  isEaten: boolean;
  releaseDelay: number;
}

export interface PacmanEntity {
  r: number;
  c: number;
  dir: PacmanDirection;
  nextDir: PacmanDirection | null;
  frame: number;
}

export interface PacmanState {
  maze: number[][];
  pacman: PacmanEntity;
  ghosts: GhostEntity[];
  frightenedTicks: number;
  frightenedMultiplier: number;
  dotsRemaining: number;
  cherry: { r: number; c: number; active: boolean };
  lives: number;
  isInvulnerable: boolean;
  score: number;
  highScore: number;
  difficulty: PacmanDifficulty;
  status: PacmanStatus;
}

const HALF_MAZE: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2],
  [2, 2, 2, 0, 1, 0, 2, 0, 0, 0, 2], // col 10 is door
  [2, 2, 2, 2, 1, 2, 2, 0, 4, 4, 4], // ghost house
  [2, 2, 2, 0, 1, 0, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0],
  [0, 3, 1, 0, 1, 1, 1, 1, 1, 1, 1], // pacman starts at 16, 10
  [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export class PacmanEngine extends BaseEngine<PacmanState> {
  public static readonly ROWS = 21;
  public static readonly COLS = 21;
  public static readonly TUNNEL_ROW = 10;
  public static readonly PACMAN_START: PacmanMazePos = { r: 16, c: 10 };

  private maze: number[][] = [];
  private pacman: PacmanEntity = {
    r: 16,
    c: 10,
    dir: 'LEFT',
    nextDir: null,
    frame: 0,
  };

  private ghosts: GhostEntity[] = [];
  private frightenedTicks = 0;
  private frightenedMultiplier = 200;
  private dotsRemaining = 0;
  private cherry: { r: number; c: number; active: boolean } = { r: 12, c: 10, active: false };
  private cherrySpawnCountdown = 40;
  private lives = 3;
  private ghostStepCounter = 0;
  private invulnerableTicks = 20;
  private difficulty: PacmanDifficulty = 'MEDIUM';
  private status: PacmanStatus = 'idle';

  constructor(initialHighScore: number = 0) {
    super(initialHighScore);
    this.maze = this.createDefaultMaze();
    this.ghosts = this.createDefaultGhosts();
  }

  public getState(): PacmanState {
    return {
      maze: this.maze.map((row) => [...row]),
      pacman: { ...this.pacman },
      ghosts: this.ghosts.map((g) => ({ ...g })),
      frightenedTicks: this.frightenedTicks,
      frightenedMultiplier: this.frightenedMultiplier,
      dotsRemaining: this.dotsRemaining,
      cherry: { ...this.cherry },
      lives: this.lives,
      isInvulnerable: this.invulnerableTicks > 0,
      score: this.score,
      highScore: this.highScore,
      difficulty: this.difficulty,
      status: this.status,
    };
  }

  public startGame(diff: PacmanDifficulty = this.difficulty): void {
    this.difficulty = diff;
    this.maze = this.createDefaultMaze();
    this.countDots();
    this.pacman = {
      r: PacmanEngine.PACMAN_START.r,
      c: PacmanEngine.PACMAN_START.c,
      dir: 'LEFT',
      nextDir: null,
      frame: 0,
    };
    this.ghosts = this.createDefaultGhosts();
    this.frightenedTicks = 0;
    this.frightenedMultiplier = 200;
    this.cherry = { r: 12, c: 10, active: false };
    this.cherrySpawnCountdown = 40;
    this.lives = 3;
    this.ghostStepCounter = 0;
    this.invulnerableTicks = 20;
    this.score = 0;
    this.gameOver = false;
    this.status = 'playing';
    this.notify();
  }

  public reset(): void {
    this.startGame(this.difficulty);
  }

  public setDifficulty(diff: PacmanDifficulty): void {
    this.difficulty = diff;
    this.notify();
  }

  public togglePause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
      this.notify();
    } else if (this.status === 'paused') {
      this.status = 'playing';
      this.notify();
    }
  }

  public setDirection(dir: PacmanDirection): void {
    if (this.status !== 'playing') return;

    // Check if direction can be applied immediately
    const delta = this.dirDelta(dir);
    const nr = this.pacman.r + delta.dr;
    const nc = this.pacman.c + delta.dc;

    if (this.canPass(nr, nc)) {
      this.pacman.dir = dir;
      this.pacman.nextDir = null;
    } else {
      // Buffer the turn
      this.pacman.nextDir = dir;
    }
    this.notify();
  }

  /**
   * Main game tick: moves Pac-Man and ticks ghosts
   */
  public tick(): {
    ateDot: boolean;
    atePower: boolean;
    ateGhost: boolean;
    ateCherry: boolean;
    lostLife: boolean;
    won: boolean;
  } {
    if (this.status !== 'playing') {
      return {
        ateDot: false,
        atePower: false,
        ateGhost: false,
        ateCherry: false,
        lostLife: false,
        won: false,
      };
    }

    let ateDot = false;
    let atePower = false;
    let ateGhost = false;
    let ateCherry = false;
    let lostLife = false;
    let won = false;

    // 1. Tick timers
    this.ghostStepCounter++;
    if (this.invulnerableTicks > 0) {
      this.invulnerableTicks--;
    }

    if (this.frightenedTicks > 0) {
      this.frightenedTicks--;
      if (this.frightenedTicks === 0) {
        this.ghosts.forEach((g) => {
          g.isFrightened = false;
          g.isEaten = false;
        });
      }
    }

    // 2. Cherry spawning logic
    if (!this.cherry.active) {
      this.cherrySpawnCountdown--;
      if (this.cherrySpawnCountdown <= 0) {
        this.cherry.active = true;
        this.cherrySpawnCountdown = 80;
      }
    }

    // 3. Move Pac-Man
    // Check if buffered turn is now possible
    if (this.pacman.nextDir) {
      const turnDelta = this.dirDelta(this.pacman.nextDir);
      const testR = this.pacman.r + turnDelta.dr;
      const testC = this.pacman.c + turnDelta.dc;
      if (this.canPass(testR, testC)) {
        this.pacman.dir = this.pacman.nextDir;
        this.pacman.nextDir = null;
      }
    }

    const curDelta = this.dirDelta(this.pacman.dir);
    let nextR = this.pacman.r + curDelta.dr;
    let nextC = this.pacman.c + curDelta.dc;

    // Handle tunnel wrapping at row 10
    if (this.pacman.r === PacmanEngine.TUNNEL_ROW) {
      if (nextC < 0) nextC = PacmanEngine.COLS - 1;
      else if (nextC >= PacmanEngine.COLS) nextC = 0;
    }

    if (this.canPass(nextR, nextC)) {
      this.pacman.r = nextR;
      this.pacman.c = nextC;
      this.pacman.frame = (this.pacman.frame + 1) % 4;

      // Check tile content
      const cellValue = this.maze[nextR][nextC];
      if (cellValue === 1) {
        // Normal Dot
        this.maze[nextR][nextC] = 2; // Marked visited / empty path
        this.dotsRemaining--;
        this.addScore(10);
        ateDot = true;
      } else if (cellValue === 3) {
        // Power Pellet
        this.maze[nextR][nextC] = 2;
        this.dotsRemaining--;
        this.addScore(50);
        atePower = true;
        this.frightenedTicks = this.difficulty === 'EASY' ? 35 : this.difficulty === 'MEDIUM' ? 26 : 18;
        this.frightenedMultiplier = 200;
        this.ghosts.forEach((g) => {
          if (!g.isEaten) g.isFrightened = true;
        });
      }

      // Check Cherry
      if (this.cherry.active && this.pacman.r === this.cherry.r && this.pacman.c === this.cherry.c) {
        this.cherry.active = false;
        this.addScore(500);
        ateCherry = true;
      }
    }

    // 4. Check Ghost collision before ghost movement
    const colPre = this.checkGhostCollisions();
    if (colPre.ateGhost) ateGhost = true;
    if (colPre.lostLife) lostLife = true;

    // 5. Move Ghosts
    if (!lostLife) {
      this.moveGhosts();
      const colPost = this.checkGhostCollisions();
      if (colPost.ateGhost) ateGhost = true;
      if (colPost.lostLife) lostLife = true;
    }

    // 6. Check Win Condition
    if (this.dotsRemaining <= 0) {
      this.status = 'won';
      this.gameOver = true;
      won = true;
    }

    this.notify();
    return { ateDot, atePower, ateGhost, ateCherry, lostLife, won };
  }

  private checkGhostCollisions(): { ateGhost: boolean; lostLife: boolean } {
    let ateGhost = false;
    let lostLife = false;

    for (const ghost of this.ghosts) {
      if (ghost.r === this.pacman.r && ghost.c === this.pacman.c) {
        if (ghost.isFrightened && !ghost.isEaten) {
          // Eat frightened ghost
          ghost.isFrightened = false;
          ghost.isEaten = true;
          this.addScore(this.frightenedMultiplier);
          this.frightenedMultiplier *= 2; // 200 -> 400 -> 800 -> 1600
          // Return to ghost house
          ghost.r = ghost.spawnPos.r;
          ghost.c = ghost.spawnPos.c;
          ateGhost = true;
        } else if (!ghost.isFrightened && !ghost.isEaten) {
          if (this.invulnerableTicks > 0) {
            // Still in grace period, Pac-Man is safe!
            continue;
          }
          // Pac-Man hit by ghost
          this.lives--;
          lostLife = true;
          if (this.lives <= 0) {
            this.status = 'lost';
            this.gameOver = true;
          } else {
            // Respawn in position with grace period
            this.invulnerableTicks = 25;
            this.pacman.r = PacmanEngine.PACMAN_START.r;
            this.pacman.c = PacmanEngine.PACMAN_START.c;
            this.pacman.dir = 'LEFT';
            this.pacman.nextDir = null;
            this.ghosts.forEach((g) => {
              g.r = g.spawnPos.r;
              g.c = g.spawnPos.c;
              g.isFrightened = false;
              g.isEaten = false;
              g.releaseDelay = g.id * 30;
            });
          }
          break;
        }
      }
    }

    return { ateGhost, lostLife };
  }

  private shouldGhostMove(ghost: GhostEntity): boolean {
    if (ghost.releaseDelay > 0) {
      ghost.releaseDelay--;
      return false;
    }

    if (ghost.isFrightened) {
      // Frightened ghosts move slowly: 1 step every 3 ticks
      return this.ghostStepCounter % 3 === 0;
    }

    // Normal ghost speed relative to Pac-Man:
    if (this.difficulty === 'EASY') {
      // Ghosts take 1 step every 3 ticks (Pac-man is 3x faster!)
      return this.ghostStepCounter % 3 === 0;
    } else if (this.difficulty === 'MEDIUM') {
      // Ghosts take 1 step every 2 ticks (Pac-man is 2x faster!)
      return this.ghostStepCounter % 2 === 0;
    } else {
      // HARD: ghosts take 2 steps every 3 ticks
      return this.ghostStepCounter % 3 !== 2;
    }
  }

  private moveGhosts(): void {
    const activeGhostCount = this.difficulty === 'EASY' ? 2 : this.difficulty === 'MEDIUM' ? 3 : 4;

    for (let i = 0; i < this.ghosts.length; i++) {
      if (i >= activeGhostCount) continue;
      const ghost = this.ghosts[i];

      if (!this.shouldGhostMove(ghost)) {
        continue;
      }

      let targetPos: PacmanMazePos = { r: this.pacman.r, c: this.pacman.c };

      if (ghost.isFrightened) {
        // Run away / random choice
        const options = this.getValidGhostMoves(ghost);
        if (options.length > 0) {
          // Pick option that maximizes distance to pacman
          options.sort((a, b) => this.dist(b, this.pacman) - this.dist(a, this.pacman));
          const chosen = options[0];
          ghost.r = chosen.r;
          ghost.c = chosen.c;
        }
        continue;
      }

      // Ghost personalities
      if (ghost.color === 'red') {
        // Blinky: direct chase
        targetPos = { r: this.pacman.r, c: this.pacman.c };
      } else if (ghost.color === 'pink') {
        // Pinky: ambush ahead
        const pDelta = this.dirDelta(this.pacman.dir);
        targetPos = {
          r: Math.max(1, Math.min(PacmanEngine.ROWS - 2, this.pacman.r + pDelta.dr * 3)),
          c: Math.max(1, Math.min(PacmanEngine.COLS - 2, this.pacman.c + pDelta.dc * 3)),
        };
      } else if (ghost.color === 'cyan') {
        // Inky: flanker
        targetPos = {
          r: Math.max(1, Math.min(PacmanEngine.ROWS - 2, this.pacman.r - 2)),
          c: Math.max(1, Math.min(PacmanEngine.COLS - 2, this.pacman.c + 2)),
        };
      } else {
        // Clyde: if far, chase; if close, scatter to corner
        const distToPac = this.dist(ghost, this.pacman);
        if (distToPac > 6) {
          targetPos = { r: this.pacman.r, c: this.pacman.c };
        } else {
          targetPos = { r: PacmanEngine.ROWS - 2, c: 1 };
        }
      }

      const nextStep = this.bfsNextStep(ghost, targetPos);
      ghost.r = nextStep.r;
      ghost.c = nextStep.c;
    }
  }

  private getValidGhostMoves(ghost: GhostEntity): PacmanMazePos[] {
    const valid: PacmanMazePos[] = [];
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      let nr = ghost.r + dr;
      let nc = ghost.c + dc;
      if (ghost.r === PacmanEngine.TUNNEL_ROW) {
        if (nc < 0) nc = PacmanEngine.COLS - 1;
        else if (nc >= PacmanEngine.COLS) nc = 0;
      }
      if (this.canPass(nr, nc)) {
        valid.push({ r: nr, c: nc });
      }
    }
    return valid;
  }

  private dist(a: PacmanMazePos, b: PacmanMazePos): number {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  }

  private bfsNextStep(from: PacmanMazePos, to: PacmanMazePos): PacmanMazePos {
    if (from.r === to.r && from.c === to.c) return from;
    const rows = PacmanEngine.ROWS;
    const cols = PacmanEngine.COLS;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const parent: (PacmanMazePos | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

    const queue: PacmanMazePos[] = [from];
    visited[from.r][from.c] = true;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.r === to.r && curr.c === to.c) {
        let step: PacmanMazePos = curr;
        while (parent[step.r][step.c] && !(parent[step.r][step.c]!.r === from.r && parent[step.r][step.c]!.c === from.c)) {
          step = parent[step.r][step.c]!;
        }
        return step;
      }

      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let nr = curr.r + dr;
        let nc = curr.c + dc;
        if (curr.r === PacmanEngine.TUNNEL_ROW) {
          if (nc < 0) nc = cols - 1;
          else if (nc >= cols) nc = 0;
        }

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && this.canPass(nr, nc)) {
          visited[nr][nc] = true;
          parent[nr][nc] = curr;
          queue.push({ r: nr, c: nc });
        }
      }
    }
    return from;
  }

  private canPass(r: number, c: number): boolean {
    if (r < 0 || r >= PacmanEngine.ROWS || c < 0 || c >= PacmanEngine.COLS) return false;
    return this.maze[r][c] !== 0;
  }

  private dirDelta(dir: PacmanDirection): { dr: number; dc: number } {
    switch (dir) {
      case 'UP': return { dr: -1, dc: 0 };
      case 'DOWN': return { dr: 1, dc: 0 };
      case 'LEFT': return { dr: 0, dc: -1 };
      case 'RIGHT': return { dr: 0, dc: 1 };
    }
  }

  private createDefaultGhosts(): GhostEntity[] {
    return [
      { id: 0, color: 'red', r: 8, c: 10, dir: 'UP', spawnPos: { r: 8, c: 10 }, isFrightened: false, isEaten: false, releaseDelay: 0 },
      { id: 1, color: 'pink', r: 10, c: 9, dir: 'UP', spawnPos: { r: 10, c: 9 }, isFrightened: false, isEaten: false, releaseDelay: 35 },
      { id: 2, color: 'cyan', r: 10, c: 10, dir: 'UP', spawnPos: { r: 10, c: 10 }, isFrightened: false, isEaten: false, releaseDelay: 70 },
      { id: 3, color: 'orange', r: 10, c: 11, dir: 'UP', spawnPos: { r: 10, c: 11 }, isFrightened: false, isEaten: false, releaseDelay: 105 },
    ];
  }

  private countDots(): void {
    let count = 0;
    for (let r = 0; r < PacmanEngine.ROWS; r++) {
      for (let c = 0; c < PacmanEngine.COLS; c++) {
        if (this.maze[r][c] === 1 || this.maze[r][c] === 3) {
          count++;
        }
      }
    }
    this.dotsRemaining = count;
  }

  private createDefaultMaze(): number[][] {
    const full: number[][] = [];
    for (let r = 0; r < PacmanEngine.ROWS; r++) {
      const leftHalf = HALF_MAZE[r].slice(0, 10);
      const center = HALF_MAZE[r][10];
      const rightHalf = [...leftHalf].reverse();
      full.push([...leftHalf, center, ...rightHalf]);
    }
    return full;
  }
}
