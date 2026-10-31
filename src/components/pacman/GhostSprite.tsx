import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export type GhostColor = 'red' | 'pink' | 'cyan' | 'orange';

const GHOST_SPRITES: Record<GhostColor, any> = {
  red: require('../../../assets/images/pacman/ghost_red.png'),
  pink: require('../../../assets/images/pacman/ghost_pink.png'),
  cyan: require('../../../assets/images/pacman/ghost_cyan.png'),
  orange: require('../../../assets/images/pacman/ghost_orange.png'),
};

const SCARED_GHOST = require('../../../assets/images/pacman/ghost_scared.png');

interface GhostSpriteProps {
  size: number;
  color: GhostColor;
  isFrightened?: boolean;
  isBlinking?: boolean;
}

export const GhostSprite: React.FC<GhostSpriteProps> = ({
  size,
  color,
  isFrightened = false,
  isBlinking = false,
}) => {
  let source = isFrightened ? SCARED_GHOST : (GHOST_SPRITES[color] || GHOST_SPRITES.red);

  return (
    <View style={[styles.container, { width: size, height: size, opacity: isBlinking ? 0.6 : 1.0 }]}>
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
