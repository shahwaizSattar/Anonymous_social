# 🌐 City Radar - Location-Based Posting Feature

## Overview
City Radar is a premium, animated location-based feature that replaces the traditional search functionality. It allows users to discover and interact with posts based on their physical proximity, creating a hyper-local social experience.

## ✨ Key Features

### 1. **Geo-Bubble Posts (Location Rings)**
Posts are organized into three concentric rings based on distance:

- **🔵 Inner Ring (0-2 km)**: Ultra-local posts from your immediate area
- **🟣 Mid Ring (2-10 km)**: Nearby posts from your neighborhood
- **🟠 Outer Ring (10-50 km)**: City-wide posts from across your city

### 2. **Premium Animations**
- **Radar Pulse**: Continuous sonar-like pulse emanating from your location
- **Ring Animations**: Each ring has unique pulsing and scaling animations
- **Floating Particles**: Ambient particles drift across the radar view
- **Interactive Feedback**: Rings glow and expand when selected
- **Smooth Transitions**: All interactions use spring-based animations

### 3. **Visual Design**
- **Glassmorphism**: Translucent surfaces with blur effects
- **Neon Colors**: Electric blue, royal purple, and vibrant orange
- **Gradient Backgrounds**: Smooth color transitions
- **Shadow Effects**: Depth and elevation through shadows
- **Dark Theme Optimized**: Designed for premium dark mode experience

## 🎯 User Experience

### Navigation
- Replaced the Search tab in the bottom navigation
- Icon: 🌐 (Globe with meridians)
- Label: "Radar"

### Interaction Flow
1. **Permission Request**: App requests location permission on first use
2. **Radar Scan**: Animated radar scans the area
3. **Ring Selection**: Tap any ring to filter posts by distance
4. **Post Discovery**: Scroll through location-filtered posts
5. **Post Interaction**: Tap posts to view details

### Post Display
Each post card shows:
- Author username
- Distance badge (color-coded by ring)
- Post content preview
- Category tag
- Timestamp

## 🔧 Technical Implementation

### Dependencies
```json
{
  "expo-location": "^16.x.x",
  "expo-linear-gradient": "^12.x.x",
  "react-native-reanimated": "^3.x.x"
}
```

### File Structure
```
frontend/
├── src/
│   ├── screens/
│   │   └── main/
│   │       └── CityRadarScreen.tsx
│   └── navigation/
│       └── MainNavigator.tsx (updated)
```

### Key Components

#### CityRadarScreen
- Main screen component
- Handles location permissions
- Manages radar animations
- Filters posts by distance
- Renders interactive rings

#### Animation System
- `radarPulse`: Center pulse animation
- `innerRingAnim`: Inner ring scale animation
- `midRingAnim`: Mid ring scale animation
- `outerRingAnim`: Outer ring scale animation
- `particleAnims`: Array of particle animations

### State Management
```typescript
const [location, setLocation] = useState<Location.LocationObject | null>(null);
const [selectedRing, setSelectedRing] = useState<'inner' | 'mid' | 'outer' | null>(null);
const [posts, setPosts] = useState<LocationPost[]>([]);
const [loading, setLoading] = useState(true);
```

## 🚀 Future Enhancements

### Phase 2 Features
1. **Ask the Area**: Community Q&A mode for location-specific questions
2. **Local Buzz Heatmap**: Animated heatmap showing activity hotspots
3. **Drop a Secret Here**: Pin messages to specific locations
4. **Neighborhood Tags**: Dynamic tags based on area activity
5. **Real-Time Alerts**: Community-submitted alerts (traffic, weather, etc.)

### Phase 3 Features
1. **Geo-Stories**: Location-based disappearing posts (24h)
2. **Local Circles**: Temporary groups for people in same area
3. **Travel Mode**: Dynamic feed that changes as you move
4. **Neighborhood Personas**: AI-generated area characters
5. **Local Reputation Score**: Area-based trust scores

## 📱 Backend Integration

### Required API Endpoints

