import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../src/theme/colors';
import { Fonts, FontSize } from '../src/theme/typography';
import { Spacing } from '../src/theme/spacing';
import { GameHeader } from '../src/components/GameHeader';
import { GameOverModal } from '../src/components/GameOverModal';
import { CyberBackground } from '../src/components/CyberBackground';
import { tapLight, notifyError } from '../src/utils/haptics';

// Modular OOP Architecture imports
import { DinoEngine, DinoEngineSnapshot } from '../src/engines/dino';
import { DinoSprite, ObstacleSprite, DinoGround } from '../src/components/dino';

const ACCENT = '#00E5FF';
const ROAD_HEIGHT = 80;

export default function DinoJump() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Instantiate OOP DinoEngine
  const engineRef = useRef<DinoEngine>(new DinoEngine(0));
  const engine = engineRef.current;

  // React state for reactive rendering
  const [gameState, setGameState] = useState<DinoEngineSnapshot>(() => engine.getState());
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Load High Score on mount
  useEffect(() => {
    AsyncStorage.getItem('dino_hs').then((val) => {
      if (val) {
        const hs = parseInt(val, 10);
        setHighScore(hs);
        engine.setHighScore(hs);
      }
    });

    // Observer Pattern: Subscribe to engine updates
    const unsubscribe = engine.subscribe((snapshot) => {
      setGameState(snapshot);
    });

    return () => {
      unsubscribe();
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [engine]);

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    notifyError();
    const currentScore = engine.getScore();
    if (currentScore > highScore) {
      setHighScore(currentScore);
      AsyncStorage.setItem('dino_hs', currentScore.toString());
    }
  }, [engine, highScore]);

  // Main 60 FPS Engine Tick Loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (isPausedRef.current || engine.isGameOver() || !gameState.gameStarted) {
        lastTimeRef.current = null;
        return;
      }

      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp;
      }

      const rawDt = (timestamp - lastTimeRef.current) / 16.67;
      const dt = Math.min(Math.max(rawDt, 0.5), 2.2); // Clamp delta time against frame drops
      lastTimeRef.current = timestamp;

      // Polymorphic Entity physics & collision tick
      const collided = engine.tick(dt, windowWidth);
      setGameState(engine.getState());

      if (collided) {
        handleGameOver();
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [engine, gameState.gameStarted, windowWidth, handleGameOver]
  );

  // Restart loop when game starts or unpauses
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !isPaused) {
      lastTimeRef.current = null;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState.gameStarted, gameState.gameOver, isPaused, gameLoop]);

  // Controls
  const handleJump = useCallback(() => {
    if (gameState.gameOver) return;
    if (isPaused) {
      setIsPaused(false);
      return;
    }
    tapLight();
    engine.jump();
    setGameState(engine.getState());
  }, [engine, gameState.gameOver, isPaused]);

  const handleDuck = useCallback(
    (isDown: boolean) => {
      if (gameState.gameOver || !gameState.gameStarted || isPaused) return;
      engine.duck(isDown);
      setGameState(engine.getState());
    },
    [engine, gameState.gameOver, gameState.gameStarted, isPaused]
  );

  const handleJumpRef = useRef(handleJump);
  handleJumpRef.current = handleJump;
  const handleDuckRef = useRef(handleDuck);
  handleDuckRef.current = handleDuck;

  const restartGame = useCallback(() => {
    lastTimeRef.current = null;
    engine.reset();
    engine.start();
    setIsPaused(false);
    setGameState(engine.getState());
    tapLight();
  }, [engine]);

  const togglePause = useCallback(() => {
    if (gameState.gameOver || !gameState.gameStarted) return;
    setIsPaused((prev) => !prev);
    tapLight();
  }, [gameState.gameOver, gameState.gameStarted]);

  // Responsive PanResponder for Swipe/Tap controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.pageY > 120,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderGrant: () => {
        handleJumpRef.current();
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 18) {
          handleDuckRef.current(true);
        } else if (gesture.dy < -18) {
          handleJumpRef.current();
        }
      },
      onPanResponderRelease: () => {
        handleDuckRef.current(false);
      },
      onPanResponderTerminate: () => {
        handleDuckRef.current(false);
      },
    })
  ).current;

  // Web Keyboard Event Listeners with Platform Guard
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key;

      if ([' ', 'ArrowUp', 'w', 'W'].includes(key)) {
        e.preventDefault();
        handleJump();
      } else if (['ArrowDown', 's', 'S'].includes(key)) {
        e.preventDefault();
        handleDuck(true);
      } else if (key === 'Enter') {
        e.preventDefault();
        if (gameState.gameOver) {
          restartGame();
        } else if (!gameState.gameStarted) {
          handleJump();
        } else {
          togglePause();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      if (['ArrowDown', 's', 'S'].includes(key)) {
        handleDuck(false);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [gameState.gameOver, gameState.gameStarted, handleJump, handleDuck, restartGame, togglePause]);

  const player = gameState?.player || {
    x: 50,
    y: 0,
    width: 54,
    height: 58,
    pose: 'RUNNING' as const,
    runFrame: 0,
    duckFrame: 0,
  };

  return (
    <View style={styles.root}>
      {/* Dynamic Cyber Theme Background */}
      <CyberBackground theme="dino" />

      {/* Main Interactive Gameplay Area */}
      <View style={[styles.gameArea, StyleSheet.absoluteFillObject]} {...panResponder.panHandlers}>
        {/* Hardware-Accelerated Dino Player Sprite */}
        <View
          style={[
            styles.playerContainer,
            {
              left: player.x,
              bottom: ROAD_HEIGHT + (player.y || 0),
            },
          ]}
        >
          <DinoSprite
            pose={player.pose}
            runFrame={player.runFrame}
            duckFrame={player.duckFrame}
          />
        </View>

        {/* Polymorphic Obstacle Sprites (Cactus & Pterodactyl Birds) */}
        {(gameState?.obstacles || []).map((obs) => (
          <View
            key={obs.id}
            style={[
              styles.obstacleContainer,
              {
                left: obs.x,
                bottom: ROAD_HEIGHT + (obs.y || 0),
                width: obs.width,
                height: obs.height,
              },
            ]}
          >
            <ObstacleSprite obstacle={obs} />
          </View>
        ))}

        {/* Parallax Ground Terrain Layer */}
        <DinoGround distance={gameState.distance} width={windowWidth} height={ROAD_HEIGHT} />
      </View>

      {/* HUD & Navigation Overlay */}
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']} pointerEvents="box-none">
        <GameHeader
          title="DINO RUNNER"
          category="OOP ENGINE"
          score={gameState.score}
          highScore={highScore}
          accentColor={ACCENT}
          onBack={() => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            router.replace('/');
          }}
        />

        {/* Control Bar */}
        <View style={styles.controlBar} pointerEvents="box-none">
          <TouchableOpacity
            style={[
              styles.controlBtn,
              !gameState.gameStarted || isPaused ? styles.controlBtnActive : styles.controlBtnInactive,
            ]}
            onPress={!gameState.gameStarted || isPaused ? handleJump : undefined}
          >
            <MaterialCommunityIcons
              name="play"
              size={16}
              color={!gameState.gameStarted || isPaused ? '#FFFFFF' : ACCENT}
            />
            <Text
              style={[
                styles.controlBtnText,
                { color: !gameState.gameStarted || isPaused ? '#FFFFFF' : ACCENT },
              ]}
            >
              START / JUMP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlBtn,
              styles.controlBtnInactive,
              (!gameState.gameStarted || gameState.gameOver) && { opacity: 0.5 },
            ]}
            onPress={gameState.gameStarted && !gameState.gameOver ? togglePause : undefined}
          >
            <MaterialCommunityIcons name="pause" size={16} color="#F1F5F9" />
            <Text style={[styles.controlBtnText, { color: '#F1F5F9' }]}>
              {isPaused ? 'RESUME' : 'PAUSE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Start Game Prompt Card */}
        {!gameState.gameStarted && !gameState.gameOver && (
          <View style={[StyleSheet.absoluteFill, styles.overlayCenter]} pointerEvents="box-none">
            <TouchableOpacity style={styles.startCard} onPress={handleJump} activeOpacity={0.85}>
              <Text style={styles.messageText}>▶ TAP OR PRESS SPACE TO RUN</Text>
              <Text style={styles.subMessageText}>SWIPE DOWN OR PRESS [S] TO DUCK</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Paused Overlay */}
        {isPaused && (
          <View style={[StyleSheet.absoluteFill, styles.overlayCenter]} pointerEvents="box-none">
            <TouchableOpacity style={styles.startCard} onPress={togglePause} activeOpacity={0.85}>
              <Text style={styles.messageText}>PAUSED</Text>
              <Text style={styles.subMessageText}>TAP TO RESUME</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Game Over Modal */}
        <GameOverModal
          visible={gameState.gameOver}
          title="EXTINCTION"
          score={gameState.score}
          highScore={highScore}
          isNewHighScore={gameState.score >= highScore && gameState.score > 0}
          accentColor={ACCENT}
          onRestart={restartGame}
          onHome={() => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            router.replace('/');
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07050E',
  },
  safe: {
    flex: 1,
    zIndex: 20,
  },
  gameArea: {
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 10,
  },
  playerContainer: {
    position: 'absolute',
    width: 70,
    height: 58,
    zIndex: 15,
  },
  obstacleContainer: {
    position: 'absolute',
    zIndex: 12,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    gap: Spacing[3],
    zIndex: 50,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: 4,
    borderWidth: 1,
    gap: Spacing[2],
  },
  controlBtnActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    borderColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  controlBtnInactive: {
    backgroundColor: '#161522',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  controlBtnText: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['2xs'],
    letterSpacing: 1,
  },
  overlayCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  startCard: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    backgroundColor: '#0E0D18',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  messageText: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.sm,
    color: '#00E5FF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  subMessageText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    letterSpacing: 0.5,
  },
});
