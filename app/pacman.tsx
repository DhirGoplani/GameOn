import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { Colors } from '../src/theme/colors';
import { Fonts, FontSize } from '../src/theme/typography';
import { GameHeader } from '../src/components/GameHeader';
import { GameOverModal } from '../src/components/GameOverModal';
import { CyberBackground } from '../src/components/CyberBackground';
import { tapLight, tapMedium, notifySuccess, notifyError } from '../src/utils/haptics';
import {
  playPacmanTheme,
  stopPacmanTheme,
  playPacmanWaka,
  playPacmanEatGhost,
} from '../src/utils/sound';

import {
  useEngine,
  PacmanEngine,
  PacmanDifficulty,
  PacmanDirection,
  GhostEntity,
} from '../src/engines';
import { PacmanSprite } from '../src/components/pacman/PacmanSprite';
import { GhostSprite } from '../src/components/pacman/GhostSprite';
import { PelletSprite } from '../src/components/pacman/PelletSprite';

const MAZE_ROWS = PacmanEngine.ROWS;
const MAZE_COLS = PacmanEngine.COLS;

const ARCADE_THEME = {
  bg: '#030712',
  wallBorder: '#2563EB',
  wallGlow: '#3B82F6',
  wallInner: '#0B132B',
  floor: '#030712',
  floorAlt: '#050B1A',
  accent: '#FACC15',
  pellet: '#FDE047',
};

interface DiffOption {
  label: string;
  tickSpeed: number;
  color: string;
}

const DIFFICULTIES: Record<PacmanDifficulty, DiffOption> = {
  EASY: { label: 'Easy', tickSpeed: 140, color: '#10B981' },
  MEDIUM: { label: 'Medium', tickSpeed: 120, color: '#FACC15' },
  HARD: { label: 'Hard', tickSpeed: 100, color: '#EF4444' },
};

