import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WhisperBackgroundAnimationProps {
  animation: string;
}

export const WhisperBackgroundAnimation: React.FC<WhisperBackgroundAnimationProps> = ({ animation }) => {
  const particles = useRef<Animated.Value[]>([]);
  
  const particleCount = 30;

  useEffect(() => {
    // Initialize particles
    particles.current = Array(particleCount)
      .fill(0)
      .map(() => new Animated.Value(0));

    // Animate particles
    particles.current.forEach((particle, index) => {
      Animated.loop(
        Animated.timing(particle, {
          toValue: 1,
          duration: 3000 + index * 200,
          useNativeDriver: true,
        })
      ).start();
    });
  }, [animation]);

  const renderParticle = (index: number) => {
    const particle = particles.current[index];
    if (!particle) return null;

    const translateY = particle.interpolate({
      inputRange: [0, 1],
      outputRange: animation === 'snow' ? [-100, SCREEN_HEIGHT] : [SCREEN_HEIGHT, -100],
    });

    const translateX = particle.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, (Math.random() - 0.5) * 50, 0],
    });

    const opacity = particle.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 0.8, 0.8, 0],
    });

    const scale = particle.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.5],
    });

    const getParticleSymbol = () => {
      switch (animation) {
        case 'rain': return '💧';
        case 'neon': return '⚡';
        case 'fire': return '🔥';
        case 'snow': return '❄️';
        case 'hearts': return '💕';
        case 'mist': return '🌫️';
        default: return '';
      }
    };

    const leftPosition = (index * 37) % SCREEN_WIDTH;

    return (
      <Animated.Text
        key={index}
        style={[
          styles.particle,
          {
            left: leftPosition,
            transform: [{ translateY }, { translateX }, { scale }],
            opacity,
          },
        ]}
      >
        {getParticleSymbol()}
      </Animated.Text>
    );
  };

  if (!animation || animation === 'none') return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array(particleCount)
        .fill(0)
        .map((_, index) => renderParticle(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    fontSize: 18,
  },
});

export default WhisperBackgroundAnimation;
