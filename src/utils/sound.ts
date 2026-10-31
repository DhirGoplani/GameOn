import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { tapLight } from './haptics';

const JUMP_AUDIO_ASSET = require('../../assets/sounds/jump.wav');
const PACMAN_THEME_ASSET = require('../../assets/sounds/pacman_theme.wav');
const PACMAN_WAKA_ASSET = require('../../assets/sounds/pacman_waka.wav');
const PACMAN_EATGHOST_ASSET = require('../../assets/sounds/pacman_eatghost.wav');

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
  private lastWakaTime: number = 0;
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

      const { sound } = await Audio.Sound.createAsync(
        JUMP_AUDIO_ASSET,
        { shouldPlay: false, volume: 0.85 }
      );
      this.jumpSound = sound;
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
