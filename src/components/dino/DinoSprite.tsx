import React, { memo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { DinoPose } from '../../engines/dino';

// High-fidelity Red T-Rex sprite assets extracted from custom sprite sheet
const REX_SPRITES = {
  idle: require('../../../assets/images/rex/idle.png'),
  jump: require('../../../assets/images/rex/jump.png'),
  dead: require('../../../assets/images/rex/dead.png'),
  duck0: require('../../../assets/images/rex/duck_0.png'),
  duck1: require('../../../assets/images/rex/duck_1.png'),
  runs: [
    require('../../../assets/images/rex/run_0.png'),
    require('../../../assets/images/rex/run_1.png'),
    require('../../../assets/images/rex/run_2.png'),
    require('../../../assets/images/rex/run_3.png'),
    require('../../../assets/images/rex/run_4.png'),
    require('../../../assets/images/rex/run_5.png'),
    require('../../../assets/images/rex/run_6.png'),
    require('../../../assets/images/rex/run_7.png'),
    require('../../../assets/images/rex/run_8.png'),
  ],
};

export interface DinoSpriteProps {
  pose: DinoPose;
  runFrame: number;
  duckFrame: number;
  width?: number;
  height?: number;
}

export const DinoSprite = memo(({
  pose,
  runFrame,
  duckFrame,
  width = 72,
  height = 56,
}: DinoSpriteProps) => {
  // 1. DUCKING CROUCH
  if (pose === 'DUCKING') {
    const isDuck1 = duckFrame % 2 === 1;
    const source = isDuck1 ? REX_SPRITES.duck1 : REX_SPRITES.duck0;
    return (
      <Image
        source={source}
        style={{ width: width || 78, height: height || 32 }}
        resizeMode="contain"
      />
    );
  }

  // 2. EXTINCTION / DEAD (Flat on ground with dizzy stars)
  if (pose === 'DEAD') {
    return (
      <Image
        source={REX_SPRITES.dead}
        style={{ width: width || 78, height: height || 48 }}
        resizeMode="contain"
      />
    );
  }

  // 3. JUMPING LEAP
  if (pose === 'JUMPING') {
    return (
      <Image
        source={REX_SPRITES.jump}
        style={{ width: width || 64, height: height || 54 }}
        resizeMode="contain"
      />
    );
  }

  // 4. IDLE STANDING (Before game starts)
  if (pose === 'IDLE') {
    return (
      <Image
        source={REX_SPRITES.idle}
        style={{ width: width || 72, height: height || 56 }}
        resizeMode="contain"
      />
    );
  }

  // 5. 9-FRAME ULTRA-SMOOTH SPRINT CYCLE
  const frameIndex = runFrame % REX_SPRITES.runs.length;
  const runSource = REX_SPRITES.runs[frameIndex];

  return (
    <Image
      source={runSource}
      style={{ width: width || 72, height: height || 56 }}
      resizeMode="contain"
    />
  );
});

DinoSprite.displayName = 'DinoSprite';
