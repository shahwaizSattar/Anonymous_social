import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ParticleNoiseRevealProps {
  text: string;
  onReveal: () => void;
  revealed: boolean;
}

const ParticleNoiseReveal: React.FC<ParticleNoiseRevealProps> = ({ text, onReveal, revealed }) => {
  const { theme } = useTheme();
  const [isRevealing, setIsRevealing] = useState(false);
  const noiseOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([]);
  
  // Generate particles on mount
  useEffect(() => {
    const width = Dimensions.get('window').width - 40;
    const height = 100;
    const particleCount = 80;
    
    const newParticles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.4,
    }));
    
    setParticles(newParticles);
  }, []);

  // Animate particles
  const particleAnimations = useRef<Animated.CompositeAnimation[]>([]);
  
  useEffect(() => {
    if (!revealed && particles.length > 0) {
      // Create jittering animation for each particle
      const width = Dimensions.get('window').width - 40;
      const height = 100;
      
      particleAnimations.current = particles.map((_, index) => {
        const xAnim = new Animated.Value(0);
        const yAnim = new Animated.Value(0);
        
        return Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(xAnim, {
                toValue: (Math.random() - 0.5) * 10,
                duration: 200 + Math.random() * 300,
                useNativeDriver: true,
              }),
              Animated.timing(xAnim, {
                toValue: 0,
                duration: 200 + Math.random() * 300,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(yAnim, {
                toValue: (Math.random() - 0.5) * 10,
                duration: 200 + Math.random() * 300,
                useNativeDriver: true,
              }),
              Animated.timing(yAnim, {
                toValue: 0,
                duration: 200 + Math.random() * 300,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
      });

      particleAnimations.current.forEach((anim) => anim.start());

      return () => {
        particleAnimations.current.forEach((anim) => anim.stop());
      };
    }
  }, [revealed, particles]);

  const handlePress = () => {
    if (revealed || isRevealing) return;
    
    setIsRevealing(true);
    
    // Stop particle animations
    particleAnimations.current.forEach((anim) => anim.stop());
    
    // Fade out noise mask with dissolve effect
    Animated.parallel([
      Animated.timing(noiseOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onReveal();
      setIsRevealing(false);
    });
  };

  if (revealed) {
    return (
      <Text style={[styles.revealedText, { color: theme.colors.text }]}>
        {text}
      </Text>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.container}>
        {/* Hidden text layer */}
        <Animated.View style={[styles.textLayer, { opacity: textOpacity }]}>
          <Text style={[styles.hiddenText, { color: theme.colors.text }]}>
            {text}
          </Text>
        </Animated.View>

        {/* Particle noise mask */}
        <Animated.View style={[styles.noiseLayer, { opacity: noiseOpacity }]}>
          {particles.map((particle, index) => (
            <View
              key={index}
              style={[
                styles.particle,
                {
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  opacity: particle.opacity,
                  borderRadius: particle.size / 2,
                },
              ]}
            />
          ))}
          
          {/* Overlay hint */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              👆 Tap to reveal
            </Text>
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  textLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  hiddenText: {
    fontSize: 16,
    lineHeight: 24,
  },
  noiseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  revealedText: {
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 16,
  },
});

export default ParticleNoiseReveal;
