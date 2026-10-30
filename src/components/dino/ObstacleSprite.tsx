import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { DinoObstacleSnapshot } from '../../engines/dino';

// Colors for Obstacles
const CACTUS_MAIN = '#10B981';   // Emerald Neon Green
const CACTUS_DARK = '#065F46';   // Dark Green Shadow
const CACTUS_LIGHT = '#6EE7B7';  // Light Thorn Highlight

const BIRD_BODY = '#8B5CF6';     // Purple Pterodactyl
const BIRD_WING = '#A78BFA';
const BIRD_BEAK = '#F59E0B';     // Amber Beak
const BIRD_EYE = '#FBBF24';

export interface ObstacleSpriteProps {
  obstacle: DinoObstacleSnapshot;
}

export const ObstacleSprite = memo(({ obstacle }: ObstacleSpriteProps) => {
  if (obstacle.kind === 'bird') {
    const isWingDown = obstacle.wingPhase === 1;

    return (
      <View style={[styles.container, { width: obstacle.width, height: obstacle.height }]}>
        {/* Bird Body */}
        <View style={[styles.pixel, { left: 14, top: 10, width: 22, height: 10, backgroundColor: BIRD_BODY, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 18, top: 12, width: 14, height: 6, backgroundColor: '#C4B5FD', borderRadius: 2 }]} />

        {/* Tail */}
        <View style={[styles.pixel, { left: 34, top: 12, width: 8, height: 4, backgroundColor: '#6D28D9', borderRadius: 1 }]} />
        <View style={[styles.pixel, { left: 40, top: 10, width: 6, height: 4, backgroundColor: '#5B21B6' }]} />

        {/* Head & Beak */}
        <View style={[styles.pixel, { left: 6, top: 8, width: 12, height: 10, backgroundColor: BIRD_BODY, borderRadius: 2 }]} />
        <View style={[styles.pixel, { left: 0, top: 11, width: 8, height: 4, backgroundColor: BIRD_BEAK, borderRadius: 1 }]} />
        <View style={[styles.pixel, { left: 10, top: 9, width: 4, height: 4, backgroundColor: BIRD_EYE }]} />
        <View style={[styles.pixel, { left: 11, top: 10, width: 2, height: 2, backgroundColor: '#000000' }]} />

        {/* Flapping Wing */}
        {isWingDown ? (
          <View style={[styles.pixel, { left: 18, top: 16, width: 14, height: 14, backgroundColor: BIRD_WING, borderRadius: 2, transform: [{ rotate: '20deg' }] }]} />
        ) : (
          <View style={[styles.pixel, { left: 18, top: 0, width: 14, height: 14, backgroundColor: BIRD_WING, borderRadius: 2, transform: [{ rotate: '-25deg' }] }]} />
        )}
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // CACTUS SPRITES
  // --------------------------------------------------------------------------
  if (obstacle.variant === 'double') {
    return (
      <View style={[styles.container, { width: obstacle.width, height: obstacle.height }]}>
        {/* Cactus 1 (Left, Small) */}
        <View style={[styles.pixel, { left: 8, bottom: 0, width: 8, height: 38, backgroundColor: CACTUS_DARK, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 10, bottom: 2, width: 4, height: 34, backgroundColor: CACTUS_MAIN }]} />
        <View style={[styles.pixel, { left: 2, bottom: 14, width: 8, height: 5, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
        <View style={[styles.pixel, { left: 2, bottom: 18, width: 5, height: 8, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
        <View style={[styles.pixel, { left: 14, bottom: 18, width: 8, height: 5, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
        <View style={[styles.pixel, { left: 17, bottom: 22, width: 5, height: 8, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />

        {/* Cactus 2 (Right, Medium) */}
        <View style={[styles.pixel, { left: 34, bottom: 0, width: 10, height: 44, backgroundColor: CACTUS_DARK, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 36, bottom: 2, width: 5, height: 40, backgroundColor: CACTUS_MAIN }]} />
        <View style={[styles.pixel, { left: 26, bottom: 16, width: 10, height: 6, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
        <View style={[styles.pixel, { left: 26, bottom: 20, width: 6, height: 10, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
        <View style={[styles.pixel, { left: 42, bottom: 20, width: 9, height: 6, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
        <View style={[styles.pixel, { left: 45, bottom: 24, width: 6, height: 10, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
      </View>
    );
  }

  if (obstacle.variant === 'large') {
    return (
      <View style={[styles.container, { width: obstacle.width, height: obstacle.height }]}>
        {/* Tall Saguaro Trunk */}
        <View style={[styles.pixel, { left: 13, bottom: 0, width: 10, height: 54, backgroundColor: CACTUS_DARK, borderRadius: 4 }]} />
        <View style={[styles.pixel, { left: 15, bottom: 2, width: 6, height: 50, backgroundColor: CACTUS_MAIN }]} />

        {/* Left Arm */}
        <View style={[styles.pixel, { left: 2, bottom: 20, width: 12, height: 7, backgroundColor: CACTUS_DARK, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 2, bottom: 25, width: 7, height: 15, backgroundColor: CACTUS_DARK, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 4, bottom: 27, width: 3, height: 11, backgroundColor: CACTUS_LIGHT }]} />

        {/* Right Arm */}
        <View style={[styles.pixel, { left: 21, bottom: 26, width: 12, height: 7, backgroundColor: CACTUS_DARK, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 26, bottom: 31, width: 7, height: 15, backgroundColor: CACTUS_DARK, borderRadius: 3 }]} />
        <View style={[styles.pixel, { left: 28, bottom: 33, width: 3, height: 11, backgroundColor: CACTUS_LIGHT }]} />

        {/* Thorns */}
        <View style={[styles.pixel, { left: 17, bottom: 10, width: 2, height: 4, backgroundColor: CACTUS_LIGHT }]} />
        <View style={[styles.pixel, { left: 17, bottom: 24, width: 2, height: 4, backgroundColor: CACTUS_LIGHT }]} />
        <View style={[styles.pixel, { left: 17, bottom: 38, width: 2, height: 4, backgroundColor: CACTUS_LIGHT }]} />
      </View>
    );
  }

  // Default Small Single Cactus
  return (
    <View style={[styles.container, { width: obstacle.width, height: obstacle.height }]}>
      {/* Main Trunk */}
      <View style={[styles.pixel, { left: 10, bottom: 0, width: 8, height: 40, backgroundColor: CACTUS_DARK, borderRadius: 3 }]} />
      <View style={[styles.pixel, { left: 12, bottom: 2, width: 4, height: 36, backgroundColor: CACTUS_MAIN }]} />

      {/* Left Branch */}
      <View style={[styles.pixel, { left: 2, bottom: 14, width: 10, height: 6, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
      <View style={[styles.pixel, { left: 2, bottom: 18, width: 6, height: 10, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
      <View style={[styles.pixel, { left: 4, bottom: 20, width: 3, height: 6, backgroundColor: CACTUS_LIGHT }]} />

      {/* Right Branch */}
      <View style={[styles.pixel, { left: 16, bottom: 18, width: 10, height: 6, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
      <View style={[styles.pixel, { left: 20, bottom: 22, width: 6, height: 12, backgroundColor: CACTUS_DARK, borderRadius: 2 }]} />
      <View style={[styles.pixel, { left: 22, bottom: 24, width: 3, height: 8, backgroundColor: CACTUS_LIGHT }]} />
    </View>
  );
});

ObstacleSprite.displayName = 'ObstacleSprite';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  pixel: {
    position: 'absolute',
  },
});
