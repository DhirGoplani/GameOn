import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

export interface DinoGroundProps {
  distance: number;
  width: number;
  height?: number;
}

export const DinoGround = memo(({ distance, width, height = 80 }: DinoGroundProps) => {
  const offset = -(distance % 60);

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {/* Top Cyber/Retro Ground Trim Lines */}
      <View style={[styles.groundLine, { backgroundColor: '#00E5FF', top: 0, height: 2, opacity: 0.8 }]} />
      <View style={[styles.groundLine, { backgroundColor: '#4C1D95', top: 2, height: 2, opacity: 0.5 }]} />
      <View style={[styles.groundLine, { backgroundColor: '#1E1B4B', top: 4, height: 1, opacity: 0.4 }]} />

      {/* Moving Ground Detail Dashes */}
      <View style={[styles.dashesTrack, { transform: [{ translateX: offset }], width: width + 120 }]}>
        {Array.from({ length: Math.ceil(width / 60) + 3 }).map((_, i) => (
          <View key={i} style={styles.segment}>
            <View style={[styles.dash, { width: 14, height: 2, top: 10, left: 4 }]} />
            <View style={[styles.dash, { width: 22, height: 2, top: 16, left: 24 }]} />
            <View style={[styles.dash, { width: 8, height: 2, top: 26, left: 12 }]} />
            <View style={[styles.dash, { width: 16, height: 2, top: 34, left: 38 }]} />
            <View style={[styles.rock, { top: 8, left: 50 }]} />
          </View>
        ))}
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
  groundLine: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  dashesTrack: {
    flexDirection: 'row',
    height: '100%',
  },
  segment: {
    width: 60,
    height: '100%',
    position: 'relative',
  },
  dash: {
    position: 'absolute',
    backgroundColor: '#374151',
    borderRadius: 1,
    opacity: 0.7,
  },
  rock: {
    position: 'absolute',
    width: 4,
    height: 3,
    backgroundColor: '#4B5563',
    borderRadius: 1,
  },
});
