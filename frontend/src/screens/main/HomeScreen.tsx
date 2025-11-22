import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  FlatList,
  Dimensions,
  TextInput,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import { reactionsAPI } from '../../services/reactions';
import { RootStackParamList } from '../../types/navigation';
import Toast from 'react-native-toast-message';
import NotificationBell from '../../components/NotificationBell';
import ReactionPopup from '../../components/ReactionPopup';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reactionPopup, setReactionPopup] = useState<{
    visible: boolean;
    postId: string;
    position: { x: number; y: number };
  }>({
    visible: false,
    postId: '',
    position: { x: 0, y: 0 },
  });
  const buttonPositions = useRef<{ [key: string]: { x: number; y: number; width: number; height: number } }>({});
  const likeButtonRefs = useRef<{ [key: string]: any }>({});

  const loadPosts = async () => {
    try {
      setLoading(true);

      const response = await postsAPI.getFeed(1, 20); // API call
      if (response.success) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.log('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    if (user) {
      setRefreshing(true);
      await loadPosts();
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) loadPosts();
    }, [user])
  );

  const showReactionPopup = (postId: string, event?: any) => {
    // Try to measure the button position first
    const buttonRef = likeButtonRefs.current[postId];
    if (buttonRef) {
      (buttonRef as any).measure((fx: number, fy: number, fwidth: number, fheight: number, pageX: number, pageY: number) => {
        setReactionPopup({
          visible: true,
          postId,
          position: { 
            x: pageX + fwidth / 2, // Center of button horizontally
            y: pageY, // Top of button (we'll position popup above this)
          },
        });
      });
    } else {
      // Fallback: use event position or estimate
      let x = Dimensions.get('window').width / 6; // First button is usually at 1/6 of screen
      let y = Dimensions.get('window').height - 200; // Near bottom
      
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
      // Refresh the posts to get updated reaction counts
      await loadPosts();
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

  const handleShare = (post: any) => {
    // Simple share functionality - you can enhance this later
    Toast.show({
      type: 'info',
      text1: 'Share',
      text2: `Shared post by @${post.author?.username || 'Unknown'}`,
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...theme.shadows.small,
      minHeight: 60,
      justifyContent: 'center',
    },
    headerContent: { 
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      minWidth: 100,
      maxWidth: '35%',
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      overflow: 'hidden',
    },
    avatarImage: { width: 40, height: 40, borderRadius: 20 },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
    usernameText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flexShrink: 1,
    },
    searchContainer: {
      flex: 1,
      marginHorizontal: theme.spacing.sm,
      minWidth: 0,
    },
    searchInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: '100%',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      justifyContent: 'flex-end',
      minWidth: 40,
      marginLeft: theme.spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    iconText: {
      fontSize: 20,
    },
    content: { flex: 1, paddingHorizontal: 0, paddingVertical: 0 },
    placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderIcon: { fontSize: 80, marginBottom: theme.spacing.lg },
    placeholderTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    placeholderText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },
    startButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium,
    },
    startButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textInverse,
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignSelf: 'flex-start',
      marginTop: theme.spacing.sm,
    },
    streakEmoji: { fontSize: 16 },
    streakText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
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
    postCategory: { fontSize: 12, fontWeight: '600', marginBottom: theme.spacing.sm },
    postText: { 
      fontSize: 16, 
      lineHeight: 24, 
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
    postMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    postDate: { fontSize: 12 },
    postReactions: { flexDirection: 'row', alignItems: 'center' },
    reactionText: { fontSize: 12, marginLeft: theme.spacing.sm },
    commentButton: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    commentButtonText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '600',
    },
    mediaContainer: { 
      marginVertical: theme.spacing.md,
      marginHorizontal: -theme.spacing.lg, // Negative margin to extend beyond post padding
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
      borderWidth: 2,
      borderColor: theme.colors.primary + '30',
    },
    username: { 
      fontSize: 16, 
      fontWeight: '600',
      color: theme.colors.text,
    },
    reactionEmoji: { fontSize: 20, marginRight: theme.spacing.xs },
    postTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    whisperTag: {
      fontSize: 12,
      fontWeight: '600',
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    hashtagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    hashtag: {
      fontSize: 12,
      fontWeight: '500',
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '40',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      alignItems: 'stretch',
    },
    actionBtn: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      flex: 1,
      minHeight: 50,
      justifyContent: 'center',
    },
    activeActionBtn: {
      backgroundColor: theme.colors.primary + '20',
    },
    actionBtnIcon: {
      fontSize: 20,
      marginBottom: theme.spacing.xs,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    actionBtnCount: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    mediaItem: {
      marginRight: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mediaContent: {
      borderRadius: 0, // No border radius for full-width images
      backgroundColor: theme.colors.background,
      alignSelf: 'center',
    },
    videoContainer: {
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
  });


  const renderMedia = (media: any[]) => {
    if (!media || media.length === 0) return null;
    
    console.log('🎬 Rendering media:', media); // Debug log
    
    const screenWidth = Dimensions.get('window').width;
    // Full width of screen (no padding)
    const imageWidth = screenWidth;
    const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio, adjust as needed
    
    return (
      <View style={styles.mediaContainer}>
        {media.length === 1 ? (
          // Single image - display centered and full width
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
                onError={(error) => console.log('❌ Image load error:', error.nativeEvent.error, 'URL:', media[0].url)}
                onLoad={() => console.log('✅ Image loaded successfully:', media[0].url)}
              />
            )}
          </View>
        ) : (
          // Multiple images - horizontal scroll
          <FlatList
            data={media}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ alignItems: 'center' }}
            renderItem={({ item }) => {
              console.log('🖼️ Rendering media item:', item); // Debug log
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
                      onError={(error) => console.log('❌ Image load error:', error.nativeEvent.error, 'URL:', item.url)}
                      onLoad={() => console.log('✅ Image loaded successfully:', item.url)}
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left: Avatar + Username */}
          <View style={styles.leftSection}>
            <TouchableOpacity 
              onPress={() => user && navigation.navigate('Profile' as never)}
              style={styles.avatarContainer}
            >
              {user?.avatar ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  style={styles.avatarImage} 
                  resizeMode="cover"
                  onError={() => console.log('Avatar image failed to load')}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.usernameText} numberOfLines={1}>
              {user?.username || 'User'}
            </Text>
          </View>

          {/* Center: Search Bar */}
          <TouchableOpacity 
            style={styles.searchContainer}
            onPress={() => navigation.navigate('Search' as never)}
            activeOpacity={0.7}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={false}
              onFocus={() => navigation.navigate('Search' as never)}
            />
          </TouchableOpacity>

          {/* Right: Notification Icon */}
          <View style={styles.rightSection}>
            <NotificationBell />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {posts.length > 0 ? (
          posts.map(post => (
            <TouchableOpacity 
              key={post._id} 
              style={styles.postCard}
              onPress={() => navigation.navigate('PostDetail', { postId: post._id })}
              activeOpacity={0.9}
            >
              <View style={styles.postHeader}>
                <View style={styles.authorInfo}>
                  <TouchableOpacity onPress={() => post.author?.username && navigation.navigate('UserProfile', { username: post.author.username })} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {post.author?.avatar ? (
                      <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
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
              {renderMedia(post.content.media)}
              
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
                      // Show popup on press - measure button position
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
                      navigation.navigate('PostDetail', { postId: post._id });
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
          ))
        ) : loading ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>⏳</Text>
            <Text style={styles.placeholderTitle}>Loading your feed...</Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📱</Text>
            <Text style={styles.placeholderTitle}>Your Feed is Ready!</Text>
            <Text style={styles.placeholderText}>Start creating posts and following users to see content from your community appear here.</Text>
            <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('CreatePost')}>
              <Text style={styles.startButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <ReactionPopup
        visible={reactionPopup.visible}
        position={reactionPopup.position}
        onSelect={handleReactionSelect}
        onClose={hideReactionPopup}
      />
    </View>
  );
};

export default HomeScreen;

