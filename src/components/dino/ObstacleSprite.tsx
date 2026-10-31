import React, { memo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { DinoObstacleSnapshot } from '../../engines/dino';

// High-Definition Illustrated Obstacle Sprites
const OBS_SPRITES = {
  cactusTall: require('../../../assets/images/obstacles_hd/cactus_tall.png'),
  cactusSmall: require('../../../assets/images/obstacles_hd/cactus_small.png'),
  cactusDouble: require('../../../assets/images/obstacles_hd/cactus_double.png'),
  cactusRound: require('../../../assets/images/obstacles_hd/cactus_round.png'),
  rockSmall: require('../../../assets/images/obstacles_hd/rock_small.png'),
  rockWide: require('../../../assets/images/obstacles_hd/rock_wide.png'),
  rockTall: require('../../../assets/images/obstacles_hd/rock_tall.png'),
  birds: [
    require('../../../assets/images/birds_hd/bird_0.png'),
    require('../../../assets/images/birds_hd/bird_1.png'),
    require('../../../assets/images/birds_hd/bird_2.png'),
    require('../../../assets/images/birds_hd/bird_3.png'),
    require('../../../assets/images/birds_hd/bird_4.png'),
    require('../../../assets/images/birds_hd/bird_5.png'),
    require('../../../assets/images/birds_hd/bird_6.png'),
    require('../../../assets/images/birds_hd/bird_7.png'),
  ],
};

export interface ObstacleSpriteProps {
  obstacle: DinoObstacleSnapshot;
}

export const ObstacleSprite = memo(({ obstacle }: ObstacleSpriteProps) => {
  // 1. ANGRY RED BIRDS (Full 8-frame aerodynamic flight cycle)
  if (obstacle.kind === 'bird') {
    const frameIndex = (obstacle.wingPhase ?? 0) % OBS_SPRITES.birds.length;
    const source = OBS_SPRITES.birds[frameIndex];

    return (
      <View style={[styles.container, { width: obstacle.width, height: obstacle.height, justifyContent: 'center' }]}>
        <Image
          source={source}
          style={{ width: obstacle.width, height: obstacle.height }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // 2. CACTI
  let source = OBS_SPRITES.cactusSmall;
  if (obstacle.variant === 'double') {
    source = OBS_SPRITES.cactusDouble;
  } else if (obstacle.variant === 'large') {
    source = OBS_SPRITES.cactusTall;
  } else {
    source = OBS_SPRITES.cactusSmall;
  }

  return (
    <View style={[styles.container, { width: obstacle.width, height: obstacle.height, justifyContent: 'flex-end' }]}>
      <Image
        source={source}
        style={{ width: obstacle.width, height: obstacle.height }}
        resizeMode="contain"
      />
    </View>
  );
});

ObstacleSprite.displayName = 'ObstacleSprite';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
