import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { tapLight } from './haptics';

const JUMP_AUDIO_ASSET = require('../../assets/sounds/jump.wav');
const PACMAN_THEME_ASSET = require('../../assets/sounds/pacman_theme.wav');
const PACMAN_WAKA_ASSET = require('../../assets/sounds/pacman_waka.wav');
const PACMAN_EATGHOST_ASSET = require('../../assets/sounds/pacman_eatghost.wav');

const FLAPPY_FLAP_ASSET = require('../../assets/sounds/flappy_flap.wav');
const FLAPPY_POINT_ASSET = require('../../assets/sounds/flappy_point.wav');
const FLAPPY_HIT_ASSET = require('../../assets/sounds/flappy_hit.wav');
const FLAPPY_DIE_ASSET = require('../../assets/sounds/flappy_die.wav');
const ARCADE_MILESTONE_ASSET = require('../../assets/sounds/arcade_milestone.wav');

/**
 * SoundManager (Singleton Pattern)
 * Provides ultra-responsive, hardware-accelerated audio effects with zero-latency
 * cross-platform support across both Web (WebAudio) and Native (Expo AV).
 */
export class SoundManager {
  private static instance: SoundManager | null = null;
  private jumpSound: Audio.Sound | null = null;
  private pacmanThemeSound: Audio.Sound | null = null;
  private pacmanWakaSound: Audio.Sound | null = null;
  private pacmanEatGhostSound: Audio.Sound | null = null;

  private flappyFlapSound: Audio.Sound | null = null;
  private flappyPointSound: Audio.Sound | null = null;
  private flappyHitSound: Audio.Sound | null = null;
  private flappyDieSound: Audio.Sound | null = null;
  private milestoneSound: Audio.Sound | null = null;

