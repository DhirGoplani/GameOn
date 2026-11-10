import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import {
  playFlappyFlapSound,
  playFlappyPointSound,
  playFlappyHitSound,
  playFlappyDieSound,
} from '../src/utils/sound';
import { useKeyboard, KeyboardKey } from '../src/hooks/useKeyboard';
import { CyberBackground } from '../src/components/CyberBackground';
import { PipeSprite } from '../src/components/flappy/PipeSprite';
import {
  FlappyEngine,
  PipeObjectPool,
  CloudObjectPool,
  CloudObstacleEntity,
} from '../src/engines/flappy';

// ── Theme & Dimensions ────────────────────────────────────────────────────────
const ACCENT = '#00E5FF';
const GROUND_TOP = '#1B3A22';
const GROUND_BOT = '#1C110C';

const BIRD_SIZE = 56;
const GROUND_H = FlappyEngine.GROUND_HEIGHT;
const PIPE_WIDTH = 66;

const BUSH_IMG = require('../assets/images/flappy/bush.png');
const CLOUD_IMG = require('../assets/images/flappy/cloud.png');
const BIRD_WING_UP = require('../assets/images/flappy/bird_wing_up.png');
const BIRD_WING_MID = require('../assets/images/flappy/bird_wing_mid.png');
const BIRD_WING_DOWN = require('../assets/images/flappy/bird_wing_down.png');
const BIRD_DEAD = require('../assets/images/flappy/bird_dead.png');

// ── Bird Container driven by Reanimated SharedValues (Pure GPU Transforms & Opacity) ───
const BirdContainer = React.memo(({
  birdY,
  birdRot,
  birdFrame,
  isDead,
  birdX,
}: {
  birdY: SharedValue<number>;
  birdRot: SharedValue<number>;
  birdFrame: SharedValue<number>;
  isDead: boolean;
  birdX: number;
}) => {
  const animatedContainerStyle = useAnimatedStyle(() => ({
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

  const wingUpStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: !isDead && birdFrame.value === 0 ? 1 : 0,
  }));

  const wingMidStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: !isDead && birdFrame.value === 1 ? 1 : 0,
  }));

  const wingDownStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: !isDead && birdFrame.value === 2 ? 1 : 0,
  }));

  const deadStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: isDead ? 1 : 0,
  }));

  return (
    <Animated.View style={animatedContainerStyle} pointerEvents="none">
      <Animated.Image source={BIRD_WING_UP} style={wingUpStyle} />
      <Animated.Image source={BIRD_WING_MID} style={wingMidStyle} />
      <Animated.Image source={BIRD_WING_DOWN} style={wingDownStyle} />
      <Animated.Image source={BIRD_DEAD} style={deadStyle} />
    </Animated.View>
  );
});
BirdContainer.displayName = 'BirdContainer';

// ── Pre-Baked Static Pipe Obstacle (Hardware-Accelerated Dual Matrix Translation) ─
const AnimatedPipe = React.memo(
  ({
    xSV,
    topYSV,
    bottomYSV,
    pipeWidth,
  }: {
    xSV: SharedValue<number>;
    topYSV: SharedValue<number>;
    bottomYSV: SharedValue<number>;
    pipeWidth: number;
  }) => {
    const topPipeStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: 0,
      top: 0,
      width: pipeWidth,
      height: 800,
      zIndex: 5,
      transform: [
        { translateX: xSV.value },
        { translateY: topYSV.value },
      ],
    }));

    const bottomPipeStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: 0,
      top: 0,
      width: pipeWidth,
      height: 800,
      zIndex: 5,
      transform: [
        { translateX: xSV.value },
        { translateY: bottomYSV.value },
      ],
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

