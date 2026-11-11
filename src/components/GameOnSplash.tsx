import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, FontSize } from '../theme/typography';
import { tapMedium, tapLight } from '../utils/haptics';

interface GameOnSplashProps {
  onFinish: () => void;
}

// Fixed pseudo-random star coordinates for the twinkling background
const STAR_COORDS = [
  { x: 10, y: 12, s: 2, delay: 0 },
  { x: 85, y: 18, s: 3, delay: 200 },
  { x: 25, y: 35, s: 2, delay: 400 },
  { x: 78, y: 42, s: 1.5, delay: 100 },
  { x: 15, y: 65, s: 2.5, delay: 500 },
  { x: 88, y: 72, s: 2, delay: 300 },
  { x: 45, y: 15, s: 3, delay: 250 },
  { x: 62, y: 82, s: 1.5, delay: 450 },
  { x: 30, y: 88, s: 2, delay: 150 },
  { x: 70, y: 25, s: 2.5, delay: 350 },
  { x: 92, y: 50, s: 2, delay: 50 },
  { x: 8, y: 45, s: 3, delay: 380 },
];

export function GameOnSplash({ onFinish }: GameOnSplashProps) {
  const { width, height } = useWindowDimensions();
  const [bootText, setBootText] = useState('INITIALIZING ARCADE CORE...');
  const [isDismissing, setIsDismissing] = useState(false);

  // Animation Shared Values
  const masterOpacity = useSharedValue(1);
  const cardScale = useSharedValue(0.72);
  const cardOpacity = useSharedValue(0);
  const logoGlow = useSharedValue(0.4);
  const progressWidth = useSharedValue(0);
  const scanlineY = useSharedValue(-60);
  const pressPromptOpacity = useSharedValue(0);

  const dismiss = useCallback(() => {
    if (isDismissing) {
      onFinish();
      return;
    }
    setIsDismissing(true);
    tapLight();

    // Fast exit animation
    cardScale.value = withTiming(1.06, { duration: 200, easing: Easing.out(Easing.quad) });
    masterOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });

    // Deterministic JS timeout to guarantee completion on native/Expo Go
    setTimeout(() => {
      onFinish();
    }, 220);
  }, [isDismissing, onFinish, cardScale, masterOpacity]);

  useEffect(() => {
    // Initial tactile pulse
    tapMedium();

    // 1. Entrance of the main badge (spring pop with ease)
    cardOpacity.value = withTiming(1, { duration: 250 });
    cardScale.value = withSpring(1, {
      damping: 12,
      stiffness: 140,
      mass: 0.8,
    });

    // 2. Neon glow oscillation
    logoGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.45, { duration: 600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // 3. Scanline sweep
    scanlineY.value = withRepeat(
      withTiming(260, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );

    // 4. Progress bar fill (0% -> 100% over 1500ms)
    progressWidth.value = withTiming(1, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });

    // 5. Dynamic boot status messages
    const t1 = setTimeout(() => {
      setBootText('CALIBRATING RETRO PIXELS...');
    }, 450);

    const t2 = setTimeout(() => {
      setBootText('SYSTEM ONLINE • GAME ON!');
      pressPromptOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 280 }),
          withTiming(0.2, { duration: 280 })
        ),
        -1,
        true
      );
    }, 1150);

    // 6. Fast auto-dismiss after 1.2 seconds + guaranteed hard kill
    const autoDismissTimer = setTimeout(() => {
      dismiss();
    }, 1200);

    const hardKillTimer = setTimeout(() => {
      onFinish();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(autoDismissTimer);
      clearTimeout(hardKillTimer);
    };
  }, [cardOpacity, cardScale, logoGlow, scanlineY, progressWidth, pressPromptOpacity, dismiss, onFinish]);

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: masterOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const scanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanlineY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progressWidth.value * 100)}%`,
  }));

  const promptStyle = useAnimatedStyle(() => ({
    opacity: pressPromptOpacity.value,
  }));

  const isSmallScreen = width < 400;

  return (
    <Animated.View style={[styles.root, containerStyle]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
        {/* Deep Cyber Background Gradient */}
        <LinearGradient
          colors={['#06040A', '#0D0B18', '#07050E']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Cyber Neon Radial Glows in Background */}
        <View style={[styles.glowOrb, styles.glowOrbCyan, { left: width * 0.1, top: height * 0.25 }]} />
        <View style={[styles.glowOrb, styles.glowOrbPurple, { right: width * 0.1, top: height * 0.4 }]} />

        {/* Twinkling Retro Arcade Stars */}
        {STAR_COORDS.map((star, idx) => (
          <View
            key={`star_${idx}`}
            style={[
              styles.star,
              {
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.s,
                height: star.s,
              },
            ]}
          />
        ))}

        {/* Subtle Cyber Grid Lines at bottom */}
        <View style={styles.gridContainer} pointerEvents="none">
          <View style={styles.gridLineHorizontal} />
          <View style={[styles.gridLineHorizontal, { top: 30 }]} />
          <View style={[styles.gridLineHorizontal, { top: 60 }]} />
          <View style={[styles.gridLineHorizontal, { top: 90 }]} />
        </View>

        {/* Center Presentation Card */}
        <View style={styles.centerContainer}>
          <Animated.View style={[styles.badgeCard, cardStyle]}>
            {/* Corner Rivet Accents */}
            <Text style={[styles.cornerRivet, styles.rivetTL]}>+</Text>
            <Text style={[styles.cornerRivet, styles.rivetTR]}>+</Text>
            <Text style={[styles.cornerRivet, styles.rivetBL]}>+</Text>
            <Text style={[styles.cornerRivet, styles.rivetBR]}>+</Text>

            {/* Top Micro Header Pill */}
            <View style={styles.microHeader}>
              <View style={styles.statusDot} />
              <Text style={styles.microHeaderText}>ARCADE SYSTEM v2.0</Text>
            </View>

            {/* Glowing Icon & Logo Lockup */}
            <View style={styles.iconWrapper}>
              <Ionicons name="game-controller" size={36} color="#00E5FF" />
            </View>

            {/* Main "GAME ON" Title with Neon Glow */}
            <View style={styles.titleContainer}>
              <Text style={[styles.titleShadow, isSmallScreen && styles.titleSmall]}>
                GAME ON
              </Text>
              <Text style={[styles.titleMain, isSmallScreen && styles.titleSmall]}>
                GAME ON
              </Text>
            </View>

            {/* Subtitle Badge */}
            <View style={styles.subtitleBadge}>
              <Text style={styles.subtitleText}>✦ RETRO ARCADE UNIVERSE ✦</Text>
            </View>

            {/* Boot Progress Bar */}
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, progressStyle]}>
                <LinearGradient
                  colors={['#00E5FF', '#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>

            {/* Dynamic Status Ticker */}
            <Text style={styles.bootStatusText} numberOfLines={1}>
              {bootText}
            </Text>

            {/* Scanline FX across the card */}
            <Animated.View style={[styles.scanline, scanlineStyle]} pointerEvents="none" />
          </Animated.View>

          {/* Quick Tap Skip Prompt */}
          <Animated.View style={[styles.skipPrompt, promptStyle]}>
            <Text style={styles.skipPromptText}>▶ TAP TO START ◀</Text>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    backgroundColor: '#07050E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.18,
    pointerEvents: 'none',
  },
  glowOrbCyan: {
    backgroundColor: '#00E5FF',
    transform: [{ scale: 1.4 }],
  },
  glowOrbPurple: {
    backgroundColor: '#8B5CF6',
    transform: [{ scale: 1.6 }],
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    opacity: 0.75,
  },
  gridContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    overflow: 'hidden',
    opacity: 0.22,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#8B5CF6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  badgeCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(15, 13, 26, 0.94)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.55)',
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  cornerRivet: {
    position: 'absolute',
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: '#00E5FF',
    opacity: 0.8,
  },
  rivetTL: { top: 6, left: 8 },
  rivetTR: { top: 6, right: 8 },
  rivetBL: { bottom: 6, left: 8 },
  rivetBR: { bottom: 6, right: 8 },
  microHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    marginBottom: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  microHeaderText: {
    fontFamily: Fonts.pixel,
    fontSize: FontSize['2xs'],
    color: '#A78BFA',
    includeFontPadding: false,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  titleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titleMain: {
    fontFamily: Fonts.pixel,
    fontSize: 22,
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  titleShadow: {
    position: 'absolute',
    fontFamily: Fonts.pixel,
    fontSize: 22,
    color: '#8B5CF6',
    includeFontPadding: false,
    textAlign: 'center',
    transform: [{ translateX: 2 }, { translateY: 2 }],
    opacity: 0.8,
  },
  titleSmall: {
    fontSize: 18,
  },
  subtitleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  subtitleText: {
    fontFamily: Fonts.pixel,
    fontSize: 7.5,
    color: '#94A3B8',
    includeFontPadding: false,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  bootStatusText: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: '#00E5FF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
  },
  skipPrompt: {
    marginTop: 22,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  skipPromptText: {
    fontFamily: Fonts.pixel,
    fontSize: 8.5,
    color: '#E2E8F0',
    includeFontPadding: false,
  },
});
