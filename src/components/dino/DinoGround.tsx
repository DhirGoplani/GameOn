import React, { memo } from 'react';
import { View, StyleSheet, Image } from 'react-native';

const GROUND_IMG = require('../../../assets/images/dino/ground.png');

export interface DinoGroundProps {
  distance: number;
  width: number;
  height?: number;
}

export const DinoGround = memo(({ distance, width, height = 80 }: DinoGroundProps) => {
  // ground.png is 1024px wide, original Chrome ground height is 9px (rendered at 14px)
  const groundTileWidth = 1024;
  const offset = -(distance % groundTileWidth);

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {/* Top Cyber/Retro Ground Accent Glow Line */}
      <View style={[styles.groundGlow, { backgroundColor: '#00E5FF', top: 0, height: 1.5, opacity: 0.8 }]} />

      {/* Repeating Authentic Chrome Ground Track */}
      <View style={[styles.groundTrack, { transform: [{ translateX: offset }], width: width + groundTileWidth + 200 }]}>
        <Image
          source={GROUND_IMG}
          style={styles.groundImage}
          resizeMode="repeat"
        />
        <Image
          source={GROUND_IMG}
          style={styles.groundImage}
          resizeMode="repeat"
        />
      </View>
    </View>
  );
});

DinoGround.displayName = 'DinoGround';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  groundGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
  },
  groundTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    height: 16,
  },
  groundImage: {
    width: 1024,
    height: 14,
    tintColor: '#E2E8F0', // Crisp off-white retro pixel ground
  },
});