// ── Pre-Baked Floating Cloud Obstacle (Pure GPU Matrix Translation) ───────────
const AnimatedCloudObstacle = React.memo(
  ({
    xSV,
    ySV,
  }: {
    xSV: SharedValue<number>;
    ySV: SharedValue<number>;
  }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: 0,
      top: 0,
      width: CloudObstacleEntity.DEFAULT_WIDTH,
      height: CloudObstacleEntity.DEFAULT_HEIGHT,
      zIndex: 8,
      transform: [
        { translateX: xSV.value },
        { translateY: ySV.value },
      ],
    }));

    return (
      <Animated.View style={animatedStyle} pointerEvents="none">
        <Image
          source={CLOUD_IMG}
          style={styles.cloudObstacle}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }
);
AnimatedCloudObstacle.displayName = 'AnimatedCloudObstacle';

// ── Main Component ────────────────────────────────────────────────────────────
export default function FlappyBird() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Instantiate OOP Flappy Engine
  const engine = useMemo(() => new FlappyEngine(), []);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const GAME_WIDTH = windowWidth;
  const GAME_HEIGHT = windowHeight;
  const BIRD_X_POS = Math.floor(Math.min(GAME_WIDTH * 0.24, 150));

  // SharedValues for 100% GPU-accelerated rendering
  const birdYSV = useSharedValue(windowHeight * 0.42);
  const birdRotSV = useSharedValue(0);
  const birdFrameSV = useSharedValue(1);

  // Pre-allocated Object Pool SharedValues (Static pipes & aerial clouds)
  const pipeXSVs = useRef(Array.from({ length: PipeObjectPool.POOL_SIZE }, () => useSharedValue(3000))).current;
  const pipeTopYSVs = useRef(Array.from({ length: PipeObjectPool.POOL_SIZE }, () => useSharedValue(-550))).current;
  const pipeBottomYSVs = useRef(Array.from({ length: PipeObjectPool.POOL_SIZE }, () => useSharedValue(500))).current;

  const cloudXSVs = useRef(Array.from({ length: CloudObjectPool.POOL_SIZE }, () => useSharedValue(3000))).current;
  const cloudYSVs = useRef(Array.from({ length: CloudObjectPool.POOL_SIZE }, () => useSharedValue(200))).current;

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Synchronize engine dimensions on resize / rotation
  useEffect(() => {
    engine.setDimensions(windowWidth, windowHeight);
  }, [engine, windowWidth, windowHeight]);

  // Load persistent high score
  useEffect(() => {
    AsyncStorage.getItem('flappy_hs').then((v) => {
      if (v) {
        const hs = parseInt(v, 10);
        setHighScore(hs);
        engine.setHighScore(hs);
      }
    });
  }, [engine]);

  // Idle hover animation when waiting to start
  useEffect(() => {
    if (!gameStarted && !gameOver) {
      birdYSV.value = withRepeat(
        withSequence(
          withTiming(windowHeight * 0.42 - 12, { duration: 420, easing: Easing.inOut(Easing.quad) }),
          withTiming(windowHeight * 0.42 + 12, { duration: 420, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      birdRotSV.value = withTiming(0, { duration: 150 });
      birdFrameSV.value = 1;
    }
  }, [gameStarted, gameOver, windowHeight, birdYSV, birdRotSV, birdFrameSV]);

  // High-performance flap trigger
  const jump = useCallback(() => {
    if (engine.getStatus() === 'game_over' || isPaused) return;

    const startedNow = engine.getStatus() === 'idle';
    cancelAnimation(birdYSV);
    engine.flap();

    const bird = engine.getBird();
    birdYSV.value = bird.y;
    birdRotSV.value = bird.rotation;
    birdFrameSV.value = bird.flapFrame;

    // Trigger authentic airy wing flap audio + haptic
    playFlappyFlapSound();

    if (startedNow) {
      setGameStarted(true);
      tapMedium();
    }
  }, [engine, isPaused, birdYSV, birdRotSV, birdFrameSV]);

  const togglePause = useCallback(() => {
    if (engine.getStatus() === 'game_over') return;
    if (engine.getStatus() === 'idle') {
      jump();
      return;
    }
    engine.togglePause();
    setIsPaused(engine.getStatus() === 'paused');
    tapLight();
  }, [engine, jump]);

  // ── High Performance Game Loop (OOP Entity Updates + Zero Garbage Allocation) ──
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (engine.getStatus() !== 'playing') {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        lastTimeRef.current = null;
        return;
      }

      const dt = lastTimeRef.current
        ? Math.min((timestamp - lastTimeRef.current) / 16.67, 1.4)
        : 1.0;
      lastTimeRef.current = timestamp;

      // 1. Advance OOP Engine physics
      const { scored, gameOver: hit } = engine.tick(dt);

      // 2. Direct GPU SharedValue synchronization
      const bird = engine.getBird();
      birdYSV.value = bird.y;
      birdRotSV.value = bird.rotation;
      birdFrameSV.value = bird.flapFrame;

      const pipes = engine.getPipePool().getEntities();
      for (let i = 0; i < pipes.length; i++) {
        pipeXSVs[i].value = pipes[i].x;
        pipeTopYSVs[i].value = pipes[i].topTranslateY;
        pipeBottomYSVs[i].value = pipes[i].bottomTranslateY;
      }

      const clouds = engine.getCloudPool().getEntities();
      for (let i = 0; i < clouds.length; i++) {
        cloudXSVs[i].value = clouds[i].x;
        cloudYSVs[i].value = clouds[i].y;
      }

      // 3. Low-frequency event triggers (Only run when scoring or hitting)
      if (scored) {
        setScore(engine.getScore());
        tapMedium();
        playFlappyPointSound();
      }

      if (hit) {
        setGameOver(true);
        setGameStarted(false);
        notifyError();
        playFlappyHitSound();
        setTimeout(() => {
          playFlappyDieSound();
        }, 90);

        const s = engine.getScore();
        const hs = engine.getHighScore();
        if (s > hs) {
          setHighScore(s);
          AsyncStorage.setItem('flappy_hs', s.toString());
        }

        birdRotSV.value = withTiming(85, { duration: 320, easing: Easing.in(Easing.quad) });
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [engine, birdYSV, birdRotSV, birdFrameSV, pipeXSVs, pipeTopYSVs, pipeBottomYSVs, cloudXSVs, cloudYSVs]
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
    engine.reset();
    birdYSV.value = windowHeight * 0.42;
    birdRotSV.value = 0;
    birdFrameSV.value = 1;

    for (let i = 0; i < PipeObjectPool.POOL_SIZE; i++) {
      pipeXSVs[i].value = 3000;
    }

    for (let i = 0; i < CloudObjectPool.POOL_SIZE; i++) {
      cloudXSVs[i].value = 3000;
    }

    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setIsPaused(false);
    lastTimeRef.current = null;
  }, [engine, windowHeight, birdYSV, birdRotSV, birdFrameSV, pipeXSVs, cloudXSVs]);

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
        <View style={[styles.gameplayArea, { width: GAME_WIDTH }]}>
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

          {/* Pre-Baked Static Pipe Obstacles (From Object Pool) */}
          {pipeXSVs.map((xSV, i) => (
            <AnimatedPipe
              key={`pipe_pool_${i}`}
              xSV={xSV}
              topYSV={pipeTopYSVs[i]}
              bottomYSV={pipeBottomYSVs[i]}
              pipeWidth={PIPE_WIDTH}
            />
          ))}

          {/* Aerial Cloud Obstacles (From Object Pool - Interleaved between Pipes) */}
          {cloudXSVs.map((xSV, i) => (
            <AnimatedCloudObstacle
              key={`cloud_pool_${i}`}
              xSV={xSV}
              ySV={cloudYSVs[i]}
            />
          ))}

          {/* Yellow Animated Bird (Pure GPU Opacity Layers) */}
          <BirdContainer
            birdY={birdYSV}
            birdRot={birdRotSV}
            birdFrame={birdFrameSV}
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
  },
  gameplayArea: {
    flex: 1,
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
  cloudObstacle: {
    width: '100%',
    height: '100%',
    opacity: 0.96,
  },
});
