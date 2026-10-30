import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { DinoPose } from '../../engines/dino';

// Color Palette for Pixel Rex
const SKIN = '#22C55E';        // Neon Cyber Green
const SKIN_MID = '#16A34A';    // Mid Green
const SKIN_DARK = '#14532D';   // Dark Forest Green
const BELLY = '#86EFAC';       // Pale Mint Belly
const EYE = '#FACC15';         // Glowing Gold Eye
const PUPIL = '#000000';
const SPINE = '#15803D';

export interface DinoSpriteProps {
  pose: DinoPose;
  runFrame: number;
  duckFrame: number;
}

export const DinoSprite = memo(({ pose, runFrame, duckFrame }: DinoSpriteProps) => {
  if (pose === 'DUCKING') {
    const isFrame1 = duckFrame % 2 === 1;
    return (
      <View style={styles.duckContainer}>
        {/* Flat Back Spines */}
        <View style={[styles.pixel, { left: 16, top: 3, width: 4, height: 5, backgroundColor: SPINE }]} />
        <View style={[styles.pixel, { left: 24, top: 2, width: 4, height: 5, backgroundColor: SPINE }]} />
        <View style={[styles.pixel, { left: 32, top: 2, width: 4, height: 5, backgroundColor: SPINE }]} />

        {/* Low Tail */}
        <View style={[styles.pixel, { left: 2, top: 12, width: 12, height: 6, backgroundColor: SKIN_MID, borderTopLeftRadius: 3 }]} />
        <View style={[styles.pixel, { left: 0, top: 14, width: 6, height: 4, backgroundColor: SKIN_DARK }]} />

        {/* Low Horizontal Body */}
        <View style={[styles.pixel, { left: 14, top: 7, width: 34, height: 16, backgroundColor: SKIN, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 18, top: 13, width: 26, height: 8, backgroundColor: BELLY, borderRadius: 2 }]} />

        {/* Outstretched Snout / Head */}
        <View style={[styles.pixel, { left: 44, top: 4, width: 24, height: 16, backgroundColor: SKIN, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 52, top: 15, width: 16, height: 4, backgroundColor: SKIN_DARK }]} />
        <View style={[styles.pixel, { left: 58, top: 14, width: 3, height: 3, backgroundColor: '#FFFFFF' }]} />

        {/* Eye */}
        <View style={[styles.pixel, { left: 56, top: 6, width: 5, height: 5, backgroundColor: EYE, borderRadius: 1 }]} />
        <View style={[styles.pixel, { left: 58, top: 7, width: 2, height: 2, backgroundColor: PUPIL }]} />

        {/* Churning Legs */}
        {isFrame1 ? (
          <>
            <View style={[styles.pixel, { left: 24, top: 21, width: 8, height: 8, backgroundColor: SKIN_MID }]} />
            <View style={[styles.pixel, { left: 28, top: 27, width: 8, height: 4, backgroundColor: SKIN }]} />
            <View style={[styles.pixel, { left: 36, top: 21, width: 8, height: 6, backgroundColor: SKIN_DARK }]} />
          </>
        ) : (
          <>
            <View style={[styles.pixel, { left: 28, top: 21, width: 8, height: 6, backgroundColor: SKIN_DARK }]} />
            <View style={[styles.pixel, { left: 34, top: 21, width: 8, height: 8, backgroundColor: SKIN_MID }]} />
            <View style={[styles.pixel, { left: 38, top: 27, width: 8, height: 4, backgroundColor: SKIN }]} />
          </>
        )}
      </View>
    );
  }

  if (pose === 'JUMPING') {
    return (
      <View style={styles.standContainer}>
        {/* Tail sweeping high */}
        <View style={[styles.pixel, { left: 2, top: 18, width: 6, height: 5, backgroundColor: SKIN_DARK }]} />
        <View style={[styles.pixel, { left: 6, top: 16, width: 8, height: 7, backgroundColor: SKIN_MID }]} />
        <View style={[styles.pixel, { left: 12, top: 15, width: 10, height: 11, backgroundColor: SKIN }]} />

        {/* Spines */}
        <View style={[styles.pixel, { left: 18, top: 8, width: 3, height: 6, backgroundColor: SPINE }]} />
        <View style={[styles.pixel, { left: 22, top: 4, width: 3, height: 8, backgroundColor: SPINE }]} />
        <View style={[styles.pixel, { left: 26, top: 2, width: 3, height: 8, backgroundColor: SPINE }]} />

        {/* Body */}
        <View style={[styles.pixel, { left: 16, top: 14, width: 22, height: 24, backgroundColor: SKIN, borderRadius: 4 }]} />
        <View style={[styles.pixel, { left: 22, top: 20, width: 14, height: 14, backgroundColor: BELLY, borderRadius: 3 }]} />

        {/* Head */}
        <View style={[styles.pixel, { left: 28, top: 1, width: 24, height: 20, backgroundColor: SKIN, borderRadius: 4 }]} />
        <View style={[styles.pixel, { left: 36, top: 17, width: 16, height: 4, backgroundColor: SKIN_DARK }]} />
        <View style={[styles.pixel, { left: 40, top: 5, width: 6, height: 6, backgroundColor: EYE, borderRadius: 1 }]} />
        <View style={[styles.pixel, { left: 43, top: 6, width: 2, height: 3, backgroundColor: PUPIL }]} />

        {/* Tucked Jump Legs */}
        <View style={[styles.pixel, { left: 20, top: 36, width: 10, height: 8, backgroundColor: SKIN, borderRadius: 2 }]} />
        <View style={[styles.pixel, { left: 28, top: 38, width: 9, height: 7, backgroundColor: SKIN_DARK, borderRadius: 2 }]} />
      </View>
    );
  }

  if (pose === 'DEAD') {
    return (
      <View style={styles.standContainer}>
        <View style={[styles.pixel, { left: 16, top: 18, width: 22, height: 26, backgroundColor: SKIN, borderRadius: 4 }]} />
        <View style={[styles.pixel, { left: 28, top: 6, width: 24, height: 20, backgroundColor: SKIN, borderRadius: 4 }]} />
        <View style={[styles.pixel, { left: 36, top: 22, width: 16, height: 4, backgroundColor: SKIN_DARK }]} />

        {/* Red X Eye */}
        <View style={[styles.pixel, { left: 38, top: 9, width: 8, height: 8 }]}>
          <View style={{ position: 'absolute', width: 8, height: 2, backgroundColor: '#EF4444', top: 3, transform: [{ rotate: '45deg' }] }} />
          <View style={{ position: 'absolute', width: 8, height: 2, backgroundColor: '#EF4444', top: 3, transform: [{ rotate: '-45deg' }] }} />
        </View>

        {/* Sprawled Legs */}
        <View style={[styles.pixel, { left: 24, top: 44, width: 14, height: 6, backgroundColor: SKIN }]} />
        <View style={[styles.pixel, { left: 12, top: 46, width: 12, height: 5, backgroundColor: SKIN_DARK }]} />
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // RUNNING POSE (Frames 0, 1, 2, 3)
  // --------------------------------------------------------------------------
  const f = runFrame % 4;
  const isLeftForward = f === 0;
  const isPassing = f === 1 || f === 3;
  const isRightForward = f === 2;

  return (
    <View style={styles.standContainer}>
      {/* Spines */}
      <View style={[styles.pixel, { left: 18, top: 10, width: 3, height: 6, backgroundColor: SPINE }]} />
      <View style={[styles.pixel, { left: 22, top: 6, width: 3, height: 8, backgroundColor: SPINE }]} />
      <View style={[styles.pixel, { left: 26, top: 4, width: 3, height: 8, backgroundColor: SPINE }]} />
      <View style={[styles.pixel, { left: 30, top: 6, width: 3, height: 6, backgroundColor: SPINE }]} />

      {/* Tail with subtle run bob */}
      <View style={[styles.pixel, { left: 2, top: isPassing ? 24 : 22, width: 6, height: 5, backgroundColor: SKIN_DARK }]} />
      <View style={[styles.pixel, { left: 6, top: isPassing ? 22 : 20, width: 8, height: 8, backgroundColor: SKIN_MID }]} />
      <View style={[styles.pixel, { left: 12, top: 20, width: 10, height: 12, backgroundColor: SKIN }]} />

      {/* Body */}
      <View style={[styles.pixel, { left: 16, top: 16, width: 22, height: 26, backgroundColor: SKIN, borderRadius: 4 }]} />
      <View style={[styles.pixel, { left: 22, top: 24, width: 14, height: 16, backgroundColor: BELLY, borderRadius: 3 }]} />

      {/* Head */}
      <View style={[styles.pixel, { left: 28, top: isPassing ? 3 : 2, width: 24, height: 20, backgroundColor: SKIN, borderRadius: 4 }]} />
      <View style={[styles.pixel, { left: 34, top: isPassing ? 3 : 2, width: 14, height: 4, backgroundColor: SKIN_DARK }]} />
      <View style={[styles.pixel, { left: 36, top: 18, width: 16, height: 4, backgroundColor: SKIN_DARK }]} />
      <View style={[styles.pixel, { left: 40, top: 18, width: 2, height: 3, backgroundColor: '#FFFFFF' }]} />
      <View style={[styles.pixel, { left: 44, top: 18, width: 2, height: 3, backgroundColor: '#FFFFFF' }]} />

      {/* Eye & Pupil */}
      <View style={[styles.pixel, { left: 40, top: 6, width: 6, height: 6, backgroundColor: EYE, borderRadius: 1 }]} />
      <View style={[styles.pixel, { left: 42, top: 7, width: 2, height: 3, backgroundColor: PUPIL }]} />

      {/* Small Arm */}
      <View style={[styles.pixel, { left: 36, top: 28, width: 8, height: 4, backgroundColor: SKIN_MID, borderRadius: 2 }]} />
      <View style={[styles.pixel, { left: 42, top: 29, width: 3, height: 3, backgroundColor: '#EAB308' }]} />

      {/* Dynamic Animated Legs */}
      {isLeftForward && (
        <>
          {/* Left leg planted forward */}
          <View style={[styles.pixel, { left: 26, top: 40, width: 6, height: 12, backgroundColor: SKIN }]} />
          <View style={[styles.pixel, { left: 24, top: 50, width: 11, height: 5, backgroundColor: SKIN_MID, borderBottomRightRadius: 2 }]} />
          {/* Right leg trailing back */}
          <View style={[styles.pixel, { left: 16, top: 40, width: 6, height: 9, backgroundColor: SKIN_DARK }]} />
          <View style={[styles.pixel, { left: 12, top: 47, width: 8, height: 5, backgroundColor: SKIN_DARK }]} />
        </>
      )}

      {isRightForward && (
        <>
          {/* Right leg planted forward */}
          <View style={[styles.pixel, { left: 26, top: 40, width: 6, height: 12, backgroundColor: SKIN_DARK }]} />
          <View style={[styles.pixel, { left: 24, top: 50, width: 11, height: 5, backgroundColor: SKIN_DARK, borderBottomRightRadius: 2 }]} />
          {/* Left leg trailing back */}
          <View style={[styles.pixel, { left: 16, top: 40, width: 6, height: 9, backgroundColor: SKIN }]} />
          <View style={[styles.pixel, { left: 12, top: 47, width: 8, height: 5, backgroundColor: SKIN_MID }]} />
        </>
      )}

      {isPassing && (
        <>
          <View style={[styles.pixel, { left: 24, top: 42, width: 6, height: 10, backgroundColor: SKIN }]} />
          <View style={[styles.pixel, { left: 22, top: 51, width: 9, height: 4, backgroundColor: SKIN_MID }]} />
          <View style={[styles.pixel, { left: 18, top: 42, width: 6, height: 9, backgroundColor: SKIN_DARK }]} />
          <View style={[styles.pixel, { left: 16, top: 50, width: 8, height: 4, backgroundColor: SKIN_DARK }]} />
        </>
      )}
    </View>
  );
});

DinoSprite.displayName = 'DinoSprite';

const styles = StyleSheet.create({
  standContainer: {
    width: 54,
    height: 58,
    position: 'relative',
  },
  duckContainer: {
    width: 70,
    height: 32,
    position: 'relative',
  },
  pixel: {
    position: 'absolute',
  },
});
