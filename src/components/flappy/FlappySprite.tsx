import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const BIRD_WING_UP = require('../../../assets/images/flappy/bird_wing_up.png');
const BIRD_WING_MID = require('../../../assets/images/flappy/bird_wing_mid.png');
const BIRD_WING_DOWN = require('../../../assets/images/flappy/bird_wing_down.png');
const BIRD_DEAD = require('../../../assets/images/flappy/bird_dead.png');

interface FlappySpriteProps {
  size?: number;
  isDead?: boolean;
}

export const FlappySprite: React.FC<FlappySpriteProps> = React.memo(({
  size = 56,
  isDead = false,
}) => {
  const [frame, setFrame] = useState(1);

  // Smooth, self-contained flap cycle that never re-renders the parent game loop
  useEffect(() => {
    if (isDead) return;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 3);
    }, 115);
    return () => clearInterval(interval);
  }, [isDead]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 4 pre-decoded stacked layers with zero-overhead GPU opacity switching */}
      <Image
        source={BIRD_WING_UP}
        style={[styles.img, { opacity: !isDead && frame === 0 ? 1 : 0 }]}
      />
      <Image
        source={BIRD_WING_MID}
        style={[styles.img, { opacity: !isDead && frame === 1 ? 1 : 0 }]}
      />
      <Image
        source={BIRD_WING_DOWN}
        style={[styles.img, { opacity: !isDead && frame === 2 ? 1 : 0 }]}
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
