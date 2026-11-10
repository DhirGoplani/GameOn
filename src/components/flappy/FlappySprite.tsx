import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const BIRD_WING_UP = require('../../../assets/images/flappy/bird_wing_up.png');
const BIRD_WING_MID = require('../../../assets/images/flappy/bird_wing_mid.png');
const BIRD_WING_DOWN = require('../../../assets/images/flappy/bird_wing_down.png');
const BIRD_DEAD = require('../../../assets/images/flappy/bird_dead.png');

interface FlappySpriteProps {
  size?: number;
  isDead?: boolean;
  frameIndex?: number;
}

/**
 * High-Performance Pure Presentational Bird Sprite
 * Pre-decoded stacked image layers with zero internal timers or React state.
 * Frame is driven directly by the OOP BirdEntity kinematics.
 */
export const FlappySprite: React.FC<FlappySpriteProps> = React.memo(({
  size = 56,
  isDead = false,
  frameIndex = 1,
}) => {
  const activeFrame = isDead ? -1 : Math.max(0, Math.min(2, frameIndex));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 4 pre-decoded stacked layers with zero-overhead GPU opacity switching */}
      <Image
        source={BIRD_WING_UP}
        style={[styles.img, { opacity: !isDead && activeFrame === 0 ? 1 : 0 }]}
      />
      <Image
        source={BIRD_WING_MID}
        style={[styles.img, { opacity: !isDead && activeFrame === 1 ? 1 : 0 }]}
      />
      <Image
        source={BIRD_WING_DOWN}
        style={[styles.img, { opacity: !isDead && activeFrame === 2 ? 1 : 0 }]}
      />
      <Image
        source={BIRD_DEAD}
        style={[styles.img, { opacity: isDead ? 1 : 0 }]}
      />
    </View>
  );
});

FlappySprite.displayName = 'FlappySprite';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

