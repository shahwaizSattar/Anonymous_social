# 🌐 City Radar - Visual Design Guide

## 🎨 Screen Layout

```
┌─────────────────────────────────────┐
│  🌐 City Radar                      │
│  Scanning your area...              │
├─────────────────────────────────────┤
│                                     │
│         ╭─────────────╮             │
│       ╱   🟠 Outer    ╲            │
│      │   10-50 km      │           │
│      │   ╭─────────╮   │           │
│      │  ╱ 🟣 Mid   ╲  │           │
│      │ │  2-10 km   │ │           │
│      │ │  ╭─────╮  │ │           │
│      │ │ ╱🔵Inner╲ │ │           │
│      │ │ │ 0-2km │ │ │           │
│      │ │ │   📍  │ │ │  ← You    │
│      │ │ ╲───────╱ │ │           │
│      │ ╲───────────╱ │           │
│      ╲───────────────╱            │
│                                     │
│  ✨ Floating particles ✨          │
│                                     │
├─────────────────────────────────────┤
│  🔵 Ultra-Local │ 🟣 Nearby │ 🟠 City │
│    0-2 km      │  2-10 km  │ 10-50km│
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ @foodie_pk        📍 0.8 km │   │
│  │ Best biryani spot! 🍛       │   │
│  │ #food                       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ @commuter123      📍 1.5 km │   │
│  │ Traffic jam, avoid!         │   │
│  │ #alert                      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 🎭 Animation States

### Radar Pulse
```
Frame 1:  ●  (small, opaque)
Frame 2:  ◉  (medium, fading)
Frame 3:  ○  (large, transparent)
Frame 4:  ●  (reset)
```

### Ring Animations
```
Inner Ring:  ━━━  (fast pulse, 1s)
Mid Ring:    ━━━  (medium pulse, 1.5s)
Outer Ring:  ━━━  (slow pulse, 2s)
```

### Particle Movement
```
Start:  ✦ (bottom)
  ↓
Move:   ✦ (floating up)
  ↓
Fade:   ✧ (disappearing)
  ↓
Reset:  ✦ (bottom)
```

## 🎨 Color Palette

### Ring Colors
```css
Inner Ring:  #00D4AA  /* Cyan - Close */
Mid Ring:    #A855F7  /* Purple - Nearby */
Outer Ring:  #FF6B35  /* Orange - Far */
Center Dot:  Primary  /* Your location */
```

### Distance Badges
```css
0-2 km:   Background: #00D4AA20, Text: #00D4AA
2-10 km:  Background: #A855F720, Text: #A855F7
10-50 km: Background: #FF6B3520, Text: #FF6B35
```

### UI Elements
```css
Background:  Dark gradient (charcoal → navy)
Surface:     Glassmorphism (translucent)
Text:        White / Light gray
Borders:     Subtle glow
Shadows:     Soft depth
```

## 📐 Dimensions

### Radar Rings
```
Outer Ring:  280px diameter
Mid Ring:    180px diameter
Inner Ring:  100px diameter
Center Dot:   20px diameter
```

### Post Cards
```
Width:       90% of screen
Height:      Auto (min 100px)
Padding:     16px
Radius:      16px
Margin:      8px vertical
```

### Ring Buttons
```
Width:       33% of screen
Height:      80px
Padding:     12px vertical
Radius:      12px
Border:      2px
```

## 🎬 Interaction States

### Ring Selection
```
Unselected:
  Border: 2px solid #border (40% opacity)
  Background: transparent
  
Selected:
  Border: 2px solid #ringColor
  Background: #ringColor (10% opacity)
  Glow: 0 0 20px #ringColor
```

### Post Card Hover
```
Normal:
  Shadow: small
  Scale: 1.0
  
Pressed:
  Shadow: medium
  Scale: 0.98
  
Active:
  Shadow: large
  Scale: 1.0
  Glow: subtle
