# 🌐 City Radar Installation Guide

## Quick Setup

### 1. Install Required Dependencies

```bash
cd frontend
npx expo install expo-location
```

### 2. Configure Permissions

#### iOS (ios/Info.plist)
Add these keys to your Info.plist:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>City Radar needs your location to show nearby posts</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>City Radar needs your location to show nearby posts</string>
```

#### Android (android/app/src/main/AndroidManifest.xml)
Add these permissions:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 3. Update app.json (Expo)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow City Radar to use your location to show nearby posts."
        }
      ]
    ]
  }
}
```

### 4. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Clear cache and restart
npx expo start -c
```

## Testing

### Test on Physical Device
1. Enable location services on your device
2. Grant location permission when prompted
3. Navigate to City Radar tab
4. You should see the radar animation and nearby posts

### Test on Simulator/Emulator

#### iOS Simulator
1. Features > Location > Custom Location
2. Enter coordinates (e.g., 37.7749, -122.4194 for San Francisco)
3. App will use these coordinates

#### Android Emulator
1. Click the three dots (...) to open Extended Controls
2. Go to Location tab
3. Enter coordinates manually
4. Click "Send"

## Troubleshooting

### "Location permission denied"
- Check device settings
- Ensure location services are enabled
- Reinstall app to reset permissions

### "Cannot find module 'expo-location'"
```bash
cd frontend
rm -rf node_modules
npm install
npx expo install expo-location
```

### Posts not loading
- Check backend is running on correct port
- Verify API_BASE_URL in frontend/src/services/api.ts
- Check network connectivity
- Look at console logs for errors

### Radar animations not smooth
- Enable hardware acceleration
- Close other apps
- Test on physical device (better performance than emulator)

## Backend Setup

### 1. Ensure MongoDB Geospatial Index
The Post model already includes the geospatial index. If you have existing data, you may need to rebuild indexes:

```javascript
// In MongoDB shell or Compass
db.posts.createIndex({ geoLocation: "2dsphere" })
```

### 2. Test Location Endpoints

```bash
# Test nearby posts endpoint
curl "http://localhost:5000/api/location/nearby?latitude=37.7749&longitude=-122.4194&radius=10"

# Test ring endpoint
curl "http://localhost:5000/api/location/ring?latitude=37.7749&longitude=-122.4194&ring=inner"

# Test area stats
curl "http://localhost:5000/api/location/area-stats?latitude=37.7749&longitude=-122.4194&radius=10"
```

## Creating Location-Enabled Posts

To create posts with location data, update the CreatePostScreen to include location:

```typescript
const location = await Location.getCurrentPositionAsync({});

const postData = {
  content: { text: 'Your post text' },
  category: 'food',
  geoLocation: {
    type: 'Point',
    coordinates: [location.coords.longitude, location.coords.latitude]
  },
  locationEnabled: true
};

await postsAPI.createPost(postData);
```

## Performance Optimization

### Caching Location
```typescript
// Cache location for 5 minutes to reduce API calls
const LOCATION_CACHE_DURATION = 5 * 60 * 1000;
let cachedLocation: Location.LocationObject | null = null;
let locationCacheTime = 0;

const getLocation = async () => {
  const now = Date.now();
  if (cachedLocation && (now - locationCacheTime) < LOCATION_CACHE_DURATION) {
    return cachedLocation;
  }
  
  const location = await Location.getCurrentPositionAsync({});
  cachedLocation = location;
  locationCacheTime = now;
  return location;
};
```

### Debouncing Ring Selection
Already implemented in the component to prevent excessive API calls.

## Next Steps

1. ✅ Install expo-location
2. ✅ Configure permissions
3. ✅ Test on device
4. 🔄 Update CreatePostScreen to add location to posts
5. 🔄 Add real-time location updates
6. 🔄 Implement advanced features (heatmap, alerts, etc.)

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify all dependencies are installed
3. Ensure backend is running
4. Test API endpoints directly
5. Check device location settings

---

**Status**: Ready for testing
**Last Updated**: November 27, 2025