#### Get Nearby Posts
```typescript
GET /api/posts/nearby
Query Parameters:
  - latitude: number
  - longitude: number
  - radius: number (in km)
  - page: number
  - limit: number

Response:
{
  success: boolean,
  data: Array<{
    _id: string,
    content: { text: string },
    distance: number,
    author: { username: string, avatar?: string },
    createdAt: string,
    category?: string,
    location: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  }>
}
```

#### Create Location Post
```typescript
POST /api/posts/location
Body:
{
  content: { text: string },
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  category?: string
}
```

### Database Schema Updates

#### Post Model
```javascript
const PostSchema = new mongoose.Schema({
  // ... existing fields
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere' // Geospatial index for location queries
    }
  },
  locationEnabled: {
    type: Boolean,
    default: false
  }
});
```

## 🎨 Design Specifications

### Colors
- **Inner Ring**: `#00D4AA` (Cyan)
- **Mid Ring**: `#A855F7` (Purple)
- **Outer Ring**: `#FF6B35` (Orange)
- **Center Dot**: Theme primary color
- **Particles**: Theme primary color with opacity

### Dimensions
- **Inner Ring**: 100px diameter
- **Mid Ring**: 180px diameter
- **Outer Ring**: 280px diameter
- **Center Dot**: 20px diameter
- **Particles**: 4px diameter

### Animations
- **Radar Pulse**: 2000ms loop
- **Inner Ring**: 1000ms pulse
- **Mid Ring**: 1500ms pulse
- **Outer Ring**: 2000ms pulse
- **Particles**: 3000ms float with staggered delays

## 🔐 Privacy & Permissions

### Location Permission
- Requests foreground location access only
- Clear explanation of why location is needed
- Graceful degradation if permission denied
- No background location tracking

### Privacy Features
- Location data never stored permanently
- Only approximate distance shown (not exact coordinates)
- Users can disable location sharing per post
- No location history tracking

## 📊 Analytics Events

Track these events for feature optimization:
- `city_radar_opened`: User opens City Radar screen
- `ring_selected`: User selects a distance ring
- `location_post_viewed`: User views a location-based post
- `location_permission_granted`: User grants location permission
- `location_permission_denied`: User denies location permission

## 🐛 Known Issues & Limitations

### Current Limitations
1. Mock data used for posts (API integration pending)
2. No real-time updates (requires WebSocket)
3. No post creation with location (UI only)
4. Limited to 50km radius

### Browser Compatibility
- Web version requires HTTPS for geolocation API
- Some browsers may block location access
- Fallback to manual location entry needed

## 📝 Testing Checklist

- [ ] Location permission request works
- [ ] Radar animations run smoothly
- [ ] Ring selection filters posts correctly
- [ ] Post cards display distance accurately
- [ ] Navigation to post detail works
- [ ] Empty states display properly
- [ ] Error handling for location failures
- [ ] Performance with 100+ posts
- [ ] Dark theme compatibility
- [ ] iOS and Android compatibility

## 🎓 User Education

### Onboarding Tips
1. "Tap rings to filter posts by distance"
2. "Your location is never shared publicly"
3. "Discover what's happening around you"
4. "Posts update as you move"

### Help Text
- "City Radar shows posts from people near you"
- "The closer the ring, the closer the posts"
- "Tap a post to see full details"

## 🔄 Migration Notes

### Removed Features
- Search bar from HomeScreen header
- Search tab from bottom navigation
- Autocomplete search dropdown

### Preserved Features
- All search functionality moved to dedicated SearchScreen
- Can still access search through other means if needed
- Category filtering still works on HomeScreen

## 📚 Resources

### Design Inspiration
- Sonar/radar interfaces
- Location-based apps (Snapchat Map, Citizen)
- Futuristic UI designs
- Glassmorphism trends

### Technical References
- [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

**Status**: ✅ Phase 1 Complete (UI Implementation)
**Next Steps**: Backend API integration, real-time updates, advanced features