```

## 🌊 Animation Timing

### Radar Pulse
```javascript
Duration: 2000ms
Easing: linear
Loop: infinite
Scale: 1.0 → 1.5
Opacity: 1.0 → 0.0
```

### Ring Pulse
```javascript
Inner:  1000ms, scale 1.0 → 1.1
Mid:    1500ms, scale 1.0 → 1.05
Outer:  2000ms, scale 1.0 → 1.03
Easing: spring
Loop: infinite
```

### Particles
```javascript
Duration: 3000ms
Delay: staggered (100ms each)
Movement: translateY(0 → -20px)
Opacity: 0 → 1 → 0
Loop: infinite
```

### Button Press
```javascript
Press:   100ms, scale 1.0 → 0.92
Release: 300ms, scale 0.92 → 1.05 → 1.0
Easing: spring
```

## 📱 Responsive Layout

### Mobile Portrait
```
Radar Height: 40% of screen
Controls:     Full width, 3 columns
Posts:        Full width, vertical scroll
```

### Mobile Landscape
```
Radar Height: 50% of screen
Controls:     Full width, 3 columns
Posts:        Full width, vertical scroll
```

### Tablet
```
Radar Height: 35% of screen
Controls:     Centered, max 600px
Posts:        Centered, max 600px
```

### Web
```
Radar Height: 400px fixed
Controls:     Centered, max 800px
Posts:        Centered, max 800px
```

## 🎯 Touch Targets

### Minimum Sizes
```
Ring Buttons:  44px × 44px (iOS guideline)
Post Cards:    Full width × 100px min
Center Dot:    20px (visual only)
Close Button:  32px × 32px
```

## 🌈 Theme Variations

### Dark Mode (Default)
```
Background:  #0A0A0A → #1A1A2E
Surface:     #1E1E2E (translucent)
Text:        #FFFFFF
Secondary:   #A0A0B0
Border:      #2A2A3E
```

### Light Mode (Future)
```
Background:  #F5F5F7 → #E8E8F0
Surface:     #FFFFFF (translucent)
Text:        #1A1A1A
Secondary:   #6A6A7A
Border:      #D0D0D8
```

## 🎪 Special Effects

### Glassmorphism
```css
background: rgba(30, 30, 46, 0.7)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.1)
```

### Neon Glow
```css
box-shadow: 
  0 0 10px rgba(color, 0.3),
  0 0 20px rgba(color, 0.2),
  0 0 30px rgba(color, 0.1)
```

### Particle Trail
```css
box-shadow: 
  0 0 4px rgba(primary, 0.8),
  0 0 8px rgba(primary, 0.4)
```

## 📊 Performance Targets

### Frame Rate
```
Target:     60 FPS
Minimum:    30 FPS
Animations: Hardware accelerated
```

### Load Times
```
Initial:    < 2s
Location:   < 2s
Posts:      < 1s
Filtering:  < 500ms
```

## 🎨 Typography

### Headers
```
Title:      24px, Bold, White
Subtitle:   14px, Regular, Gray
```

### Ring Labels
```
Distance:   11px, Semibold, Ring Color
Range:      10px, Regular, Gray
```

### Post Content
```
Author:     14px, Semibold, White
Content:    15px, Regular, White
Category:   12px, Semibold, Primary
Distance:   12px, Semibold, Ring Color
```

## 🎭 Empty States

### No Location Permission
```
Icon:    🔒 (64px)
Title:   "Location Access Required"
Text:    "Enable location to discover nearby posts"
Button:  "Enable Location"
```

### No Posts Found
```
Icon:    🔍 (64px)
Title:   "No posts in this range"
Text:    "Try selecting a different range"
Button:  "View All Posts"
```

### Loading
```
Icon:    ⏳ (64px)
Title:   "Scanning your area..."
Text:    "Finding nearby posts"
```

## 🎬 Transition Effects

### Screen Enter
```
Radar:   Fade in + Scale up (300ms)
Rings:   Staggered fade in (100ms delay)
Posts:   Slide up (200ms)
```

### Ring Selection
```
Ripple:  Expand from center (400ms)
Glow:    Fade in (200ms)
Posts:   Fade out → Fade in (300ms)
```

### Post Tap
```
Card:    Scale down (100ms)
Screen:  Fade to detail (300ms)
```

---

## 🎨 Design Philosophy

**Premium**: Glassmorphism, neon colors, smooth animations
**Futuristic**: Radar interface, sonar effects, sci-fi vibes
**Intuitive**: Clear visual hierarchy, obvious interactions
**Performant**: 60 FPS, hardware acceleration, optimized
**Accessible**: High contrast, clear labels, touch targets

---

**Status**: ✅ Design Complete
**Last Updated**: November 27, 2025