  private lastWakaTime: number = 0;
  private lastFlapTime: number = 0;
  private isPreloaded: boolean = false;
  private audioCtx: any = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private async init(): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      } catch (_) {}
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Pre-load critical low-latency game sounds
      const [sJump, sFlap, sPoint] = await Promise.all([
        Audio.Sound.createAsync(JUMP_AUDIO_ASSET, { shouldPlay: false, volume: 0.85 }),
        Audio.Sound.createAsync(FLAPPY_FLAP_ASSET, { shouldPlay: false, volume: 0.75 }),
        Audio.Sound.createAsync(FLAPPY_POINT_ASSET, { shouldPlay: false, volume: 0.9 }),
      ]);

      this.jumpSound = sJump.sound;
      this.flappyFlapSound = sFlap.sound;
      this.flappyPointSound = sPoint.sound;
      this.isPreloaded = true;
    } catch (_) {
      // Safe fallback
    }
  }

  /**
   * Play the authentic 8-bit retro jump sound.
   */
  public async playJump(): Promise<void> {
    // 1. Haptic feedback trigger in sync with sound
    tapLight();

    // 2. Web Audio API instant synthesized chirp for zero-latency in web browsers
    if (Platform.OS === 'web' && this.audioCtx) {
      try {
        if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume();
        }
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        const now = this.audioCtx.currentTime;
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.11);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
        return;
      } catch (_) {}
    }

    // 3. Native Expo AV low-latency sound playback
    try {
      if (this.jumpSound) {
        await this.jumpSound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          JUMP_AUDIO_ASSET,
          { shouldPlay: true, volume: 0.85 }
        );
        this.jumpSound = sound;
      }
    } catch (_) {}
  }

  /**
   * Play the iconic 1980 Pac-Man opening theme tune.
   */
  public async playPacmanTheme(): Promise<void> {
    try {
      if (this.pacmanThemeSound) {
        await this.pacmanThemeSound.stopAsync();
        await this.pacmanThemeSound.setPositionAsync(0);
        await this.pacmanThemeSound.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          PACMAN_THEME_ASSET,
          { shouldPlay: true, volume: 0.9, isLooping: false }
        );
        this.pacmanThemeSound = sound;
      }
    } catch (_) {}
  }

  /**
   * Stop the Pac-Man theme tune.
   */
  public async stopPacmanTheme(): Promise<void> {
    try {
      if (this.pacmanThemeSound) {
        await this.pacmanThemeSound.stopAsync();
      }
    } catch (_) {}
  }

  /**
   * Play the classic waka-waka pellet munching sound.
   */
  public async playPacmanWaka(): Promise<void> {
    const now = Date.now();
    if (now - this.lastWakaTime < 130) return;
    this.lastWakaTime = now;

    try {
      if (this.pacmanWakaSound) {
        await this.pacmanWakaSound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          PACMAN_WAKA_ASSET,
          { shouldPlay: true, volume: 0.7 }
        );
        this.pacmanWakaSound = sound;
      }
    } catch (_) {}
  }

  /**
   * Play the retro ghost eaten bonus jingle.
   */
  public async playPacmanEatGhost(): Promise<void> {
    try {
      if (this.pacmanEatGhostSound) {
        await this.pacmanEatGhostSound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          PACMAN_EATGHOST_ASSET,
          { shouldPlay: true, volume: 0.95 }
        );
        this.pacmanEatGhostSound = sound;
      }
    } catch (_) {}
  }

  /**
   * Play the crisp Flappy Bird wing flap sound.
   */
  public async playFlappyFlap(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFlapTime < 70) return;
    this.lastFlapTime = now;

    tapLight();

    if (Platform.OS === 'web' && this.audioCtx) {
      try {
        if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        const t = this.audioCtx.currentTime;
        osc.frequency.setValueAtTime(280, t);
        osc.frequency.exponentialRampToValueAtTime(700, t + 0.08);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
        return;
      } catch (_) {}
    }

    try {
      if (this.flappyFlapSound) {
        await this.flappyFlapSound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          FLAPPY_FLAP_ASSET,
          { shouldPlay: true, volume: 0.8 }
        );
        this.flappyFlapSound = sound;
      }
    } catch (_) {}
  }

  /**
   * Play the crystalline arcade ding when clearing a pipe.
   */
  public async playFlappyPoint(): Promise<void> {
    if (Platform.OS === 'web' && this.audioCtx) {
      try {
        if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
        const t = this.audioCtx.currentTime;
        // Two-tone bell (B5 -> E6)
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(988, t);
        gain1.gain.setValueAtTime(0.35, t);
        gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        osc1.start(t);
        osc1.stop(t + 0.18);

        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1319, t + 0.07);
        gain2.gain.setValueAtTime(0.4, t + 0.07);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.26);
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        osc2.start(t + 0.07);
        osc2.stop(t + 0.26);
        return;
      } catch (_) {}
    }

    try {
      if (this.flappyPointSound) {
        await this.flappyPointSound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          FLAPPY_POINT_ASSET,
          { shouldPlay: true, volume: 0.95 }
        );
        this.flappyPointSound = sound;
      }
    } catch (_) {}
  }

  /**
   * Play the impact thump when colliding with pipe, cloud, or obstacle.
   */
  public async playFlappyHit(): Promise<void> {
    try {
      if (this.flappyHitSound) {
        await this.flappyHitSound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          FLAPPY_HIT_ASSET,
          { shouldPlay: true, volume: 1.0 }
        );
        this.flappyHitSound = sound;
      }
    } catch (_) {}
  }

  /**
   * Play the extinction / tumbling game-over stinger.
   */
  public async playFlappyDie(): Promise<void> {
    try {
      if (this.flappyDieSound) {
        await this.flappyDieSound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          FLAPPY_DIE_ASSET,
          { shouldPlay: true, volume: 0.85 }
        );
        this.flappyDieSound = sound;
      }
    } catch (_) {}
  }

  /**
   * Play the milestone score bell (Dino 100-pt marks, high score).
   */
  public async playMilestone(): Promise<void> {
    try {
      if (this.milestoneSound) {
        await this.milestoneSound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          ARCADE_MILESTONE_ASSET,
          { shouldPlay: true, volume: 0.9 }
        );
        this.milestoneSound = sound;
      }
    } catch (_) {}
  }

  public async unload(): Promise<void> {
    try {
      if (this.jumpSound) {
        await this.jumpSound.unloadAsync();
        this.jumpSound = null;
      }
      if (this.pacmanThemeSound) {
        await this.pacmanThemeSound.unloadAsync();
        this.pacmanThemeSound = null;
      }
      if (this.pacmanWakaSound) {
        await this.pacmanWakaSound.unloadAsync();
        this.pacmanWakaSound = null;
      }
      if (this.pacmanEatGhostSound) {
        await this.pacmanEatGhostSound.unloadAsync();
        this.pacmanEatGhostSound = null;
      }
      if (this.flappyFlapSound) {
        await this.flappyFlapSound.unloadAsync();
        this.flappyFlapSound = null;
      }
      if (this.flappyPointSound) {
        await this.flappyPointSound.unloadAsync();
        this.flappyPointSound = null;
      }
      if (this.flappyHitSound) {
        await this.flappyHitSound.unloadAsync();
        this.flappyHitSound = null;
      }
      if (this.flappyDieSound) {
        await this.flappyDieSound.unloadAsync();
        this.flappyDieSound = null;
      }
      if (this.milestoneSound) {
        await this.milestoneSound.unloadAsync();
        this.milestoneSound = null;
      }
      this.isPreloaded = false;
    } catch (_) {}
  }
}

export const soundManager = SoundManager.getInstance();

export function playJumpSound() {
  soundManager.playJump();
}

export function playPacmanTheme() {
  soundManager.playPacmanTheme();
}

export function stopPacmanTheme() {
  soundManager.stopPacmanTheme();
}

export function playPacmanWaka() {
  soundManager.playPacmanWaka();
}

export function playPacmanEatGhost() {
  soundManager.playPacmanEatGhost();
}

export function playFlappyFlapSound() {
  soundManager.playFlappyFlap();
}

export function playFlappyPointSound() {
  soundManager.playFlappyPoint();
}

export function playFlappyHitSound() {
  soundManager.playFlappyHit();
}

export function playFlappyDieSound() {
  soundManager.playFlappyDie();
}

export function playMilestoneSound() {
  soundManager.playMilestone();
}
