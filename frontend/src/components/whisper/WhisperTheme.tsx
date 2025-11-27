import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { WhisperTheme as ThemeType } from '../../utils/whisperThemes';

interface WhisperThemeProps {
  theme: ThemeType;
}

export const WhisperTheme: React.FC<WhisperThemeProps> = ({ theme }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the theme background
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Ambient glow for Neon Rush theme
    if (theme.name.includes('Neon Rush')) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [theme]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.backgroundColor,
    },
    gradient: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.3,
    },
    neonGlow: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.accentColor,
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.gradient} />
      {theme.name.includes('Neon Rush') && (
        <Animated.View style={[styles.neonGlow, { opacity: glowOpacity }]} />
      )}
    </Animated.View>
  );
};

export default WhisperTheme;
