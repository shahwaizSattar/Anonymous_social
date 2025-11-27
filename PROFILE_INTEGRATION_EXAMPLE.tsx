// Example of how to integrate One-Time Post feature into UserProfileScreen.tsx

// 1. Add import at the top
import OneTimePostCard from '../../components/OneTimePostCard';

// 2. In the user's posts section, update the rendering:

// When rendering posts on a user's profile:
{posts.map((post) => (
  <View key={post._id} style={styles.postCard}>
    {/* Post header with author info */}
    <View style={styles.postHeader}>
      {/* ... author info ... */}
    </View>

    {/* Post content */}
    {post.oneTime?.enabled ? (
      <>
        {/* Show one-time badge for post author */}
        {post.author._id === currentUser._id && (
          <View style={styles.authorBadge}>
            <Text style={styles.authorBadgeText}>
              ✨ One-Time Post • {post.oneTime.viewedBy?.length || 0} views
            </Text>
          </View>
        )}
        
        {/* For other users, show the reveal interface */}
        {post.author._id !== currentUser._id ? (
          <OneTimePostCard post={post} />
        ) : (
          // For post author, show normal view
          <>
            {post.content?.text && (
              <Text style={styles.postText}>{post.content.text}</Text>
            )}
            {post.content?.media && post.content.media.length > 0 && (
              <Image 
                source={{ uri: post.content.media[0].url }} 
                style={styles.mediaContent} 
              />
            )}
          </>
        )}
      </>
    ) : (
      // Normal post rendering
      <>
        {post.content?.text && (
          <Text style={styles.postText}>{post.content.text}</Text>
        )}
        {post.content?.media && post.content.media.length > 0 && (
          <Image 
            source={{ uri: post.content.media[0].url }} 
            style={styles.mediaContent} 
          />
        )}
      </>
    )}

    {/* Post actions (reactions, comments, etc.) */}
    {/* ... */}
  </View>
))}

// Add these styles:
const styles = StyleSheet.create({
  // ... existing styles ...
  
  authorBadge: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  authorBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
});

// Key Points:
// 1. Post authors can always see their own one-time posts normally
// 2. Post authors can see view count
// 3. Other users see the blurred/particle reveal interface
// 4. Once revealed, the post disappears from their feed on refresh
