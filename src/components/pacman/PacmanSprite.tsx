import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export type PacmanDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const PACMAN_SPRITES: Record<PacmanDirection, any[]> = {
  RIGHT: [
    require('../../../assets/images/pacman/pacman_right_0.png'),
    require('../../../assets/images/pacman/pacman_right_1.png'),
    require('../../../assets/images/pacman/pacman_right_2.png'),
    require('../../../assets/images/pacman/pacman_right_3.png'),
  ],
  LEFT: [
    require('../../../assets/images/pacman/pacman_left_0.png'),
    require('../../../assets/images/pacman/pacman_left_1.png'),
    require('../../../assets/images/pacman/pacman_left_2.png'),
    require('../../../assets/images/pacman/pacman_left_3.png'),
  ],
  UP: [
    require('../../../assets/images/pacman/pacman_up_0.png'),
    require('../../../assets/images/pacman/pacman_up_1.png'),
    require('../../../assets/images/pacman/pacman_up_2.png'),
    require('../../../assets/images/pacman/pacman_up_3.png'),
  ],
  DOWN: [
    require('../../../assets/images/pacman/pacman_down_0.png'),
    require('../../../assets/images/pacman/pacman_down_1.png'),
    require('../../../assets/images/pacman/pacman_down_2.png'),
    require('../../../assets/images/pacman/pacman_down_3.png'),
  ],
};

interface PacmanSpriteProps {
  size: number;
  direction: PacmanDirection;
  frameIndex?: number;
}

export const PacmanSprite: React.FC<PacmanSpriteProps> = ({
  size,
  direction = 'RIGHT',
  frameIndex = 0,
}) => {
  const dirFrames = PACMAN_SPRITES[direction] || PACMAN_SPRITES.RIGHT;
  const safeFrame = Math.abs(frameIndex) % dirFrames.length;
  const source = dirFrames[safeFrame];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={source}
        style={{ width: size, height: size }}
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
