# Voice Effects Implementation Note

## Current Status

Voice effects are currently **metadata only**. The effect type is stored and displayed, but the actual audio processing is not implemented.

## Why Audio Processing Isn't Implemented

Real-time audio processing requires:

1. **Native Audio Processing Libraries**
   - iOS: AVAudioEngine, Audio Units
   - Android: Oboe, AudioTrack
   - Requires native modules or Expo modules

2. **Server-Side Processing** (Recommended Approach)
   - Upload raw audio to backend
   - Process with FFmpeg or similar
   - Apply effects (pitch shift, reverb, etc.)
   - Return processed audio URL

3. **Performance Considerations**
   - Audio processing is CPU-intensive
   - Should not block UI thread
   - Requires proper memory management

## Recommended Implementation Path

### Option 1: Server-Side Processing (Best)

**Backend (Node.js + FFmpeg):**
```javascript
const ffmpeg = require('fluent-ffmpeg');

const applyVoiceEffect = (inputPath, effect, outputPath) => {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);
    
    switch(effect) {
      case 'deep':
        command.audioFilters('asetrate=44100*0.8,aresample=44100');
        break;
      case 'robot':
        command.audioFilters('afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\'');
        break;
      case 'soft':
        command.audioFilters('equalizer=f=1000:width_type=h:width=200:g=-10');
        break;
      case 'glitchy':
        command.audioFilters('tremolo=f=10:d=0.5');
        break;
      case 'girly':
        command.audioFilters('asetrate=44100*1.3,aresample=44100');
        break;
      case 'boyish':
        command.audioFilters('asetrate=44100*0.9,aresample=44100');
        break;
    }
    
    command
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
};
```

**Upload Route:**
```javascript
router.post('/upload/voice', authenticateToken, upload.single('voice'), async (req, res) => {
  const { effect } = req.body;
  const inputPath = req.file.path;
  const outputPath = `uploads/voice_${Date.now()}_${effect}.m4a`;
  
  if (effect && effect !== 'none') {
    await applyVoiceEffect(inputPath, effect, outputPath);
    // Delete original
    fs.unlinkSync(inputPath);
  }
  
  res.json({
    success: true,
    url: `/uploads/${path.basename(outputPath)}`,
    effect,
    duration: await getAudioDuration(outputPath)
  });
});
```

### Option 2: Native Module (Advanced)

Create an Expo module with native audio processing:

**iOS (Swift):**
```swift
import AVFoundation

class VoiceEffectProcessor {
    func applyEffect(inputURL: URL, effect: String) -> URL {
        let audioFile = try! AVAudioFile(forReading: inputURL)
        let engine = AVAudioEngine()
        let player = AVAudioPlayerNode()
        
        engine.attach(player)
        
        switch effect {
        case "deep":
            let pitchEffect = AVAudioUnitTimePitch()
            pitchEffect.pitch = -400 // Lower pitch
            engine.attach(pitchEffect)
            engine.connect(player, to: pitchEffect, format: audioFile.processingFormat)
            engine.connect(pitchEffect, to: engine.mainMixerNode, format: audioFile.processingFormat)
        // ... other effects
        }
        
        // Process and save
        return outputURL
    }
}
```

### Option 3: Web Audio API (Web Only)

For web platform, use Web Audio API:

```typescript
const applyWebAudioEffect = async (audioBuffer: AudioBuffer, effect: string): Promise<AudioBuffer> => {
  const audioContext = new AudioContext();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  
  let effectNode;
  
  switch(effect) {
    case 'deep':
      effectNode = audioContext.createBiquadFilter();
      effectNode.type = 'lowpass';
      effectNode.frequency.value = 1000;
      break;
    case 'robot':
      effectNode = audioContext.createWaveShaper();
      // Configure wave shaper
      break;
    // ... other effects
  }
  
  source.connect(effectNode);
  effectNode.connect(audioContext.destination);
  
  // Render offline
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  
  // Process and return
  return await offlineContext.startRendering();
};
```

## Current Implementation

The app currently:
1. ✅ Records voice notes
2. ✅ Stores effect selection
3. ✅ Displays effect type
4. ✅ Plays original audio
5. ❌ Does NOT apply actual audio effects

## To Enable Real Effects

Choose one of the options above and:

1. **For Server-Side (Recommended):**
   - Install FFmpeg on server: `apt-get install ffmpeg`
   - Install fluent-ffmpeg: `npm install fluent-ffmpeg`
   - Create voice processing route
   - Update frontend to upload to new route
   - Wait for processing before saving post

2. **For Native Module:**
   - Create Expo module
   - Implement native audio processing
   - Build development client
   - Test on physical devices

3. **For Web Only:**
   - Implement Web Audio API processing
   - Add platform check
   - Process before upload

## Dependencies Needed

### Server-Side:
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Node.js
npm install fluent-ffmpeg
npm install get-audio-duration
```

### Native Module:
```bash
npx create-expo-module voice-effects
```

## Estimated Implementation Time

- **Server-Side:** 4-6 hours
- **Native Module:** 2-3 days
- **Web Audio API:** 6-8 hours

## Current User Experience

Users can:
- Select voice effects
- See which effect is applied
- Play voice notes normally
- Effect is stored for future implementation

The UI indicates the effect, preparing users for when actual processing is added.
