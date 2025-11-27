# Voice Note Duration and Effects Fix

## Issues Fixed

### 1. Duration Not Showing During Preview
**Problem**: When recording a voice note in CreatePostScreen, the duration wasn't displayed in the preview.

**Solution**: 
- Added a `voiceNoteFooter` container to display duration and effect
- Updated the preview to show duration using `formatDuration(voiceNote.duration)`
- Added fallback to show "0:00" if duration is 0 or undefined
- Used `recordingDuration` as fallback when `status.durationMillis` is not available

### 2. Duration Not Showing on Home Feed
**Problem**: Voice note duration wasn't displayed when posts appeared in the home feed.

**Solution**:
- Updated `renderVoiceNote` in HomeScreen to properly display duration
- Added fallback to show "0:00" if duration is 0 or undefined
- Ensured duration is passed from backend and properly rendered

### 3. Voice Effects Not Working
**Problem**: Voice effects (deep, soft, robot, glitchy, girly, boyish) were being saved but not applied during playback.

**Solution**:
- Added `getVoiceEffectSettings()` function to map effects to audio playback settings
- Applied rate and pitch correction quality based on selected effect:
  - **Deep**: rate 0.8 (slower/lower pitch)
  - **Soft**: rate 0.9 (slightly slower)
  - **Robot**: rate 1.0 with low pitch correction quality
  - **Glitchy**: rate 1.2 (faster) with low pitch correction quality
  - **Girly**: rate 1.15 (faster/higher pitch)
  - **Boyish**: rate 0.85 (slower/lower pitch)
  - **None**: rate 1.0 (normal)
- Updated playback in CreatePostScreen, HomeScreen, and PostDetailScreen to apply effects

## Files Modified

1. **frontend/src/screens/main/CreatePostScreen.tsx**
   - Added `voiceNoteFooter` style
   - Added `voiceEffectPreview` style
   - Updated voice note preview to show duration and effect
   - Added `getVoiceEffectSettings()` function
   - Updated `playVoiceNote()` to apply voice effects
   - Improved `stopRecording()` to use `recordingDuration` as fallback

2. **frontend/src/screens/main/HomeScreen.tsx**
   - Added `getVoiceEffectSettings()` function
   - Updated `playVoiceNote()` to accept and apply effect parameter
   - Updated `renderVoiceNote()` to pass effect to playback function
   - Added fallback for duration display (shows "0:00" if duration is 0)

3. **frontend/src/screens/main/PostDetailScreen.tsx**
   - Added `getVoiceEffectSettings()` function
   - Updated `playVoiceNote()` to accept and apply effect parameter
   - Updated `renderVoiceNote()` to pass effect to playback function
   - Added fallback for duration display (shows "0:00" if duration is 0)

## Technical Details

### Voice Effect Implementation
Voice effects are implemented using Expo AV's audio playback settings:
- `rate`: Controls playback speed (0.5 = half speed, 2.0 = double speed)
- `pitchCorrectionQuality`: Controls pitch correction (High = maintains pitch, Low = allows pitch shift)

### Duration Tracking
- Duration is captured during recording using a timer interval
- Stored in seconds as an integer
- Formatted for display as "M:SS" or "0:SS"
- Fallback to "0:00" if duration is missing or 0

### Effect Display
- Effect name is displayed next to duration (e.g., "• deep")
- Only shown if effect is not "none"
- Styled with primary color to indicate active effect

## Testing Recommendations

1. **Record a voice note** and verify:
   - Duration shows during recording (counting up)
   - Duration shows in preview after recording
   - Selected effect is displayed in preview

2. **Upload a post with voice note** and verify:
   - Duration appears in home feed
   - Effect name appears if not "none"
   - Playback works correctly

3. **Test each voice effect**:
   - None: Normal playback
   - Deep: Slower, deeper voice
   - Soft: Slightly slower, softer voice
   - Robot: Robotic sound quality
   - Glitchy: Faster, distorted sound
   - Girly: Faster, higher pitch
   - Boyish: Slower, lower pitch

4. **Test in PostDetailScreen**:
   - Duration displays correctly
   - Effect applies during playback
   - Play/pause works properly

## Notes

- Voice effects use native audio playback rate modification
- Effects are approximate and may vary by device
- More advanced effects would require audio processing libraries
- Duration is stored in the database and persists across sessions
