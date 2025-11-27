# One-Time Post Feature Implementation

## Overview
This feature allows users to create posts that can only be viewed once per user. When a user views a one-time post:
- Media is blurred until clicked
- Caption text is hidden behind a particle noise reveal effect
- Once revealed, the post is marked as "viewed" for that user
- After refresh, the post disappears from that user's feed

## Backend Changes

### 1. Post Model (`backend/models/Post.js`)
Added `oneTime` field to the post schema:

```javascript
oneTime: {
  enabled: { type: Boolean, default: false },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}
```

### 2. Posts Route (`backend/routes/posts.js`)

#### Create Post Endpoint
Updated to accept `oneTime` parameter:
```javascript
const { content, category, visibility, disguiseAvatar, vanishMode, tags, poll, interactions, oneTime } = req.body;

const post = new Post({
  // ... other fields
  oneTime: oneTime || { enabled: false, viewedBy: [] }
});
```

#### Feed Endpoint
Updated to filter out viewed one-time posts:
```javascript
const baseVisibilityFilters = {
  // ... other filters
  $nor: [
    { 'oneTime.enabled': true, 'oneTime.viewedBy': userId }
  ]
};
```

#### New Endpoint: Mark One-Time Post as Viewed
```javascript
POST /api/posts/:postId/mark-viewed
```
Adds the current user to the `viewedBy` array.

## Frontend Changes

### 1. API Service (`frontend/src/services/api.ts`)
Added new function:
```typescript
markOneTimeViewed: async (postId: string): Promise<ApiResponse> => {
  const response = await api.post(`/posts/${postId}/mark-viewed`);
  return response.data;
}
```

### 2. Create Post Screen (`frontend/src/screens/main/CreatePostScreen.tsx`)

#### State Addition
```typescript
const [oneTimePost, setOneTimePost] = useState(false);
```

#### UI Addition
Added toggle in Interaction Settings section:
```tsx
<View style={styles.section}>
  <Text style={styles.sectionTitle}>One-Time Post ✨</Text>
  <Text style={styles.sectionDescription}>
    Media will be blurred and caption hidden with particle effect. 
    Once viewed, post disappears from that user's feed.
  </Text>
  <View style={styles.lockRow}>
    <Text style={styles.lockLabel}>Enable One-Time View</Text>
    <Switch value={oneTimePost} onValueChange={setOneTimePost} />
  </View>
</View>
```

#### Post Data Update
```typescript
const postData = {
  // ... other fields
  oneTime: {
    enabled: oneTimePost
  }
};
```

### 3. Particle Noise Reveal Component (`frontend/src/components/ParticleNoiseReveal.tsx`)

New component that creates a particle noise effect over hidden text:

**Features:**
- 80 animated particles that jitter randomly
- Dark overlay with particle static effect
- "Tap to reveal" hint
- Smooth dissolve animation on tap
- Calls `onReveal` callback when revealed

**Usage:**
```tsx
<ParticleNoiseReveal
  text={post.content.text}
  onReveal={() => handleRevealPost(post._id)}
  revealed={revealedPosts[post._id]}
/>
```

### 4. Home Screen Updates (`frontend/src/screens/main/HomeScreen.tsx`)

#### Required Changes:

1. **Add State for Revealed Posts:**
```typescript
const [revealedPosts, setRevealedPosts] = useState<{ [key: string]: boolean }>({});
```

2. **Import ParticleNoiseReveal:**
```typescript
import ParticleNoiseReveal from '../../components/ParticleNoiseReveal';
import { BlurView } from 'expo-blur';
```

3. **Add Reveal Handler:**
```typescript
const handleRevealPost = async (postId: string) => {
  try {
    // Mark as revealed locally
    setRevealedPosts(prev => ({ ...prev, [postId]: true }));
    
    // Mark as viewed on backend
    await postsAPI.markOneTimeViewed(postId);
    
    Toast.show({
      type: 'info',
      text1: 'Post Revealed',
      text2: 'This post will disappear after refresh',
      visibilityTime: 3000,
    });
  } catch (error) {
    console.error('Failed to mark post as viewed:', error);
  }
};
```

4. **Update Post Rendering:**
```tsx
{/* Render post content */}
{post.oneTime?.enabled && !revealedPosts[post._id] ? (
  <>
    {/* Blurred Media */}
    {post.content.media && post.content.media.length > 0 && (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: post.content.media[0].url }}
          style={[styles.mediaContent, { width: '100%' }]}
          blurRadius={20}
        />
        <View style={styles.blurOverlay}>
          <TouchableOpacity
            style={styles.revealMediaButton}
            onPress={() => handleRevealPost(post._id)}
          >
            <Text style={styles.revealMediaText}>👁️ Tap to reveal</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
    
    {/* Particle Noise Reveal for Caption */}
    {post.content.text && (
      <ParticleNoiseReveal
        text={post.content.text}
        onReveal={() => handleRevealPost(post._id)}
        revealed={revealedPosts[post._id]}
      />
    )}
  </>
) : (
  <>
    {/* Normal post rendering */}
    {post.content.text && (
      <Text style={styles.postText}>{post.content.text}</Text>
    )}
    {post.content.media && post.content.media.length > 0 && (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: post.content.media[0].url }}
          style={[styles.mediaContent, { width: '100%' }]}
        />
      </View>
    )}
  </>
)}
```

5. **Add Styles:**
```typescript
blurOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
},
revealMediaButton: {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 25,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.4)',
},
revealMediaText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
```

## User Flow

1. **Creating a One-Time Post:**
   - User creates a post normally
   - Toggles "Enable One-Time View" in Interaction Settings
   - Post is created with `oneTime.enabled = true`

2. **Viewing a One-Time Post:**
   - Post appears in feed with blurred media
   - Caption is hidden behind particle noise effect
   - User taps to reveal
   - Both media and caption are revealed
   - Backend marks user as having viewed the post

3. **After Viewing:**
   - Post remains visible until user refreshes
   - On refresh, post is filtered out from that user's feed
   - Post remains visible to other users who haven't viewed it yet

## Technical Notes

- **Particle Effect:** Uses 80 animated particles with random jittering motion
- **Blur Effect:** Uses React Native's `blurRadius` prop (no external dependencies needed)
- **Performance:** Particle animations use `useNativeDriver: true` for optimal performance
- **State Management:** Revealed state is stored locally and synced with backend
- **Feed Filtering:** Backend uses MongoDB `$nor` operator to exclude viewed posts

## Testing

1. Create a one-time post with media and caption
2. View it from another account - verify blur and particle effects
3. Tap to reveal - verify smooth animation
4. Refresh feed - verify post disappears
5. Check from original poster's account - verify post still visible

## Future Enhancements

- Add animation when post disappears from feed
- Add counter showing how many users have viewed
- Add option to set view limit (e.g., "3 views only")
- Add screenshot detection/prevention
- Add time limit for viewing (e.g., "view within 24 hours")
