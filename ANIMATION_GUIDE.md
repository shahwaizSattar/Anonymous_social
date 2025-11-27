# Animation Implementation Guide

## Implemented Animations

### 1. Post Hover Glow ✅
**Status**: Implemented
**Location**: HomeScreen.tsx, UserProfileScreen.tsx
**Effect**: Soft neon glow appears when post is touched

```typescript
// Current Implementation
const [hoveredPost, setHoveredPost] = useState<string | null>(null);

<TouchableOpacity
  onPressIn={() => setHoveredPost(post._id)}
  onPressOut={() => setHoveredPost(null)}
  style={[
    styles.postCard,
    hoveredPost === post._id && styles.postCardGlow
  ]}
>

// Style
postCardGlow: {
  shadowColor: theme.colors.primary,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 8,
}
```

### 2. Magnetic Hover Ripple (Basic) ✅
**Status**: Basic implementation complete
**Location**: All buttons in HomeScreen and UserProfileScreen
**Effect**: Visual feedback on button press

```typescript
// Current Implementation
<TouchableOpacity
  activeOpacity={0.6}
  onPress={handleAction}
>
```

## Advanced Animations to Add

### 3. Enhanced Magnetic Ripple Effect
**Status**: To be implemented
**Suggested Location**: Create `MagneticButton.tsx` component
**Effect**: Liquid ripple spreading outward like sonar ping

```typescript
// Suggested Implementation
import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';

const MagneticButton = ({ children, onPress, style }) => {
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // Scale down slightly
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Start ripple
    Animated.sequence([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.3, 0],
  });

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: '#6B73FF',
              borderRadius: 999,
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default MagneticButton;
```

**Usage**:
```typescript
import MagneticButton from '../../components/MagneticButton';

<MagneticButton onPress={handleLike} style={styles.actionBtn}>
  <Text>👍 Like</Text>
</MagneticButton>
```

### 4. Anonymous Mask Reveal
**Status**: To be implemented
**Suggested Location**: App.tsx or logo component
**Effect**: Logo/icon starts blurred, sharpens over 1 second

```typescript
// Suggested Implementation
import React, { useEffect, useRef } from 'react';
import { Animated, Image } from 'react-native';
import { BlurView } from 'expo-blur'; // or react-native-blur

const AnonymousMaskReveal = ({ source, style }) => {
  const blurAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(blurAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false, // blur doesn't support native driver
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: opacityAnim }]}>
      <Image source={source} style={style} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0,0,0,0.3)',
            opacity: blurAnim.interpolate({
              inputRange: [0, 20],
              outputRange: [0, 1],
            }),
          },
        ]}
      />
    </Animated.View>
  );
};

export default AnonymousMaskReveal;
```

**Alternative using CSS-like blur** (React Native doesn't have native blur for images):
```typescript
const AnonymousMaskReveal = ({ children, style }) => {
  const scaleAnim = useRef(new Animated.Value(1.2)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
```

**Usage in App.tsx**:
```typescript
import AnonymousMaskReveal from './components/AnonymousMaskReveal';

// In your splash or header
<AnonymousMaskReveal style={styles.logo}>
  <Image source={require('./assets/logo.png')} />
</AnonymousMaskReveal>
```

### 5. Enhanced Post Glow with Pulse
**Status**: Enhancement available
**Effect**: Pulsing glow for more premium feel

```typescript
// Enhanced Implementation
const PostCard = ({ post }) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isHovered]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15],
  });

  return (
    <Animated.View
      style={[
        styles.postCard,
        {
          shadowOpacity: glowOpacity,
          shadowRadius: 20,
          shadowColor: '#6B73FF',
        },
      ]}
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => setIsHovered(false)}
    >
      {/* Post content */}
    </Animated.View>
  );
};
```

### 6. Reaction Popup Animation
**Status**: Can be enhanced
**Effect**: Smooth scale and fade in

```typescript
// Add to ReactionPopup component
const ReactionPopup = ({ visible, position, onSelect, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.popup,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Reaction buttons */}
    </Animated.View>
  );
};
```

## Animation Best Practices

1. **Use Native Driver**: Always use `useNativeDriver: true` when possible for better performance
2. **Cleanup**: Stop animations in cleanup functions
3. **Interpolation**: Use interpolation for smooth transitions
4. **Spring Physics**: Use `Animated.spring` for natural feeling animations
5. **Timing**: Keep animations between 200-600ms for best UX
6. **Easing**: Use appropriate easing functions (ease-in-out for most cases)

## Performance Tips

1. Avoid animating layout properties (width, height, padding)
2. Prefer transform and opacity (GPU accelerated)
3. Use `shouldComponentUpdate` or `React.memo` for animated components
4. Limit number of simultaneous animations
5. Use `InteractionManager` for complex animations

## Testing Animations

1. Test on both iOS and Android
2. Test on low-end devices
3. Verify animations don't block UI
4. Check memory usage during animations
5. Test with reduced motion accessibility settings

## Next Steps

1. Implement MagneticButton component
2. Add AnonymousMaskReveal to app logo
3. Enhance ReactionPopup with scale animation
4. Add pulsing glow to new posts
5. Create animation showcase screen for testing
