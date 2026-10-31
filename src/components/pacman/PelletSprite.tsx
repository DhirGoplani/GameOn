import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const DOT_IMAGE = require('../../../assets/images/pacman/dot.png');
const POWER_PELLET_IMAGE = require('../../../assets/images/pacman/power_pellet.png');
const CHERRY_IMAGE = require('../../../assets/images/pacman/cherry.png');

interface PelletSpriteProps {
  type: 'dot' | 'power' | 'cherry';
  size: number;
}

export const PelletSprite: React.FC<PelletSpriteProps> = ({ type, size }) => {
  let source = DOT_IMAGE;
  let renderSize = size * 0.35;

  if (type === 'power') {
    source = POWER_PELLET_IMAGE;
    renderSize = size * 0.75;
  } else if (type === 'cherry') {
    source = CHERRY_IMAGE;
    renderSize = size * 0.95;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={source}
        style={{ width: renderSize, height: renderSize }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
