# Voice Note Testing Guide

## Quick Test Steps

### 1. Test Voice Note Recording and Preview
1. Open the app and navigate to Create Post screen
2. Tap "🎤 Record Voice Note"
3. **Verify**: Recording indicator shows with animated waveform
4. **Verify**: Timer counts up (0s, 1s, 2s, etc.)
5. Speak for 5-10 seconds
6. Tap the stop button (⏹)
7. **Verify**: Preview shows:
   - Play button (▶)
   - Waveform visualization
   - **Duration displayed** (e.g., "0:05" or "0:10")
   - Voice effect selector showing "None" by default

### 2. Test Voice Effects Selection
1. In the voice note preview, scroll through the effect options
2. Select "Deep" effect
3. **Verify**: Effect button highlights in green
4. **Verify**: Effect name appears next to duration (e.g., "0:05 • deep")
5. Tap play button
6. **Verify**: Voice plays with deeper/slower sound
7. Try other effects:
   - **Soft**: Slightly slower, softer
   - **Robot**: Robotic quality
   - **Glitchy**: Faster, distorted
   - **Girly**: Higher pitch, faster
   - **Boyish**: Lower pitch, slower

### 3. Test Voice Note Upload
1. With a voice note recorded and effect selected
2. Add a category (e.g., "Music")
3. Tap "Post"
4. **Verify**: Post uploads successfully
5. Navigate to Home feed
6. **Verify**: Your post appears with:
   - Voice note player
   - **Duration displayed** (e.g., "0:05")
   - **Effect name displayed** if not "none" (e.g., "• deep")

### 4. Test Voice Note Playback in Feed
1. In the Home feed, find a post with a voice note
2. **Verify**: Duration is visible before playing
3. Tap the play button (▶)
4. **Verify**: 
   - Button changes to pause (⏸)
   - Waveform changes color to green
   - Voice plays with the selected effect applied
5. Tap pause button
6. **Verify**: Playback pauses
7. Tap play again
8. **Verify**: Playback resumes from where it paused

### 5. Test Voice Note in Post Detail
1. Tap on a post with a voice note to open Post Detail screen
2. **Verify**: Voice note shows with:
   - Duration displayed
   - Effect name displayed (if not "none")
3. Tap play button
4. **Verify**: Voice plays with effect applied
5. **Verify**: Play/pause works correctly

## Expected Results

### Duration Display
- ✅ Shows during recording (counting up)
- ✅ Shows in preview after recording
- ✅ Shows in home feed
- ✅ Shows in post detail
- ✅ Format: "M:SS" (e.g., "0:05", "1:23")
- ✅ Shows "0:00" if duration is missing

### Voice Effects
- ✅ Effect selection highlights in preview
- ✅ Effect name displays next to duration
- ✅ Effect applies during playback in preview
- ✅ Effect applies during playback in feed
- ✅ Effect applies during playback in post detail
- ✅ Each effect produces noticeably different sound:
  - **None**: Normal voice
  - **Deep**: Lower pitch, slower (rate 0.8)
  - **Soft**: Slightly lower, slower (rate 0.9)
  - **Robot**: Robotic quality (rate 1.0, low pitch correction)
  - **Glitchy**: Faster, distorted (rate 1.2, low pitch correction)
  - **Girly**: Higher pitch, faster (rate 1.15)
  - **Boyish**: Lower pitch, slower (rate 0.85)

## Common Issues and Solutions

### Issue: Duration shows "0:00"
**Cause**: Recording duration not captured properly
**Solution**: 
- Check that recording timer is running during recording
- Verify `recordingDuration` state is updating
- Check console logs for "Voice note recorded:" message with duration

### Issue: Voice effect not audible
**Cause**: Effect settings not applied or device limitations
**Solution**:
- Verify effect is selected (highlighted in green)
- Check console logs for playback settings
- Try more extreme effects like "glitchy" or "deep"
- Note: Some devices may have limited audio processing capabilities

### Issue: Voice note doesn't play
**Cause**: Audio permissions or file access issue
**Solution**:
- Check microphone permissions are granted
- Verify file was uploaded successfully
- Check network connection
- Look for error toasts or console errors

## Debug Console Logs

Look for these console messages:

### During Recording:
```
Voice note recorded: { uri: '...', duration: 5, effect: 'deep' }
```

### During Upload:
```
🎤 Uploading voice note: { duration: 5, effect: 'deep', uri: '...' }
✅ Voice note uploaded: { url: '...', effect: 'deep', duration: 5 }
```

### During Post Creation:
```
📝 Creating post with data: { content: { voiceNote: { url: '...', effect: 'deep', duration: 5 } } }
🎤 Voice note in post data: { url: '...', effect: 'deep', duration: 5 }
```

### During Rendering:
```
🎤 Rendering voice note: { url: '...', duration: 5, effect: 'deep', formatted: '0:05' }
```

## Performance Notes

- Voice effects use native audio playback rate modification
- Effects are applied in real-time during playback
- No server-side processing required
- Duration is stored in database and persists
- Waveform is visual only (not actual audio waveform)

## Browser/Platform Differences

- **iOS**: Full support for all effects
- **Android**: Full support for all effects
- **Web**: Limited audio effect support (may not work in all browsers)
- **Rate modification**: Works on all platforms
- **Pitch correction**: May vary by platform
