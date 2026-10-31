import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  SharedValue,
  cancelAnimation,
} from 'react-native-reanimated';
import { Fonts, FontSize } from '../src/theme/typography';
import { Spacing } from '../src/theme/spacing';
import { GameHeader } from '../src/components/GameHeader';
import { GameOverModal } from '../src/components/GameOverModal';
import { LinearGradient } from 'expo-linear-gradient';
import { tapLight, notifyError, tapMedium } from '../src/utils/haptics';
import { useKeyboard, KeyboardKey } from '../src/hooks/useKeyboard';
import { CyberBackground } from '../src/components/CyberBackground';
import { FlappySprite } from '../src/components/flappy/FlappySprite';
import { PipeSprite } from '../src/components/flappy/PipeSprite';

// ── Theme & Dimensions ────────────────────────────────────────────────────────
const ACCENT = '#00E5FF';
const GROUND_TOP = '#1B3A22';
const GROUND_BOT = '#1C110C';

// Calibrated physics for ultra-smooth responsiveness
const GRAVITY_BASE = 0.36;
const JUMP_FORCE_BASE = -7.4;
const PIPE_SPEED_BASE = 2.8;
const PIPE_WIDTH = 66;
const PIPE_GAP = 195;
const PIPE_COUNT = 6;
const ADJACENT_PIPE_SPACING = 235;
const BIRD_SIZE = 56;
const GROUND_H = 78;

const BUSH_IMG = require('../assets/images/flappy/bush.png');

