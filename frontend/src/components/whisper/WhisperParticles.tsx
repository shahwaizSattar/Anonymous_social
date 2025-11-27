import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { WhisperTheme } from '../../utils/whisperThemes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WhisperParticlesProps {
  theme: WhisperTheme;
  whispers: any[];
}

export const WhisperParticles: React.FC<WhisperParticlesProps> = ({ theme, whispers }) => {
  const particles = useRef<Animated.Value[]>([]);
  
  // Create particles based on mood
  const particleCount = theme.particleType === 'none' ? 0 : 20;

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
          duration: 5000 + index * 500,
          useNativeDriver: true,
        })
      ).start();
    });
  }, [theme]);

  const renderParticle = (index: number) => {
    const particle = particles.current[index];
    if (!particle) return null;

    const translateY = particle.interpolate({
      inputRange: [0, 1],
      outputRange: [SCREEN_HEIGHT, -100],
    });

    const translateX = particle.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 20, 0],
    });

    const opacity = particle.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    const getParticleSymbol = () => {
      switch (theme.particleType) {
        case 'stars': return '✨';
        case 'hearts': return '❤️';
        case 'sparkles': return '⚡';
        case 'rain': return '💧';
        case 'fog': return '🌫️';
        default: return '✨';
      }
    };

    const leftPosition = (index * 50) % SCREEN_WIDTH;

    return (
      <Animated.Text
        key={index}
        style={[
          styles.particle,
          {
            left: leftPosition,
            transform: [{ translateY }, { translateX }],
            opacity,
          },
        ]}
      >
        {getParticleSymbol()}
      </Animated.Text>
    );
  };

  if (theme.particleType === 'none') return null;

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
    fontSize: 20,
    opacity: 0.6,
  },
});

export default WhisperParticles;
