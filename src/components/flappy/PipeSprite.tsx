import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const PIPE_TOP_FULL = require('../../../assets/images/flappy/pipe_top_full.png');
const PIPE_BOTTOM_FULL = require('../../../assets/images/flappy/pipe_bottom_full.png');

interface PipeSpriteProps {
  type: 'top' | 'bottom';
  width: number;
}

export const PipeSprite: React.FC<PipeSpriteProps> = React.memo(({ type, width }) => {
  if (type === 'top') {
    return (
      <View style={[styles.container, { width }]}>
        <Image
          source={PIPE_TOP_FULL}
          style={[styles.pipeImg, { bottom: 0 }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width }]}>
      <Image
        source={PIPE_BOTTOM_FULL}
        style={[styles.pipeImg, { top: 0 }]}
        resizeMode="cover"
      />
    </View>
  );
});

PipeSprite.displayName = 'PipeSprite';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  pipeImg: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 850,
  },
});
