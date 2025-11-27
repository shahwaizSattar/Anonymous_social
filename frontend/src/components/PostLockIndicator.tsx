import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PostLockIndicatorProps {
  commentsLocked?: boolean;
  reactionsLocked?: boolean;
  compact?: boolean;
}

const PostLockIndicator: React.FC<PostLockIndicatorProps> = ({
  commentsLocked,
  reactionsLocked,
  compact = false,
}) => {
  const { theme } = useTheme();

  if (!commentsLocked && !reactionsLocked) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.error + '15',
      paddingVertical: compact ? 6 : 8,
      paddingHorizontal: compact ? 10 : 12,
      borderRadius: 8,
      marginTop: compact ? 6 : 8,
      gap: 8,
    },
    icon: {
      fontSize: compact ? 14 : 16,
    },
    text: {
      fontSize: compact ? 11 : 13,
      color: theme.colors.error,
      fontWeight: '500',
      flex: 1,
    },
  });

  const lockMessages = [];
  if (reactionsLocked) lockMessages.push('Reactions');
  if (commentsLocked) lockMessages.push('Comments');

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.text}>
        {lockMessages.join(' & ')} locked
      </Text>
    </View>
  );
};

export default PostLockIndicator;
