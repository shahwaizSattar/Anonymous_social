import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell: React.FC = () => {
  const { theme } = useTheme();
  const [count, setCount] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<TouchableOpacity>(null);

  const loadCounts = async () => {
    try {
      const notifRes = await userAPI.getNotifications().catch(() => ({ unreadCount: 0 }));
      const unreadNotifs = notifRes.unreadCount || 0;
      setCount(unreadNotifs);
    } catch (e) {
      setCount(0);
    }
  };

  useEffect(() => {
    let delay = 30000; // start at 30s to avoid rate limiting
    let timer: any;
    const tick = async () => {
      try {
        await loadCounts();
        delay = 30000;
      } catch (e: any) {
        // If 429 or network error, back off
        delay = Math.min(delay * 2, 120000);
      } finally {
        timer = setTimeout(tick, delay);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const handlePress = () => {
    if (buttonRef.current) {
      (buttonRef.current as any).measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
        setDropdownPosition({
          x: px + width / 2,
          y: py + height,
        });
        setDropdownVisible(true);
      });
    } else {
      // Fallback position
      setDropdownPosition({ x: 200, y: 60 });
      setDropdownVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handlePress}
      >
      <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>🔔</Text>
        {count > 0 && (
          <View style={{ position: 'absolute', top: -4, right: -6, backgroundColor: '#FF3B30', borderRadius: 10, paddingHorizontal: 6, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{count > 99 ? '99+' : count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
      <NotificationDropdown
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        position={dropdownPosition}
      />
    </>
  );
};

export default NotificationBell;


