# One-Time Post Feature - Testing Guide

## Prerequisites
- Two test accounts (Account A and Account B)
- Backend server running
- Frontend app running on two devices/browsers

## Test Cases

### 1. Creating a One-Time Post

**Steps:**
1. Log in as Account A
2. Navigate to Create Post screen
3. Add some text content (e.g., "This is a secret message!")
4. Add an image or video
5. Scroll to "One-Time Post ✨" section
6. Toggle "Enable One-Time View" to ON
7. Select a category
8. Tap "Post"

**Expected Results:**
- ✅ Post is created successfully
- ✅ Toast shows "Post created!"
- ✅ Returns to home screen

### 2. Viewing One-Time Post (First Time)

**Steps:**
1. Log in as Account B
2. Navigate to Home feed
3. Locate the one-time post from Account A
4. Observe the post appearance

**Expected Results:**
- ✅ Badge shows "✨ ONE-TIME VIEW"
- ✅ Media is heavily blurred (blur radius ~25)
- ✅ Caption is hidden behind particle noise effect
- ✅ Particles are animated (jittering/dancing)
- ✅ "👁️ Tap to Reveal" button is visible on media
- ✅ "👆 Tap to reveal" hint is visible on caption

### 3. Revealing the Post

**Steps:**
1. As Account B, tap on the blurred media OR the particle noise caption
2. Observe the reveal animation

**Expected Results:**
- ✅ Blur gradually fades away (1 second animation)
- ✅ Particle noise dissolves smoothly
- ✅ Caption text becomes visible
- ✅ Toast appears: "✨ Post Revealed - This post will disappear after refresh"
- ✅ Media is now clear and visible
- ✅ Badge changes or disappears

### 4. Post Persistence (Before Refresh)

**Steps:**
1. As Account B, scroll away from the post
2. Scroll back to find it again
3. Navigate to another screen and back

**Expected Results:**
- ✅ Post remains visible
- ✅ Content stays revealed (not blurred again)
- ✅ No particle effect on caption

### 5. Post Disappearance (After Refresh)

**Steps:**
1. As Account B, pull to refresh the feed
2. Scroll through the entire feed

**Expected Results:**
- ✅ One-time post is no longer visible
- ✅ Other posts from Account A are still visible
- ✅ No errors in console

### 6. Post Visibility for Author

**Steps:**
1. Log in as Account A (post author)
2. Navigate to Home feed
3. Find the one-time post

**Expected Results:**
- ✅ Post is visible normally (not blurred)
- ✅ No particle effect
- ✅ Badge shows "✨ One-Time Post • X views"
- ✅ Can see view count

### 7. Multiple Viewers

**Steps:**
1. Create a one-time post as Account A
2. View and reveal as Account B
3. Log in as Account C (third account)
4. Check if post is visible

**Expected Results:**
- ✅ Account C can see the post
- ✅ Post is blurred for Account C
- ✅ Account C can reveal it independently
- ✅ After Account C reveals, it disappears for them on refresh
- ✅ View count increases for Account A

### 8. Profile View

**Steps:**
1. As Account B, navigate to Account A's profile
2. Find the one-time post in their posts list

**Expected Results:**
- ✅ Post appears with blur/particle effect
- ✅ Can reveal from profile view
- ✅ After revealing, disappears on refresh

### 9. Edge Cases

#### Test 9a: Post with Only Text (No Media)
**Steps:**
1. Create one-time post with only text, no media
2. View as another user

**Expected Results:**
- ✅ Only particle noise effect shows
- ✅ No media section
- ✅ Tap on particle noise reveals text

#### Test 9b: Post with Only Media (No Text)
**Steps:**
1. Create one-time post with only media, no text
2. View as another user

**Expected Results:**
- ✅ Only blurred media shows
- ✅ No caption section
- ✅ Tap on media reveals it

#### Test 9c: Rapid Tapping
**Steps:**
1. View one-time post
2. Rapidly tap reveal button multiple times

**Expected Results:**
- ✅ Only one reveal animation plays
- ✅ No duplicate API calls
- ✅ No errors

#### Test 9d: Network Error During Reveal
**Steps:**
1. Disconnect network
2. Attempt to reveal one-time post
3. Reconnect network

**Expected Results:**
- ✅ Error is handled gracefully
- ✅ Post remains blurred
- ✅ User can retry

### 10. Backend Validation

**Steps:**
1. Check MongoDB after creating one-time post
2. Check after revealing
3. Check after refresh

**Expected Results:**
- ✅ Post document has `oneTime.enabled: true`
- ✅ After reveal, user ID is in `oneTime.viewedBy` array
- ✅ Feed query excludes post for users in `viewedBy`

## Performance Tests

### Test P1: Particle Animation Performance
**Steps:**
1. View one-time post with particle effect
2. Monitor frame rate
3. Scroll while particles are animating

**Expected Results:**
- ✅ Smooth 60fps animation
- ✅ No lag during scrolling
- ✅ Animations use native driver

### Test P2: Multiple One-Time Posts
**Steps:**
1. Create 5 one-time posts
2. Load feed with all 5 visible
3. Scroll through them

**Expected Results:**
- ✅ All posts render correctly
- ✅ No performance degradation
- ✅ Animations don't interfere with each other

## Accessibility Tests

### Test A1: Screen Reader
**Steps:**
1. Enable screen reader
2. Navigate to one-time post
3. Attempt to reveal

**Expected Results:**
- ✅ Badge is announced
- ✅ Reveal button is accessible
- ✅ Content is announced after reveal

### Test A2: High Contrast Mode
**Steps:**
1. Enable high contrast mode
2. View one-time post

**Expected Results:**
- ✅ Particle effect is visible
- ✅ Blur is noticeable
- ✅ Reveal button has sufficient contrast

## Security Tests

### Test S1: Direct API Access
**Steps:**
1. Try to mark post as viewed without authentication
2. Try to mark someone else's post as viewed multiple times

**Expected Results:**
- ✅ Requires authentication
- ✅ Can only mark once per user
- ✅ Returns appropriate error messages

### Test S2: Feed Manipulation
**Steps:**
1. Reveal a one-time post
2. Try to access it via direct URL
3. Try to view it in feed after refresh

**Expected Results:**
- ✅ Direct access is blocked
- ✅ Feed query excludes it
- ✅ Returns 404 or filters it out

## Regression Tests

### Test R1: Normal Posts Still Work
**Steps:**
1. Create normal post (one-time disabled)
2. View from another account

**Expected Results:**
- ✅ No blur effect
- ✅ No particle effect
- ✅ Visible normally
- ✅ Doesn't disappear after viewing

### Test R2: Other Features Unaffected
**Steps:**
1. Test reactions on one-time post
2. Test comments on one-time post
3. Test vanish mode with one-time

**Expected Results:**
- ✅ All features work normally
- ✅ No conflicts between features

## Bug Tracking

| Test Case | Status | Notes | Priority |
|-----------|--------|-------|----------|
| 1. Creating | ⏳ | | High |
| 2. Viewing | ⏳ | | High |
| 3. Revealing | ⏳ | | High |
| 4. Persistence | ⏳ | | Medium |
| 5. Disappearance | ⏳ | | High |
| 6. Author View | ⏳ | | Medium |
| 7. Multiple Viewers | ⏳ | | Medium |
| 8. Profile View | ⏳ | | Low |
| 9. Edge Cases | ⏳ | | Medium |
| 10. Backend | ⏳ | | High |

Legend:
- ⏳ Not tested
- ✅ Passed
- ❌ Failed
- ⚠️ Partial

## Known Issues
(To be filled during testing)

## Notes
(Additional observations during testing)
