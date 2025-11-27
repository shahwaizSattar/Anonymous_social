import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import Toast from 'react-native-toast-message';
import { censorText } from '../../utils/censorUtils';

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [voiceNotePlaying, setVoiceNotePlaying] = useState<{ [key: string]: boolean }>({});
  const [voiceSounds, setVoiceSounds] = useState<{ [key: string]: Audio.Sound }>({});

  const loadUserPosts = async () => {
    if (!user?.username) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response: any = await postsAPI.getUserPosts(user.username, 1, 20);
      const posts = response.posts || response.data || [];
      setUserPosts(posts);
    } catch (error: any) {
      console.log('Error loading user posts:', error);
      const message = error?.response?.data?.message || 'Failed to load your posts';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserPosts();
    setRefreshing(false);
  }, [user?.username]);

  useEffect(() => {
    loadUserPosts();
  }, [user?.username]);

  // Refresh posts when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      loadUserPosts();
    }, [user?.username])
  );

  const getVoiceEffectSettings = (effect?: string) => {
    switch (effect) {
      case 'deep':
        return { rate: 0.8, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
      case 'soft':
        return { rate: 0.9, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
      case 'robot':
        return { rate: 1.0, pitchCorrectionQuality: Audio.PitchCorrectionQuality.Low };
      case 'glitchy':
        return { rate: 1.2, pitchCorrectionQuality: Audio.PitchCorrectionQuality.Low };
      case 'girly':
        return { rate: 1.15, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
      case 'boyish':
        return { rate: 0.85, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
      default:
        return { rate: 1.0, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
    }
  };

  const playVoiceNote = async (postId: string, voiceUrl: string, effect?: string) => {
    try {
      if (voiceNotePlaying[postId] && voiceSounds[postId]) {
        await voiceSounds[postId].pauseAsync();
        setVoiceNotePlaying(prev => ({ ...prev, [postId]: false }));
        return;
      }

      if (voiceSounds[postId]) {
        const status = await voiceSounds[postId].getStatusAsync();
        if (status.isLoaded) {
          if (status.didJustFinish || (status.durationMillis && status.positionMillis >= status.durationMillis)) {
            await voiceSounds[postId].replayAsync();
          } else {
            await voiceSounds[postId].playAsync();
          }
          setVoiceNotePlaying(prev => ({ ...prev, [postId]: true }));
        }
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const playbackSettings = getVoiceEffectSettings(effect);

      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceUrl },
        { 
          shouldPlay: true,
          ...playbackSettings
        },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setVoiceNotePlaying(prev => ({ ...prev, [postId]: false }));
          }
        }
      );

      setVoiceSounds(prev => ({ ...prev, [postId]: sound }));
      setVoiceNotePlaying(prev => ({ ...prev, [postId]: true }));
    } catch (error) {
      console.error('Error playing voice note:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to play voice note' });
    }
  };

  const formatVoiceDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `0:${seconds.toString().padStart(2, '0')}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderVoiceNote = (voiceNote: { url: string; effect?: string; duration?: number }, postId: string) => {
    const voiceId = 'voice_' + postId;
    const isPlaying = voiceNotePlaying[voiceId] || false;
    const duration = voiceNote.duration || 0;

    return (
      <View style={styles.voiceNoteContainer}>
        <TouchableOpacity
          style={styles.voiceNoteButton}
          onPress={(e) => {
            e.stopPropagation();
            playVoiceNote(voiceId, voiceNote.url, voiceNote.effect);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.playButtonCircle}>
            <Text style={styles.playButtonIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </View>
          
          <View style={styles.voiceWaveformContainer}>
            <View style={styles.waveformBars}>
              {[...Array(25)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.waveformBar,
                    { 
                      height: Math.random() * 16 + 8,
                      backgroundColor: isPlaying ? '#00D4AA' : '#555'
                    }
                  ]} 
                />
              ))}
            </View>
            <View style={styles.voiceNoteFooter}>
              <Text style={styles.voiceNoteDuration}>
                {duration > 0 ? formatVoiceDuration(duration) : '0:00'}
              </Text>
              {voiceNote.effect && voiceNote.effect !== 'none' && (
                <Text style={styles.voiceNoteEffect}>• {voiceNote.effect}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xl,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      ...theme.shadows.medium,
    },
    avatarText: {
      fontSize: 40,
      color: theme.colors.primary,
    },
    username: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    bio: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.small,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    badgesContainer: {
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    badgesScroll: {
      flexDirection: 'row',
    },
    badge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.md,
      alignItems: 'center',
      minWidth: 80,
    },
    badgeIcon: {
      fontSize: 24,
      marginBottom: theme.spacing.xs,
    },
    badgeName: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    menuContainer: {
      paddingHorizontal: theme.spacing.xl,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    menuIcon: {
      fontSize: 20,
      marginRight: theme.spacing.md,
      width: 30,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    menuArrow: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    logoutButton: {
      backgroundColor: theme.colors.error,
      marginTop: theme.spacing.lg,
    },
    logoutText: {
      color: theme.colors.textInverse,
    },
    preferencesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.md,
    },
    preferenceTag: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.round,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    preferenceText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    postsSection: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
    },
    postCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small,
    },
    postCategory: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
    },
    postText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: theme.spacing.md,
    },
    postMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    postDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    postReactions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reactionEmoji: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    reactionText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    mediaContainer: {
      marginVertical: theme.spacing.md,
    },
    mediaItem: {
      marginRight: theme.spacing.sm,
    },
    mediaContent: {
      height: 200,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
    },
    videoContainer: {
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
    emptyPosts: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: theme.spacing.lg,
    },
    loadingPosts: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: theme.spacing.lg,
    },
    oneTimeBadge: {
      backgroundColor: 'rgba(255, 107, 53, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    oneTimeBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FF6B35',
    },
    lockIndicator: {
      fontSize: 11,
      color: theme.colors.error,
      marginTop: 8,
    },
    voiceNoteContainer: {
      marginVertical: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    voiceNoteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    playButtonCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    playButtonIcon: {
      color: '#000',
      fontSize: 16,
      marginLeft: 2,
    },
    voiceWaveformContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    waveformBars: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 24,
      gap: 2,
      marginBottom: 4,
    },
    waveformBar: {
      width: 2.5,
      borderRadius: 2,
      opacity: 0.8,
    },
    voiceNoteFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    voiceNoteDuration: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    voiceNoteEffect: {
      fontSize: 11,
      color: theme.colors.primary,
      textTransform: 'capitalize',
      fontWeight: '500',
    },
  });

  // Media renderer component
  const renderMedia = (media: any[]) => {
    if (!media || media.length === 0) return null;

    const screenWidth = Dimensions.get('window').width;
    const mediaWidth = screenWidth - 80; // Account for padding

    return (
      <View style={styles.mediaContainer}>
        <FlatList
          data={media}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.mediaItem}>
              {item.type === 'video' || item.mimetype?.startsWith('video/') ? (
                <View style={styles.videoContainer}>
                  <Video
                    source={{ uri: item.url }}
                    style={[styles.mediaContent, { width: mediaWidth * 0.8 }]}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                  />
                </View>
              ) : (
                <Image 
                  source={{ uri: item.url }} 
                  style={[styles.mediaContent, { width: mediaWidth * 0.8 }]}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        />
      </View>
    );
  };

  const menuItems = [
    { icon: '✏️', title: 'Edit Profile', onPress: () => navigation.navigate('EditProfile' as never) },
    { icon: '💬', title: 'Messages', onPress: () => navigation.navigate('Messages' as never) },
    { icon: '🚫', title: 'Blocked Users', onPress: () => navigation.navigate('BlockedUsers' as never) },
    { icon: '⚙️', title: 'Settings', onPress: () => navigation.navigate('Settings' as never) },
    { icon: '🎨', title: 'Themes', onPress: () => {} },
    { icon: '📊', title: 'Analytics', onPress: () => {} },
    { icon: '❓', title: 'Help & Support', onPress: () => {} },
    { icon: '📋', title: 'Privacy Policy', onPress: () => {} },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.background]}
        style={styles.header}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          ) : (
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </View>

        {/* User Info */}
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.bio}>
          {user?.bio || 'No bio yet. Add one to tell the community about yourself!'}
        </Text>

        {/* Preferences */}
        <View style={styles.preferencesContainer}>
          {user?.preferences?.map((preference) => (
            <View key={preference} style={styles.preferenceTag}>
              <Text style={styles.preferenceText}>#{preference}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.postsCount || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.followersCount || 0}</Text>
          <Text style={styles.statLabel}>Echoes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.followingCount || 0}</Text>
          <Text style={styles.statLabel}>Echoing</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.karmaScore || 0}</Text>
          <Text style={styles.statLabel}>Karma</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesContainer}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
          {user?.badges?.map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
          {(!user?.badges || user.badges.length === 0) && (
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🏆</Text>
              <Text style={styles.badgeName}>Start earning badges!</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Posts Section */}
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>My Posts</Text>
        {loading ? (
          <Text style={styles.loadingPosts}>Loading posts...</Text>
        ) : userPosts.length > 0 ? (
          userPosts.map((post: any) => (
            <TouchableOpacity 
              key={post._id} 
              style={styles.postCard}
              onPress={() => (navigation as any).navigate('PostDetail', { postId: post._id })}
            >
              {post.category && <Text style={styles.postCategory}>#{post.category}</Text>}
              
              {/* One-Time Post Badge */}
              {post.oneTime?.enabled && (
                <View style={styles.oneTimeBadge}>
                  <Text style={styles.oneTimeBadgeText}>
                    ✨ One-Time Post • {post.oneTime.viewedBy?.length || 0} views
                  </Text>
                </View>
              )}
              
              {/* Content */}
              {post.content?.text && (
                <Text style={styles.postText}>{censorText(post.content.text)}</Text>
              )}
              {post.content?.voiceNote?.url && renderVoiceNote(post.content.voiceNote, post._id)}
              {renderMedia(post.content?.media)}
              
              <View style={styles.postMeta}>
                <Text style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.postReactions}>
                  <Text style={styles.reactionEmoji}>❤️</Text>
                  <Text style={styles.reactionText}>
                    {post.reactionCounts?.total || 0} • {post.comments?.length || 0} comments
                  </Text>
                </View>
              </View>
              
              {/* Lock indicators */}
              {(post.interactions?.reactionsLocked || post.interactions?.commentsLocked) && (
                <Text style={styles.lockIndicator}>
                  🔒 {post.interactions?.reactionsLocked && post.interactions?.commentsLocked 
                    ? 'Reactions & Comments locked' 
                    : post.interactions?.reactionsLocked 
                      ? 'Reactions locked' 
                      : 'Comments locked'}
                </Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyPosts}>
            No posts yet. Start sharing your thoughts!
          </Text>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.title}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={logout}
        >
          <Text style={[styles.menuIcon, styles.logoutText]}>🚪</Text>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
