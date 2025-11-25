import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { convertAvatarUrl } from '../utils/imageUtils';

interface NotificationDropdownProps {
  visible: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

interface Notification {
  _id: string;
  type: 'reaction' | 'comment' | 'track' | 'follow' | 'mention';
  read: boolean;
  createdAt: string;
  user?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  post?: {
    _id: string;
    content?: {
      text?: string;
    };
  };
  comment?: {
    content: string;
  };
  reactionType?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  visible,
  onClose,
  position,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getNotifications();
      const notifs = response.notifications || response.data || [];
      // Filter out message notifications
      const filteredNotifs = notifs.filter((n: Notification) => 
        n.type !== 'message' && n.type !== 'chat'
      );
      setNotifications(filteredNotifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reaction':
        return '👍';
      case 'comment':
        return '💬';
      case 'track':
      case 'follow':
        return '👤';
      case 'mention':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getNotificationText = (notification: Notification) => {
    const username = notification.user?.username || 'Someone';
    switch (notification.type) {
      case 'reaction':
        const reactionEmoji = notification.reactionType === 'love' ? '❤️' :
                             notification.reactionType === 'funny' ? '😂' :
                             notification.reactionType === 'rage' ? '😡' :
                             notification.reactionType === 'shock' ? '😱' :
                             notification.reactionType === 'relatable' ? '😮' :
                             notification.reactionType === 'thinking' ? '🤔' : '👍';
        return `${username} reacted ${reactionEmoji} to your post`;
      case 'comment':
        return `${username} commented on your post`;
      case 'track':
      case 'follow':
        return `${username} started tracking you`;
      case 'mention':
        return `${username} mentioned you`;
      default:
        return 'New notification';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.post?._id) {
      (navigation as any).navigate('PostDetail', { postId: notification.post._id });
    } else if (notification.user?.username) {
      (navigation as any).navigate('UserProfile', { username: notification.user.username });
    }
    onClose();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const screenWidth = Dimensions.get('window').width;
  const dropdownWidth = Math.min(350, screenWidth - 40);
  // Position dropdown below the bell, aligned to the right
  const dropdownLeft = Math.max(10, screenWidth - dropdownWidth - 20);

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    dropdown: {
      position: 'absolute',
      top: position.y + 40,
      left: dropdownLeft,
      width: dropdownWidth,
      maxHeight: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      ...theme.shadows.large,
      borderWidth: 1,
      borderColor: theme.colors.border + '40',
      zIndex: 1001,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 4,
    },
    closeText: {
      fontSize: 20,
      color: theme.colors.textSecondary,
    },
    scrollView: {
      maxHeight: 350,
    },
    notificationItem: {
      flexDirection: 'row',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '20',
      backgroundColor: 'transparent',
    },
    unreadNotification: {
      backgroundColor: theme.colors.primary + '10',
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '20',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    notificationContent: {
      flex: 1,
    },
    notificationText: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 4,
    },
    notificationTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: theme.colors.background,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.dropdown}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification._id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Text style={{ fontSize: 18 }}>{getNotificationIcon(notification.type)}</Text>
                </View>
                {notification.user?.avatar ? (
                  <Image
                    source={{ uri: convertAvatarUrl(notification.user.avatar) || '' }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {notification.user?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>
                    {getNotificationText(notification)}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTime(notification.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default NotificationDropdown;