// ── Bird Container driven by Reanimated SharedValues (Pure GPU Transforms) ───
const BirdContainer = React.memo(({
  birdY,
  birdRot,
  isDead,
  birdX,
}: {
  birdY: SharedValue<number>;
  birdRot: SharedValue<number>;
  isDead: boolean;
  birdX: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: birdX,
    top: 0,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    zIndex: 15,
    transform: [
      { translateY: birdY.value },
      { rotate: `${birdRot.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle} pointerEvents="none">
      <FlappySprite size={BIRD_SIZE} isDead={isDead} />
    </Animated.View>
  );
});
BirdContainer.displayName = 'BirdContainer';

// ── Optimized Pipe Obstacle (Hardware-Accelerated Translation) ─────────────────
const AnimatedPipe = React.memo(
  ({
    xSV,
    topHSV,
    gapSV,
    screenHeight,
    pipeWidth,
  }: {
    xSV: SharedValue<number>;
    topHSV: SharedValue<number>;
    gapSV: SharedValue<number>;
    screenHeight: number;
    pipeWidth: number;
  }) => {
    const topPipeStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: 0,
      top: 0,
      width: pipeWidth,
      height: Math.max(0, topHSV.value),
      zIndex: 5,
      transform: [{ translateX: xSV.value }],
    }));

    const bottomPipeStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: 0,
      top: topHSV.value + gapSV.value,
      width: pipeWidth,
      height: Math.max(0, screenHeight - (topHSV.value + gapSV.value) - GROUND_H),
      zIndex: 5,
      transform: [{ translateX: xSV.value }],
    }));

    return (
      <>
        {/* Top Pipe */}
        <Animated.View style={topPipeStyle} pointerEvents="none">
          <PipeSprite type="top" width={pipeWidth} />
        </Animated.View>

        {/* Bottom Pipe */}
        <Animated.View style={bottomPipeStyle} pointerEvents="none">
          <PipeSprite type="bottom" width={pipeWidth} />
        </Animated.View>
      </>
    );
  }
);
AnimatedPipe.displayName = 'AnimatedPipe';

// ── Main Component ────────────────────────────────────────────────────────────
export default function FlappyBird() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const scaleRatio = Math.min(windowHeight / 850, 1.1);
  const GRAVITY = GRAVITY_BASE * scaleRatio;
  const JUMP_FORCE = JUMP_FORCE_BASE * scaleRatio;
  const PIPE_SPEED = PIPE_SPEED_BASE * Math.min(Math.max(windowWidth / 390, 0.95), 1.2);

  const GAME_WIDTH = windowWidth;
  const GAME_HEIGHT = windowHeight;
  const BIRD_X_POS = Math.floor(Math.min(GAME_WIDTH * 0.24, 150));

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Physics driven on the UI thread
  const birdY = useSharedValue(windowHeight * 0.42);
  const velSV = useSharedValue(0);
  const birdRot = useSharedValue(0);

  // Reusable Pipe Pool
  const pipeXs = useRef(Array.from({ length: PIPE_COUNT }, () => useSharedValue(3000))).current;
  const pipeTopHs = useRef(Array.from({ length: PIPE_COUNT }, () => useSharedValue(windowHeight * 0.3))).current;
  const pipeGaps = useRef(Array.from({ length: PIPE_COUNT }, () => useSharedValue(PIPE_GAP))).current;

  const gameOverRef = useRef(false);
  const gameStartedRef = useRef(false);
  const isPausedRef = useRef(false);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    gameOverRef.current = gameOver;
    gameStartedRef.current = gameStarted;
    isPausedRef.current = isPaused;
  }, [gameOver, gameStarted, isPaused]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Load persistent high score
  useEffect(() => {
    AsyncStorage.getItem('flappy_hs').then((v) => {
      if (v) setHighScore(parseInt(v, 10));
    });
  }, []);

  // Idle hover animation when waiting to start
  useEffect(() => {
    if (!gameStarted && !gameOver) {
      birdY.value = withRepeat(
        withSequence(
          withTiming(windowHeight * 0.42 - 12, { duration: 420, easing: Easing.inOut(Easing.quad) }),
          withTiming(windowHeight * 0.42 + 12, { duration: 420, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      birdRot.value = withTiming(0, { duration: 150 });
    }
  }, [gameStarted, gameOver, windowHeight, birdY, birdRot]);

  // Dynamic pipe heights
  const randomTopH = useCallback(() => {
    const minH = GAME_HEIGHT * 0.12;
    const maxH = GAME_HEIGHT - GROUND_H - PIPE_GAP - GAME_HEIGHT * 0.12;
    return minH + Math.random() * (maxH - minH);
  }, [GAME_HEIGHT]);

  const initPipes = useCallback(() => {
    const leadIn = Math.max(GAME_WIDTH * 0.9, 480);
    for (let i = 0; i < PIPE_COUNT; i++) {
      pipeXs[i].value = leadIn + i * ADJACENT_PIPE_SPACING;
      pipeGaps[i].value = PIPE_GAP;
      pipeTopHs[i].value = randomTopH();
    }
  }, [GAME_WIDTH, pipeXs, pipeGaps, pipeTopHs, randomTopH]);

  // Instantaneous Flap with 0ms Touch Latency
  const doFlap = useCallback(() => {
    cancelAnimation(birdY);
    velSV.value = JUMP_FORCE;
    birdRot.value = -22;
    tapLight();
  }, [JUMP_FORCE, birdY, velSV, birdRot]);

  const jump = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return;
    if (!gameStartedRef.current) {
      initPipes();
      setGameStarted(true);
      gameStartedRef.current = true;
      doFlap();
      tapMedium();
      return;
    }
    doFlap();
  }, [doFlap, initPipes]);

  const togglePause = useCallback(() => {
    if (gameOverRef.current) return;
    if (!gameStartedRef.current) {
      jump();
      return;
    }
    setIsPaused((p) => !p);
    tapLight();
  }, [jump]);

  const onGameOver = useCallback(
    (finalY: number) => {
      if (gameOverRef.current) return;
      gameOverRef.current = true;
      setGameOver(true);
      setGameStarted(false);
      notifyError();

      const s = scoreRef.current;
      const hs = highScoreRef.current;
      if (s > hs) {
        setHighScore(s);
        AsyncStorage.setItem('flappy_hs', s.toString());
      }

      // Smooth tumble rotation into ground
      birdRot.value = withTiming(85, { duration: 320, easing: Easing.in(Easing.quad) });
    },
    [birdRot]
  );

  // ── High Performance Game Loop ──────────────────────────────────────────────
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameOverRef.current || !gameStartedRef.current || isPausedRef.current) {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        lastTimeRef.current = null;
        return;
      }

      // Delta time calculation clamped to avoid velocity spikes
      const dt = lastTimeRef.current
        ? Math.min((timestamp - lastTimeRef.current) / 16.67, 1.4)
        : 1;
      lastTimeRef.current = timestamp;

      // Physics integration
      const newVel = Math.min(11, velSV.value + GRAVITY * dt);
      const newY = birdY.value + newVel * dt;

      // Smooth rotation: snap up on jump, smooth continuous tilt when falling
      if (newVel < 0) {
        birdRot.value = Math.max(-24, birdRot.value - 6 * dt);
      } else if (newVel < 2.0) {
        birdRot.value = birdRot.value + (-4 - birdRot.value) * 0.14 * dt;
      } else {
        const diveTarget = Math.min(80, (newVel - 2.0) * 12);
        birdRot.value = birdRot.value + (diveTarget - birdRot.value) * 0.16 * dt;
      }

      const floorLimit = GAME_HEIGHT - GROUND_H - BIRD_SIZE;
      if (newY < 0 || newY > floorLimit) {
        birdY.value = Math.min(newY, floorLimit);
        onGameOver(newY);
        return;
      }

      velSV.value = newVel;
      birdY.value = newY;

      let passedCount = 0;

      for (let i = 0; i < PIPE_COUNT; i++) {
        const pX = pipeXs[i].value - PIPE_SPEED * dt;
        const pTopH = pipeTopHs[i].value;
        const pGap = pipeGaps[i].value;

        // Calibrated hit-box collision for larger 56px bird
        if (
          BIRD_X_POS + BIRD_SIZE - 10 > pX + 4 &&
          BIRD_X_POS + 10 < pX + PIPE_WIDTH - 4 &&
          (newY + 8 < pTopH || newY + BIRD_SIZE - 8 > pTopH + pGap)
        ) {
          onGameOver(newY);
          return;
        }

        // Passed pipe scoring
        if (
          pX + PIPE_WIDTH < BIRD_X_POS &&
          pX + PIPE_WIDTH + PIPE_SPEED * dt >= BIRD_X_POS
        ) {
          passedCount++;
        }

        // Recycle pipe when well off-screen left
        if (pX < -PIPE_WIDTH - 20) {
          let maxX = -Infinity;
          for (let j = 0; j < PIPE_COUNT; j++) {
            if (pipeXs[j].value > maxX) maxX = pipeXs[j].value;
          }
          const randJitter = (Math.random() - 0.5) * 16;
          pipeXs[i].value = maxX + ADJACENT_PIPE_SPACING + randJitter;
          pipeGaps[i].value = PIPE_GAP;
          pipeTopHs[i].value = randomTopH();
        } else {
          pipeXs[i].value = pX;
        }
      }

      if (passedCount > 0) {
        const newScore = scoreRef.current + passedCount;
        scoreRef.current = newScore;
        setScore(newScore);
        tapMedium();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [GRAVITY, PIPE_SPEED, GAME_HEIGHT, BIRD_X_POS, randomTopH, onGameOver, birdY, birdRot, velSV, pipeXs, pipeTopHs, pipeGaps]
  );

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      lastTimeRef.current = null;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, isPaused, gameLoop]);

  const restart = useCallback(() => {
    birdY.value = windowHeight * 0.42;
    velSV.value = 0;
    birdRot.value = 0;
    scoreRef.current = 0;
    gameOverRef.current = false;
    gameStartedRef.current = false;
    lastTimeRef.current = null;

    for (let i = 0; i < PIPE_COUNT; i++) {
      pipeXs[i].value = 3000;
    }

    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setIsPaused(false);
  }, [windowHeight, birdY, velSV, birdRot, pipeXs]);

  // Keyboard controls
  useKeyboard(
    (key: KeyboardKey) => {
      if (key === 'Enter') {
        if (gameOver) {
          restart();
          return;
        }
        togglePause();
        return;
      }
      if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') {
        jump();
      }
    },
    { disableRepeat: true, preventDefault: true }
  );

  return (
    <View style={styles.root}>
      {/* Same-Themed Cyber Arcade Background */}
      <CyberBackground theme="flappy" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.gameplayArea, { width: GAME_WIDTH, height: GAME_HEIGHT }]}>
          <GameHeader
            title="FLAPPY BIRD"
            category="ARCADE"
            score={score}
            highScore={highScore}
            accentColor={ACCENT}
            onBack={() => {
              setGameOver(true);
              router.replace('/');
            }}
          />

          {/* Pipes */}
          {pipeXs.map((xSV, i) => (
            <AnimatedPipe
              key={i}
              xSV={xSV}
              topHSV={pipeTopHs[i]}
              gapSV={pipeGaps[i]}
              screenHeight={windowHeight}
              pipeWidth={PIPE_WIDTH}
            />
          ))}

          {/* Yellow Animated Bird */}
          <BirdContainer
            birdY={birdY}
            birdRot={birdRot}
            isDead={gameOver}
            birdX={BIRD_X_POS}
          />

          {/* Bushes along the ground boundary */}
          <View style={[styles.bushLayer, { bottom: GROUND_H - 12 }]} pointerEvents="none">
            <Image source={BUSH_IMG} style={[styles.bush, { left: 10 }]} />
            <Image source={BUSH_IMG} style={[styles.bush, { left: 130 }]} />
            <Image source={BUSH_IMG} style={[styles.bush, { left: 250 }]} />
            <Image source={BUSH_IMG} style={[styles.bush, { left: 370 }]} />
            <Image source={BUSH_IMG} style={[styles.bush, { left: 490 }]} />
          </View>

          {/* Ground */}
          <View style={[styles.ground, { height: GROUND_H }]}>
            <LinearGradient colors={[GROUND_TOP, GROUND_BOT]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.grassStripe} />
            <View style={styles.grassStripeSub} />
          </View>

          {/* Start Screen Card */}
          {!gameStarted && !gameOver && (
            <View style={styles.overlayCenter} pointerEvents="box-none">
              <View style={styles.readyCard}>
                <Text style={styles.readyTitle}>GET READY!</Text>
                <Text style={styles.readySubtitle}>Tap screen or press Space to jump</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={jump} activeOpacity={0.8}>
                  <Text style={styles.actionBtnText}>▶  TAP TO FLY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Paused Overlay */}
          {isPaused && (
            <View style={styles.overlayCenter}>
              <View style={styles.pauseCard}>
                <Text style={styles.pauseTitle}>PAUSED</Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { marginTop: Spacing[4] }]}
                  onPress={togglePause}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>▶  RESUME</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* In-Game Score HUD */}
          {gameStarted && !gameOver && !isPaused && (
            <View style={styles.liveScore} pointerEvents="none">
              <Text style={styles.liveScoreText}>{score}</Text>
            </View>
          )}

          {/* Zero-Latency Tap Area: onPressIn triggers immediately on touch down! */}
          {!gameOver && !isPaused && (
            <Pressable
              onPressIn={jump}
              style={StyleSheet.absoluteFill}
              android_disableSound
            />
          )}

          {/* Game Over Modal */}
          <GameOverModal
            visible={gameOver}
            title="GAME OVER"
            score={score}
            highScore={highScore}
            isNewHighScore={score >= highScore && score > 0}
            accentColor={ACCENT}
            onRestart={restart}
            onHome={() => router.replace('/')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameplayArea: {
    overflow: 'hidden',
    position: 'relative',
  },
  bushLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    zIndex: 6,
  },
  bush: {
    position: 'absolute',
    width: 95,
    height: 50,
    resizeMode: 'contain',
    opacity: 0.85,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 2,
    borderTopColor: '#2E7D32',
    overflow: 'hidden',
    zIndex: 10,
  },
  grassStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#388E3C',
  },
  grassStripeSub: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1E4620',
  },
  overlayCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 25,
  },
  readyCard: {
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[5],
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.45)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  readyTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: '#00E5FF',
    letterSpacing: 2,
    marginBottom: Spacing[2],
  },
  readySubtitle: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.xs,
    color: '#E2E8F0',
    letterSpacing: 0.5,
    marginBottom: Spacing[4],
  },
  actionBtn: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.22)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xs,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  pauseCard: {
    padding: Spacing[6],
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.45)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  pauseTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: '#00E5FF',
    letterSpacing: 2,
  },
  liveScore: {
    position: 'absolute',
    top: 85,
    alignSelf: 'center',
    zIndex: 20,
  },
  liveScoreText: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: '#FFFFFF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 2,
  },
});
