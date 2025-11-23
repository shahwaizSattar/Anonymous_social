import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, FlatList, Dimensions, Platform, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { postsAPI, userAPI } from '../../services/api';
import { reactionsAPI } from '../../services/reactions';
import { useAuth } from '../../context/AuthContext';
import { convertAvatarUrl } from '../../utils/imageUtils';
import ReactionPopup from '../../components/ReactionPopup';
import Toast from 'react-native-toast-message';

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

const UserProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<UserProfileRouteProp>();
  const navigation = useNavigation();
  const { user: authUser } = useAuth();

  const { username } = route.params;

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [reactionPopup, setReactionPopup] = useState<{
    visible: boolean;
    postId: string;
    position: { x: number; y: number };
  }>({
    visible: false,
    postId: '',
    position: { x: 0, y: 0 },
  });
  const likeButtonRefs = useRef<{ [key: string]: any }>({});
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const avatarGlowAnim = useRef(new Animated.Value(0)).current;
  const avatarScaleAnim = useRef(new Animated.Value(1)).current;
  const scanLineOpacity = useRef(new Animated.Value(0)).current;
  const activationGlowAnim = useRef(new Animated.Value(0)).current;
  const targetRingAnim = useRef(new Animated.Value(0)).current;
  const finalGlowAnim = useRef(new Animated.Value(0)).current;
  const [showScanLine, setShowScanLine] = useState(false);

  const isOwnProfile = useMemo(() => authUser?.username === username, [authUser?.username, username]);

  const isEchoing = useMemo(() => {
    if (!authUser || !profile?.followers) return false;
    return profile.followers.some((f: any) => f._id === authUser._id);
  }, [authUser, profile]);

  const loadProfileAndPosts = async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getProfile(username),
        postsAPI.getUserPosts(username, reset ? 1 : page, 20),
      ]);

      const userData = profileRes.user || profileRes.data?.user || profileRes.data;
      setProfile(userData);

      const newPosts = (postsRes as any).posts || (postsRes as any).data || [];
      setPosts(reset ? newPosts : [...posts, ...newPosts]);
      const pagination = (postsRes as any).pagination;
      setHasMore(pagination ? !!pagination.hasMore : newPosts.length >= 20);
      if (!reset) setPage(p => p + 1);
    } catch (e) {
      console.log('UserProfile load error', e);
      setProfile((prev: any) => prev || { username, bio: '', followers: [], following: [], stats: {} });
      if (reset) setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfileAndPosts(true);
  }, [username]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileAndPosts(true);
  };

  const loadMore = async () => {
    if (loading || refreshing || !hasMore) return;
    await loadProfileAndPosts(false);
  };

  const triggerAvatarScan = () => {
    // Reset all animations
    scanLineAnim.setValue(0);
    avatarGlowAnim.setValue(0);
    avatarScaleAnim.setValue(0.96);
    scanLineOpacity.setValue(0);
    activationGlowAnim.setValue(0);
    targetRingAnim.setValue(0);
    finalGlowAnim.setValue(0);
    setShowScanLine(true);

    // 1. Soft Entrance (0-150ms): Avatar fades in with glow and scale
    Animated.parallel([
      Animated.timing(avatarScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(avatarGlowAnim, {
        toValue: 0.1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Blue-Green Scan Beam Appears (150-300ms)
    Animated.sequence([
      Animated.delay(150),
      Animated.timing(scanLineOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. The Scan Pass (300-650ms): Scan line sweeps downward
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Data Activation Glow (650-850ms): Circular glow pulse
    Animated.sequence([
      Animated.delay(650),
      Animated.parallel([
        Animated.timing(activationGlowAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(activationGlowAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 5. Lock-On Target (850-1050ms): Target ring draws clockwise
    Animated.sequence([
      Animated.delay(850),
      Animated.timing(targetRingAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 6. Final Subtle Identity Glow (1050-1200ms)
    Animated.sequence([
      Animated.delay(1050),
      Animated.timing(finalGlowAnim, {
        toValue: 1,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(finalGlowAnim, {
        toValue: 0,
        duration: 75,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Clean up after animation completes
      setTimeout(() => {
        setShowScanLine(false);
      }, 100);
    });
  };

  const triggerButtonPulse = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 75,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggleFollow = async () => {
    if (!profile?._id || isOwnProfile || followLoading) return;
    
    // Trigger animations
    triggerButtonPulse();
    triggerAvatarScan();
    
    try {
      setFollowLoading(true);
      if (isEchoing) {
        await userAPI.unechoUser(profile._id);
        setProfile({
          ...profile,
          followers: profile.followers.filter((f: any) => f._id !== authUser?._id),
          stats: { ...profile.stats, followersCount: Math.max(0, (profile.stats?.followersCount || 1) - 1) },
        });
      } else {
        await userAPI.echoUser(profile._id);
        setProfile({
          ...profile,
          followers: [...(profile.followers || []), { _id: authUser?._id, username: authUser?.username, avatar: authUser?.avatar }],
          stats: { ...profile.stats, followersCount: (profile.stats?.followersCount || 0) + 1 },
        });
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const showReactionPopup = (postId: string, event?: any) => {
    const buttonRef = likeButtonRefs.current[postId];
    if (buttonRef) {
      (buttonRef as any).measure((fx: number, fy: number, fwidth: number, fheight: number, pageX: number, pageY: number) => {
        setReactionPopup({
          visible: true,
          postId,
          position: { 
            x: pageX + fwidth / 2,
            y: pageY,
          },
        });
      });
    } else {
      let x = Dimensions.get('window').width / 6;
      let y = Dimensions.get('window').height - 200;
      
      if (event?.nativeEvent) {
        const touch = event.nativeEvent.touches?.[0] || event.nativeEvent;
        if (touch?.pageX) x = touch.pageX;
        if (touch?.pageY) y = touch.pageY - 80;
      }
      
      setReactionPopup({
        visible: true,
        postId,
        position: { x, y },
      });
    }
  };

  const hideReactionPopup = () => {
    setReactionPopup({
      visible: false,
      postId: '',
      position: { x: 0, y: 0 },
    });
  };

  const handleReaction = async (postId: string, reactionType: 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking') => {
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;
      
      if (post.userReaction === reactionType) {
        await reactionsAPI.removeReaction(postId);
        Toast.show({
          type: 'success',
          text1: 'Reaction removed',
        });
      } else {
        await reactionsAPI.addReaction(postId, reactionType);
        Toast.show({
          type: 'success',
          text1: 'Reaction added',
        });
      }
      await loadProfileAndPosts(true);
    } catch (error) {
      console.error('Error handling reaction:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update reaction',
      });
    }
  };

  const handleReactionSelect = async (reactionType: 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking') => {
    if (reactionPopup.postId) {
      await handleReaction(reactionPopup.postId, reactionType);
    }
  };

  const formatTimeRemaining = (vanishAt: string) => {
    const now = new Date();
    const vanishTime = new Date(vanishAt);
    const diff = vanishTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const renderMedia = (media: any[]) => {
    if (!media || media.length === 0) return null;
    
    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth;
    const imageHeight = imageWidth * 0.75;
    
    return (
      <View style={styles.mediaContainer}>
        {media.length === 1 ? (
          <View style={styles.mediaItem}>
            {media[0].type === 'video' ? (
              <View style={styles.videoContainer}>
                <View style={[styles.mediaContent, { 
                  width: imageWidth, 
                  height: imageHeight,
                  backgroundColor: '#000', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }]}>
                  <Text style={{ color: '#fff' }}>🎥 Video</Text>
                </View>
      </View>
            ) : (
              <Image 
                source={{ uri: media[0].url }} 
                style={[styles.mediaContent, { width: imageWidth, height: imageHeight }]} 
                resizeMode="cover"
              />
            )}
          </View>
        ) : (
          <FlatList
            data={media}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ alignItems: 'center' }}
            renderItem={({ item }) => {
              return (
                <View style={styles.mediaItem}>
                  {item.type === 'video' ? (
                    <View style={styles.videoContainer}>
                      <View style={[styles.mediaContent, { 
                        width: imageWidth * 0.9, 
                        height: imageHeight * 0.9,
                        backgroundColor: '#000', 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }]}>
                        <Text style={{ color: '#fff' }}>🎥 Video</Text>
        </View>
      </View>
                  ) : (
                    <Image 
                      source={{ uri: item.url }} 
                      style={[styles.mediaContent, { width: imageWidth * 0.9, height: imageHeight * 0.9 }]} 
                      resizeMode="cover"
                    />
                  )}
        </View>
              );
            }}
          />
      )}
    </View>
  );
  };

  const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );

  const renderPost = ({ item: post }: { item: any }) => (
    <TouchableOpacity 
      key={post._id} 
      style={styles.postCard}
      onPress={() => (navigation as any).navigate('PostDetail', { postId: post._id })}
      activeOpacity={0.9}
    >
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              if (post.author?.username) {
                (navigation as any).navigate('UserProfile', { username: post.author.username });
              }
            }} 
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {post.author?.avatar ? (
              <Image source={{ uri: convertAvatarUrl(post.author.avatar) || '' }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>{post.author?.username?.charAt(0).toUpperCase() || '?'}</Text>
              </View>
            )}
            <Text style={[styles.username, { color: theme.colors.text }]}>{post.author?.username || 'Unknown User'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.postDate, { color: theme.colors.textSecondary }]}>{new Date(post.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.postTags}>
        {post.category && <Text style={[styles.postCategory, { color: theme.colors.primary }]}>#{post.category}</Text>}
        {post.isWhisperWall && (
          <Text style={[styles.whisperTag, { color: theme.colors.warning || '#FF6B35' }]}>
            👻 WhisperWall • {formatTimeRemaining(post.expiresAt)}
          </Text>
        )}
        {post.vanishMode?.enabled && !post.isWhisperWall && (
          <Text style={[styles.whisperTag, { color: theme.colors.warning || '#FF6B35' }]}>
            👻 WhisperWall • {formatTimeRemaining(post.vanishMode.vanishAt)}
          </Text>
        )}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {post.tags.map((tag: string, index: number) => (
              <Text key={index} style={[styles.hashtag, { color: theme.colors.secondary || '#6B73FF' }]}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </View>
      {post.content?.text && <Text style={[styles.postText, { color: theme.colors.text }]} numberOfLines={3}>{post.content.text}</Text>}
      {renderMedia(post.content?.media)}
      
      {/* Like, Comment Actions */}
      <View style={styles.actionButtons}>
        <View
          ref={(ref) => {
            if (ref) {
              likeButtonRefs.current[post._id] = ref;
            }
          }}
          style={{ flex: 1 }}
        >
          <TouchableOpacity 
            style={[styles.actionBtn, post.userReaction && styles.activeActionBtn]}
            onPress={(e) => {
              e.stopPropagation();
              showReactionPopup(post._id, e);
            }}
          >
            <Text style={styles.actionBtnIcon}>
              {post.userReaction ? '👍' : '👍'}
            </Text>
            <Text style={styles.actionBtnText}>
              {post.userReaction ? 'Liked' : 'Like'}
            </Text>
            <Text style={styles.actionBtnCount}>{post.reactionCounts?.total || 0}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ flex: 1 }}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              (navigation as any).navigate('PostDetail', { postId: post._id });
            }}
          >
            <Text style={styles.actionBtnIcon}>💬</Text>
            <Text style={styles.actionBtnText}>Comment</Text>
            <Text style={styles.actionBtnCount}>{post.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.postMeta}>
        <Text style={[styles.reactionText, { color: theme.colors.textSecondary }]}>
          {post.reactionCounts?.total || 0} likes • {post.comments?.length || 0} comments
        </Text>
    </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarWrapper: {
    marginRight: 12,
  },
    profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
    entranceGlow: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: '#ffffff',
      top: 0,
      left: 0,
    },
    scanLine: {
      position: 'absolute',
      left: -10,
      right: -10,
      height: 4,
      backgroundColor: '#2CF5E8',
      shadowColor: '#2CF5E8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 12,
      zIndex: 10,
      borderRadius: 2,
    },
    activationGlow: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: '#4DEEFF',
      top: 0,
      left: 0,
      shadowColor: '#4DEEFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
      elevation: 15,
    },
    targetRing: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: '#2CF5E8',
      top: -5,
      left: -5,
      shadowColor: '#2CF5E8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
    },
    finalGlow: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#ffffff',
      top: 0,
      left: 0,
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 20,
    },
  nameSection: {
    flex: 1,
  },
  usernameText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
      color: theme.colors.text,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
      color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    marginRight: 18,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
      marginTop: 12,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  postCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 0,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      marginHorizontal: 0,
      ...theme.shadows.small,
      borderWidth: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '60',
      overflow: 'hidden',
      width: '100%',
    },
    postHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
    },
    authorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { 
      width: 44, 
      height: 44, 
      borderRadius: 22, 
      marginRight: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.primary + '30',
    },
    avatarPlaceholder: { 
      width: 44, 
      height: 44, 
      borderRadius: 22, 
      marginRight: theme.spacing.sm, 
      justifyContent: 'center', 
      alignItems: 'center',
    },
    avatarText: { 
      fontSize: 18, 
      fontWeight: 'bold', 
      color: '#fff',
    },
    username: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
  postDate: { fontSize: 12 },
    postTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    postCategory: { fontSize: 12, fontWeight: '600', marginRight: theme.spacing.sm },
    whisperTag: { fontSize: 12, fontWeight: '600', marginRight: theme.spacing.sm },
    hashtagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    hashtag: {
      fontSize: 12,
      fontWeight: '600',
      marginRight: theme.spacing.sm,
    },
    postText: { 
      fontSize: 16, 
      lineHeight: 24, 
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
    mediaContainer: { 
      marginVertical: theme.spacing.md,
      marginHorizontal: -theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      width: Dimensions.get('window').width,
    },
    mediaItem: { marginRight: theme.spacing.sm },
    mediaContent: {
      height: 200,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
    },
    videoContainer: { borderRadius: theme.borderRadius.md, overflow: 'hidden' },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '40',
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: 'transparent',
      flex: 1,
    },
    activeActionBtn: {
      backgroundColor: theme.colors.primary + '20',
    },
    actionBtnIcon: {
      fontSize: 20,
      marginRight: theme.spacing.xs,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: theme.spacing.xs,
    },
    actionBtnCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    postMeta: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    reactionText: { fontSize: 12 },
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <FlatList
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ paddingVertical: 6, paddingRight: 12 }}>
                <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>← Back</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerTop}>
              <View style={styles.avatarWrapper}>
                <View style={{ position: 'relative', overflow: 'visible', width: 80, height: 80 }}>
                  {/* Soft Entrance Glow Ring */}
                  {showScanLine && (
                    <Animated.View
                      style={[
                        styles.entranceGlow,
                        {
                          opacity: avatarGlowAnim,
                        },
                      ]}
                    />
                  )}
                  
                  {/* Avatar Container with Scale Animation */}
                  <Animated.View
                    style={{
                      transform: [{ scale: avatarScaleAnim }],
                      borderRadius: 40,
                      overflow: 'hidden',
                      width: 80,
                      height: 80,
                    }}
                  >
                    {profile?.avatar ? (
                      <Image source={{ uri: convertAvatarUrl(profile.avatar) || '' }} style={styles.profileAvatar} />
                    ) : (
                      <View style={[styles.profileAvatar, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}> 
                        <Text style={{ color: theme.colors.textInverse, fontSize: 28, fontWeight: '700' }}>{profile?.username?.charAt(0)?.toUpperCase() || '?'}</Text>
                      </View>
                    )}
                  </Animated.View>

                  {/* Blue-Green Scan Beam */}
                  {showScanLine && (
                    <Animated.View
                      style={[
                        styles.scanLine,
                        {
                          opacity: scanLineOpacity,
                          transform: [
                            {
                              translateY: scanLineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-80, 80],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  )}

                  {/* Data Activation Glow Ring */}
                  {showScanLine && (
                    <Animated.View
                      style={[
                        styles.activationGlow,
                        {
                          opacity: activationGlowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.6],
                          }),
                          transform: [
                            {
                              scale: activationGlowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.5],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  )}

                  {/* Lock-On Target Ring */}
                  {showScanLine && (
                    <Animated.View
                      style={[
                        styles.targetRing,
                        {
                          opacity: targetRingAnim,
                          transform: [
                            {
                              rotate: targetRingAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  )}

                  {/* Final Subtle Identity Glow */}
                  {showScanLine && (
                    <Animated.View
                      style={[
                        styles.finalGlow,
                        {
                          opacity: finalGlowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.4],
                          }),
                        },
                      ]}
                    />
                  )}
                </View>
              </View>
              <View style={styles.nameSection}>
                <Text style={styles.usernameText}>@{profile?.username || 'Unknown'}</Text>
                {!!profile?.bio && (
                  <Text style={styles.bioText} numberOfLines={3}>{profile.bio}</Text>
                )}
                <View style={styles.statsRow}>
                  <Stat label="Posts" value={profile?.stats?.postsCount || posts.length} />
                  <Stat label="Followers" value={profile?.stats?.followersCount || (profile?.followers?.length || 0)} />
                  <Stat label="Following" value={profile?.stats?.followingCount || (profile?.following?.length || 0)} />
                </View>
              </View>
            </View>
            {!isOwnProfile && (
              <View style={styles.actionsRow}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    disabled={followLoading} 
                    onPress={handleToggleFollow} 
                    style={[styles.primaryButton, { backgroundColor: isEchoing ? theme.colors.surface : theme.colors.primary, borderColor: theme.colors.primary, borderWidth: isEchoing ? 1 : 0 }]}
                    activeOpacity={0.8}
                  > 
                    <Text style={{ color: isEchoing ? theme.colors.primary : theme.colors.textInverse, fontWeight: '700' }}>{isEchoing ? 'Tracking' : 'Track'}</Text>
                  </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity
                  onPress={() => profile && (navigation as any).navigate('Chat', { peerId: profile._id, username: profile.username, avatar: profile.avatar })}
                  style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
                > 
                  <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Message</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        data={posts}
        keyExtractor={(item, index) => item?._id || `post-${index}`}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={hasMore ? <ActivityIndicator style={{ marginVertical: theme.spacing.lg }} color={theme.colors.primary} /> : <View style={{ height: Platform.OS === 'web' ? 80 : 40 }} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: theme.spacing.xl, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>📭</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm }}>No posts yet</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' }}>
                {isOwnProfile ? 'Start sharing your thoughts!' : 'This user hasn\'t posted anything yet.'}
              </Text>
            </View>
          ) : null
        }
      />
      <ReactionPopup
        visible={reactionPopup.visible}
        position={reactionPopup.position}
        onSelect={handleReactionSelect}
        onClose={hideReactionPopup}
      />
    </SafeAreaView>
  );
};

export default UserProfileScreen;