export default function PacmanGame() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isMobile = windowWidth < 600;

  // Compute responsive maze cell size (without D-pad buttons, maze gets maximum screen area)
  const verticalReserved = isMobile ? 150 : 160;
  const cellSize = Math.max(
    14,
    Math.min(
      Math.floor((windowWidth - 20) / MAZE_COLS),
      Math.floor((windowHeight - verticalReserved) / MAZE_ROWS),
      30
    )
  );
  const mazePxW = cellSize * MAZE_COLS;
  const mazePxH = cellSize * MAZE_ROWS;

  const [gameState, engine] = useEngine(() => new PacmanEngine());
  const {
    maze,
    pacman,
    ghosts,
    frightenedTicks,
    dotsRemaining,
    cherry,
    lives,
    isInvulnerable,
    score,
    highScore,
    difficulty,
    status,
  } = gameState;

  const engineRef = useRef(engine);
  engineRef.current = engine;

  // Floating text feedback (e.g. +200)
  const [floatingText, setFloatingText] = useState<{ text: string; x: number; y: number } | null>(null);

  // Animated positions for smooth interpolation
  const pacmanAnimX = useSharedValue(pacman.c * cellSize);
  const pacmanAnimY = useSharedValue(pacman.r * cellSize);
  const pacmanScale = useSharedValue(1);

  // Load persistent high score
  useEffect(() => {
    AsyncStorage.getItem('pacman_high_score').then((v) => {
      if (v) {
        const hs = parseInt(v, 10);
        if (hs > engine.getHighScore()) {
          engine.setHighScore(hs);
        }
      }
    });

    return () => {
      stopPacmanTheme();
    };
  }, []);

  // Stop music on game over or victory
  useEffect(() => {
    if (status === 'lost' || status === 'won') {
      stopPacmanTheme();
    }
  }, [status]);

  const diffConfig = DIFFICULTIES[difficulty];

  const startGame = useCallback(
    (diff: PacmanDifficulty) => {
      tapMedium();
      playPacmanTheme();
      engine.startGame(diff);
      pacmanAnimX.value = PacmanEngine.PACMAN_START.c * cellSize;
      pacmanAnimY.value = PacmanEngine.PACMAN_START.r * cellSize;
    },
    [engine, cellSize, pacmanAnimX, pacmanAnimY]
  );

  // Main game tick interval
  useEffect(() => {
    if (status !== 'playing') return;

    const interval = setInterval(() => {
      const result = engineRef.current.tick();
      const st = engineRef.current.getState();

      if (result.ateDot) {
        tapLight();
        playPacmanWaka();
      }
      if (result.atePower) {
        notifySuccess();
        playPacmanWaka();
      }
      if (result.ateGhost) {
        notifySuccess();
        playPacmanEatGhost();
        setFloatingText({
          text: `+${st.frightenedMultiplier / 2}`,
          x: st.pacman.c * cellSize,
          y: st.pacman.r * cellSize,
        });
        setTimeout(() => setFloatingText(null), 900);
      }
      if (result.ateCherry) {
        notifySuccess();
        setFloatingText({
          text: '+500',
          x: st.pacman.c * cellSize,
          y: st.pacman.r * cellSize,
        });
        setTimeout(() => setFloatingText(null), 900);
      }
      if (result.lostLife) {
        notifyError();
      }

      // Check new high score
      const currentScore = engineRef.current.getScore();
      if (currentScore > engineRef.current.getHighScore()) {
        AsyncStorage.setItem('pacman_high_score', currentScore.toString());
      }

      // Smooth interpolation for Pac-Man
      pacmanAnimX.value = withTiming(st.pacman.c * cellSize, {
        duration: diffConfig.tickSpeed * 0.9,
        easing: Easing.linear,
      });
      pacmanAnimY.value = withTiming(st.pacman.r * cellSize, {
        duration: diffConfig.tickSpeed * 0.9,
        easing: Easing.linear,
      });
    }, diffConfig.tickSpeed);

    return () => clearInterval(interval);
  }, [status, diffConfig.tickSpeed, cellSize, pacmanAnimX, pacmanAnimY]);

  // Steer Pac-Man
  const steerPacman = useCallback(
    (dir: PacmanDirection) => {
      if (status !== 'playing') return;
      engineRef.current.setDirection(dir);
      pacmanScale.value = withSequence(
        withTiming(1.12, { duration: 40 }),
        withTiming(1.0, { duration: 40 })
      );
    },
    [status, pacmanScale]
  );

  // Keyboard controls
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        engineRef.current.togglePause();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const curStatus = engineRef.current.getState().status;
        if (curStatus === 'idle' || curStatus === 'lost' || curStatus === 'won') {
          e.preventDefault();
          startGame(difficulty);
          return;
        }
      }
      if (engineRef.current.getState().status !== 'playing') return;

      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        steerPacman('UP');
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        steerPacman('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        steerPacman('LEFT');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        steerPacman('RIGHT');
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [difficulty, steerPacman, startGame]);

  // Ultra low-latency 4-direction continuous swipe tracking
  const lastGestureRef = useRef({ x: 0, y: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
        onPanResponderGrant: (e) => {
          const pageX = e.nativeEvent.pageX ?? 0;
          const pageY = e.nativeEvent.pageY ?? 0;
          lastGestureRef.current = { x: pageX, y: pageY };
        },
        onPanResponderMove: (e) => {
          if (engineRef.current.getState().status !== 'playing') return;
          const pageX = e.nativeEvent.pageX ?? 0;
          const pageY = e.nativeEvent.pageY ?? 0;
          const dx = pageX - lastGestureRef.current.x;
          const dy = pageY - lastGestureRef.current.y;
          const THRESHOLD = 10; // Ultra low latency threshold: steers immediately after 10px drag

          if (Math.abs(dx) >= THRESHOLD || Math.abs(dy) >= THRESHOLD) {
            if (Math.abs(dx) > Math.abs(dy)) {
              steerPacman(dx > 0 ? 'RIGHT' : 'LEFT');
            } else {
              steerPacman(dy > 0 ? 'DOWN' : 'UP');
            }
            // Reset reference position for smooth continuous multi-turn gestures without lifting finger
            lastGestureRef.current = { x: pageX, y: pageY };
          }
        },
      }),
    [steerPacman]
  );

  const pacmanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pacmanAnimX.value },
      { translateY: pacmanAnimY.value },
      { scale: pacmanScale.value },
    ],
  }));

  // Memoized maze tiles (walls and floor)
  const { walls, floors } = useMemo(() => {
    if (!maze.length) return { walls: [], floors: [] };
    const w: React.ReactNode[] = [];
    const f: React.ReactNode[] = [];

    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[0].length; c++) {
        const isWall = maze[r][c] === 0;
        if (isWall) {
          w.push(
            <View
              key={`w-${r}-${c}`}
              style={[
                styles.wallTile,
                {
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize,
                  height: cellSize,
                },
              ]}
            >
              <View style={styles.wallInner} />
            </View>
          );
        } else {
          f.push(
            <View
              key={`f-${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * cellSize,
                top: r * cellSize,
                width: cellSize,
                height: cellSize,
                backgroundColor: ARCADE_THEME.floor,
              }}
            />
          );
        }
      }
    }
    return { walls: w, floors: f };
  }, [maze, cellSize]);

  return (
    <View style={styles.root}>
      <CyberBackground theme="pacman" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <GameHeader
          title="PAC-MAN"
          category="ARCADE"
          score={score}
          highScore={highScore}
          accentColor={ARCADE_THEME.accent}
          onBack={() => {
            stopPacmanTheme();
            router.replace('/');
          }}
        />

        <View style={styles.content} {...panResponder.panHandlers}>
          {/* Top Controls: Difficulty and Game State Button */}
          <View style={styles.topControls}>
            <View style={styles.diffSelector}>
              {(['EASY', 'MEDIUM', 'HARD'] as PacmanDifficulty[]).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.diffBtn,
                    difficulty === d && {
                      backgroundColor: `${DIFFICULTIES[d].color}33`,
                      borderColor: DIFFICULTIES[d].color,
                    },
                  ]}
                  onPress={() => {
                    if (status === 'playing' || status === 'paused') return;
                    tapLight();
                    engine.setDifficulty(d);
                  }}
                  activeOpacity={0.7}
                  disabled={status === 'playing' || status === 'paused'}
                >
                  <Text
                    style={[
                      styles.diffBtnText,
                      difficulty === d && { color: DIFFICULTIES[d].color },
                    ]}
                  >
                    {DIFFICULTIES[d].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionSelector}>
              {status === 'idle' || status === 'lost' || status === 'won' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: ARCADE_THEME.accent }]}
                  onPress={() => startGame(difficulty)}
                >
                  <Text style={[styles.actionBtnText, { color: ARCADE_THEME.accent }]}>
                    ▶ PLAY
                  </Text>
                </TouchableOpacity>
              ) : status === 'playing' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: Colors.accent.warning }]}
                  onPress={() => engine.togglePause()}
                >
                  <Text style={[styles.actionBtnText, { color: Colors.accent.warning }]}>
                    ⏸ PAUSE
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: Colors.accent.success }]}
                  onPress={() => engine.togglePause()}
                >
                  <Text style={[styles.actionBtnText, { color: Colors.accent.success }]}>
                    ▶ RESUME
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stats Bar: Lives, Dots Remaining, Frightened Timer */}
          <View style={styles.infoBar}>
            {/* Lives */}
            <View style={styles.livesContainer}>
              <Text style={styles.infoLabel}>LIVES</Text>
              <View style={styles.livesIcons}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <View
                    key={`life-${i}`}
                    style={[styles.lifeSlot, { opacity: i < lives ? 1.0 : 0.2 }]}
                  >
                    <PacmanSprite size={18} direction="RIGHT" frameIndex={1} />
                  </View>
                ))}
              </View>
            </View>

            {/* Dots remaining */}
            <View style={styles.infoChip}>
              <Text style={styles.infoLabel}>PELLETS</Text>
              <Text style={[styles.infoValue, { color: ARCADE_THEME.accent }]}>
                {dotsRemaining}
              </Text>
            </View>

            {/* Power Pellet countdown indicator */}
            {frightenedTicks > 0 && (
              <View style={[styles.infoChip, styles.powerChip]}>
                <Text style={styles.powerLabel}>GHOSTS SCARED!</Text>
                <Text style={styles.powerTimer}>{frightenedTicks}</Text>
              </View>
            )}
          </View>

          {/* Maze Viewport */}
          {maze.length > 0 && (
            <View
              style={[
                styles.mazeViewport,
                Platform.OS === 'web' && ({ touchAction: 'none' } as any),
              ]}
            >
              <View style={[styles.mazeContainer, { width: mazePxW, height: mazePxH }]}>
                {floors}
                {walls}

                {/* Dots & Power Pellets */}
                {status !== 'idle' &&
                  maze.map((row, r) =>
                    row.map((val, c) => {
                      if (val === 1) {
                        return (
                          <View
                            key={`dot-${r}-${c}`}
                            style={[
                              styles.spriteCell,
                              {
                                left: c * cellSize,
                                top: r * cellSize,
                                width: cellSize,
                                height: cellSize,
                              },
                            ]}
                          >
                            <PelletSprite type="dot" size={cellSize} />
                          </View>
                        );
                      }
                      if (val === 3) {
                        return (
                          <View
                            key={`power-${r}-${c}`}
                            style={[
                              styles.spriteCell,
                              {
                                left: c * cellSize,
                                top: r * cellSize,
                                width: cellSize,
                                height: cellSize,
                              },
                            ]}
                          >
                            <PelletSprite type="power" size={cellSize} />
                          </View>
                        );
                      }
                      return null;
                    })
                  )}

                {/* Cherry Bonus Fruit */}
                {status !== 'idle' && cherry.active && (
                  <View
                    style={[
                      styles.spriteCell,
                      {
                        left: cherry.c * cellSize,
                        top: cherry.r * cellSize,
                        width: cellSize,
                        height: cellSize,
                        zIndex: 4,
                      },
                    ]}
                  >
                    <PelletSprite type="cherry" size={cellSize} />
                  </View>
                )}

                {/* Ghosts */}
                {status !== 'idle' &&
                  ghosts.map((ghost) => {
                    if (ghost.isEaten) return null;
                    const isBlinking = ghost.isFrightened && frightenedTicks <= 6 && frightenedTicks % 2 === 1;
                    return (
                      <View
                        key={`ghost-${ghost.id}`}
                        style={[
                          styles.spriteCell,
                          {
                            left: ghost.c * cellSize,
                            top: ghost.r * cellSize,
                            width: cellSize,
                            height: cellSize,
                            zIndex: 6,
                          },
                        ]}
                      >
                        <GhostSprite
                          size={cellSize * 0.96}
                          color={ghost.color}
                          isFrightened={ghost.isFrightened}
                          isBlinking={isBlinking}
                        />
                      </View>
                    );
                  })}

                {/* Pac-Man Character */}
                {status !== 'idle' && (
                  <Animated.View
                    style={[
                      styles.spriteCell,
                      {
                        width: cellSize,
                        height: cellSize,
                        zIndex: 10,
                        opacity: isInvulnerable ? 0.65 : 1.0,
                      },
                      pacmanAnimatedStyle,
                    ]}
                  >
                    <PacmanSprite
                      size={cellSize * 1.05}
                      direction={pacman.dir}
                      frameIndex={pacman.frame}
                    />
                  </Animated.View>
                )}

                {/* Floating Score Bonus Text */}
                {floatingText && (
                  <View
                    style={[
                      styles.floatingBadge,
                      { left: floatingText.x, top: floatingText.y - 10 },
                    ]}
                  >
                    <Text style={styles.floatingText}>{floatingText.text}</Text>
                  </View>
                )}
              </View>

              {status === 'paused' && (
                <View style={styles.pausedOverlay}>
                  <Text style={styles.pausedTitle}>PAUSED</Text>
                  <Text style={styles.pausedSub}>Tap Resume to continue</Text>
                </View>
              )}
            </View>
          )}

          {/* Low-Latency Swipe Gesture Hint Pill */}
          <View style={styles.gestureHintPill}>
            <MaterialCommunityIcons name="gesture-swipe" size={16} color="#FACC15" />
            <Text style={styles.gestureHintText}>
              {isMobile
                ? 'SWIPE ANYWHERE TO STEER (UP • DOWN • LEFT • RIGHT)'
                : 'SWIPE SCREEN OR USE ARROW KEYS / WASD TO STEER'}
            </Text>
          </View>
        </View>

        {/* Game Over / Victory Modal */}
        <GameOverModal
          visible={status === 'lost' || status === 'won'}
          title={status === 'won' ? 'MAZE CLEARED!' : 'GAME OVER'}
          score={score}
          highScore={highScore}
          isNewHighScore={score >= highScore && score > 0}
          accentColor={ARCADE_THEME.accent}
          onRestart={() => startGame(difficulty)}
          onHome={() => {
            stopPacmanTheme();
            router.replace('/');
          }}
          stats={[
            { label: 'Pellets Eaten', value: 158 - dotsRemaining },
            { label: 'Difficulty', value: diffConfig.label },
          ]}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#030712' },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  topControls: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  diffSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  diffBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  diffBtnText: {
    fontFamily: Fonts.pixel,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
  },
  actionSelector: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionBtnText: {
    fontFamily: Fonts.pixel,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoBar: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
  },
  livesIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  lifeSlot: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  powerChip: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  powerLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    fontWeight: '800',
    color: '#38BDF8',
  },
  powerTimer: {
    fontFamily: Fonts.pixel,
    fontSize: FontSize.base,
    fontWeight: '900',
    color: '#38BDF8',
  },
  infoLabel: {
    fontFamily: Fonts.pixel,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  infoValue: {
    fontFamily: Fonts.pixel,
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  mazeViewport: {
    position: 'relative',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    overflow: 'hidden',
    backgroundColor: '#030712',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  mazeContainer: {
    position: 'relative',
  },
  wallTile: {
    position: 'absolute',
    backgroundColor: '#0B132B',
    borderColor: '#1D4ED8',
    borderWidth: 1,
    borderRadius: 3,
  },
  wallInner: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    margin: 1.5,
    borderRadius: 2,
    opacity: 0.65,
  },
  spriteCell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FACC15',
    zIndex: 20,
  },
  floatingText: {
    fontFamily: Fonts.pixel,
    fontSize: FontSize.xs,
    color: '#FACC15',
    fontWeight: '900',
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  pausedTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['2xl'],
    color: '#FACC15',
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 8,
  },
  pausedSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  gestureHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.28)',
  },
  gestureHintText: {
    fontFamily: Fonts.pixel,
    fontSize: FontSize['2xs'],
    color: '#FACC15',
    letterSpacing: 0.5,
  },
});
