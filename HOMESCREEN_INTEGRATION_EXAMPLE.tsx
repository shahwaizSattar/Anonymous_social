// Example of how to integrate One-Time Post feature into HomeScreen.tsx

// 1. Add import at the top
import OneTimePostCard from '../../components/OneTimePostCard';

// 2. Inside the post rendering section (where you map through posts), replace:

// OLD CODE:
{post.content?.text && (
  <Text style={styles.postText}>{post.content.text}</Text>
)}
{post.content?.media && post.content.media.length > 0 && (
  <View style={styles.mediaContainer}>
    <Image source={{ uri: post.content.media[0].url }} style={styles.mediaContent} />
  </View>
)}

// NEW CODE:
{post.oneTime?.enabled ? (
  <OneTimePostCard 
    post={post} 
    onReveal={(postId) => {
      // Optional: Add any additional logic when post is revealed
      console.log('Post revealed:', postId);
    }}
  />
) : (
  <>
    {post.content?.text && (
      <Text style={styles.postText}>{post.content.text}</Text>
    )}
    {post.content?.media && post.content.media.length > 0 && (
      <View style={styles.mediaContainer}>
        <Image source={{ uri: post.content.media[0].url }} style={styles.mediaContent} />
      </View>
    )}
  </>
)}

// That's it! The OneTimePostCard component handles:
// - Blurring media
// - Particle noise reveal for caption
// - Marking post as viewed
// - Showing toast notification
// - All animations and state management

// The post will automatically disappear from the feed on next refresh
// because the backend filters out posts where the user is in the viewedBy array
