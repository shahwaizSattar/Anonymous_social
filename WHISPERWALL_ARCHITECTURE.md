# 🏗️ WhisperWall Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER DEVICE                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Bottom Tab Navigation                     │  │
│  │  [🏠 Feed] [🔍 Search] [+] [👻 Whispers] [👤 Profile] │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           WhisperWallScreen.tsx                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  WhisperTheme (Daily Background)                │  │  │
│  │  │  WhisperParticles (Stars/Hearts/Sparkles)       │  │  │
│  │  │                                                  │  │  │
│  │  │  ┌──────┐  ┌──────┐  ┌──────┐                  │  │  │
│  │  │  │ 🎲   │  │ 😤   │  │ 🤫   │  Floating        │  │  │
│  │  │  │Bubble│  │Bubble│  │Bubble│  Bubbles         │  │  │
│  │  │  └──────┘  └──────┘  └──────┘                  │  │  │
│  │  │                                                  │  │  │
│  │  │  [+ Create Whisper Button]                      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                            ↓                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │     WhisperDetailModal.tsx                       │  │  │
│  │  │  • Full whisper text                             │  │  │
│  │  │  • Reaction bar (😂 😡 😱 💯 ❤️ 🤔)              │  │  │
│  │  │  • Comments section                              │  │  │
│  │  │  • Add comment input                             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              API Service (api.ts)                      │  │
│  │  • whisperWallAPI.createWhisper()                     │  │
│  │  • whisperWallAPI.getWhispers()                       │  │
│  │  • whisperWallAPI.reactToWhisper()                    │  │
│  │  • whisperWallAPI.addWhisperComment()                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Express Server (server.js)                │  │
│  │  • Session middleware (express-session)                │  │
│  │  • CORS configuration                                  │  │
│  │  • Rate limiting                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Routes (routes/whisperwall.js)                 │  │
│  │                                                         │  │
│  │  POST   /api/whisperwall              Create whisper   │  │
│  │  GET    /api/whisperwall              Get all          │  │
│  │  GET    /api/whisperwall/:id          Get one          │  │
│  │  POST   /api/whisperwall/:id/react    Add reaction     │  │
│  │  DELETE /api/whisperwall/:id/react    Remove reaction  │  │
│  │  POST   /api/whisperwall/:id/comments Add comment      │  │
│  │  GET    /api/whisperwall/daily-challenge               │  │
│  │  GET    /api/whisperwall/top-whisper                   │  │
│  │  GET    /api/whisperwall/mood-weather                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Model (models/WhisperPost.js)                  │  │
│  │  • Schema definition                                   │  │
│  │  • Methods: addAnonymousReaction()                     │  │
│  │  • Methods: removeAnonymousReaction()                  │  │
│  │  • Methods: addAnonymousComment()                      │  │
│  │  • Methods: calculateTrendingScore()                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ MongoDB Driver
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas Database                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Collection: whisperposts                       │  │
│  │                                                         │  │
│  │  Document 1: {                                         │  │
│  │    _id: "...",                                         │  │
│  │    randomUsername: "BlueTiger42",                      │  │
│  │    content: { text: "..." },                           │  │
│  │    category: "Vent",                                   │  │
│  │    reactions: { funny: 5, love: 3, ... },             │  │
│  │    comments: [...],                                    │  │
│  │    expiresAt: Date (24h from creation)                │  │
│  │  }                                                     │  │
│  │                                                         │  │
│  │  Document 2: { ... }                                   │  │
│  │  Document 3: { ... }                                   │  │
│  │                                                         │  │
│  │  [TTL Index on expiresAt] → Auto-delete after 24h     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ Cron Job
┌─────────────────────────────────────────────────────────────┐
│                    Scheduled Tasks                           │
├─────────────────────────────────────────────────────────────┤
│  • Daily cleanup at midnight (00:00)                         │
│  • Delete expired whispers                                   │
│  • Reset daily theme                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
WhisperWallScreen
├── WhisperTheme (Background)
├── WhisperParticles (Floating effects)
├── Header
│   ├── Title + Theme name
│   ├── Reset timer
│   └── Streak badge
├── ScrollView
│   └── WhisperBubble[] (Multiple bubbles)
│       ├── Category emoji
│       ├── Preview text
│       └── Reaction count badge
├── Create Button (+)
│   └── Create Modal
│       ├── Category selector
│       ├── Text input
│       └── Post button
└── WhisperDetailModal
    ├── Header (Category + Close)
    ├── Full whisper text
    ├── Author info (anonymous)
    ├── Reaction bar (6 reactions)
    └── Comments section
        ├── Comment list
        └── Add comment input
```

---

## Data Flow

### Creating a Whisper

```
User taps + button
    ↓
Create Modal opens
    ↓
User selects category
    ↓
User types message
    ↓
User taps "Post Whisper"
    ↓
whisperWallAPI.createWhisper()
    ↓
POST /api/whisperwall
    ↓
Generate random username
    ↓
Create WhisperPost document
    ↓
Save to MongoDB
    ↓
Return success + whisper data
    ↓
Update UI with new bubble
    ↓
Increment user streak
    ↓
Show success toast
```

### Reacting to a Whisper

```
User taps bubble
    ↓
WhisperDetailModal opens
    ↓
User taps reaction emoji
    ↓
whisperWallAPI.reactToWhisper()
    ↓
POST /api/whisperwall/:id/react
    ↓
Get/create session ID
    ↓
Check if user already reacted
    ↓
Update reaction counts
    ↓
Save to MongoDB
    ↓
Return updated reactions
    ↓
Update UI (bubble size + counts)
    ↓
Show success toast
```

### 24-Hour Lifecycle

```
Whisper created at 10:00 AM
    ↓
expiresAt = 10:00 AM next day
    ↓
MongoDB TTL index monitors
    ↓
At 10:00 AM next day:
    ↓
MongoDB auto-deletes document
    ↓
Cron job runs at midnight:
    ↓
Cleanup any remaining expired posts
    ↓
New theme activates
    ↓
Fresh start for the day
```

---

## State Management

### WhisperWallScreen State

```typescript
const [whispers, setWhispers] = useState<any[]>([])
const [loading, setLoading] = useState(true)
const [selectedWhisper, setSelectedWhisper] = useState<any>(null)
const [showCreateModal, setShowCreateModal] = useState(false)
const [newWhisperText, setNewWhisperText] = useState('')
const [selectedCategory, setSelectedCategory] = useState('Random')
const [dailyTheme, setDailyTheme] = useState(getDailyTheme())
const [userStreak, setUserStreak] = useState(0)
const [timeUntilReset, setTimeUntilReset] = useState('')
```

### WhisperDetailModal State

```typescript
const [comment, setComment] = useState('')
const [comments, setComments] = useState(whisper?.comments || [])
const [showComments, setShowComments] = useState(false)
const [submitting, setSubmitting] = useState(false)
```

---

## Animation System

### Bubble Animations

```
Entry Animation:
  Scale: 0 → 1 (spring)
  Opacity: 0 → 1 (timing)
  Delay: index * 100ms

Floating Animation:
  TranslateY: 0 → -20 → 0 (loop)
  Duration: 3000ms + random offset
  Easing: Linear

Tap Animation:
  Scale: 1 → 0.95 → 1.05 (spring)
  Duration: 300ms
```

### Particle Animations

```
Stars/Hearts/Sparkles:
  TranslateY: SCREEN_HEIGHT → -100 (loop)
  TranslateX: 0 → 20 → 0 (wave)
  Opacity: 0 → 1 → 1 → 0 (fade in/out)
  Duration: 5000ms + index offset
```

### Modal Animations

```
Entry:
  Scale: 0 → 1 (spring)
  TranslateY: SCREEN_HEIGHT → 0 (timing)
  Duration: 300ms

Exit:
  Scale: 1 → 0 (timing)
  TranslateY: 0 → SCREEN_HEIGHT (timing)
  Duration: 200ms
```

---

## Security & Privacy

### Anonymous System

```
User creates whisper
    ↓
No user ID stored in whisper
    ↓
Random username generated
    ↓
Session ID created for reactions
    ↓
Session stored in cookie (24h)
    ↓
Reactions tracked by session, not user
    ↓
After 24h: Everything deleted
```

### Session Management

```
express-session middleware
    ↓
Session ID in cookie
    ↓
Session data in memory
    ↓
Used for:
  • Reaction tracking
  • Comment tracking
  • Preventing duplicate reactions
    ↓
Not used for:
  • User identification
  • Tracking across days
  • Permanent records
```

---

## Performance Optimizations

1. **Lazy Loading**: Whispers loaded in batches
2. **Native Driver**: All animations use native driver
3. **Memoization**: Theme calculated once per day
4. **Pagination**: API supports page/limit params
5. **Indexes**: MongoDB indexes on category, createdAt
6. **TTL Index**: Auto-cleanup without queries
7. **Session Storage**: In-memory for speed

---

## Scalability Considerations

### Current Capacity
- Handles 1000s of whispers per day
- Session-based reactions scale well
- MongoDB TTL handles cleanup automatically

### Future Scaling
- Add Redis for session storage
- Implement caching layer
- Use CDN for media files
- Add read replicas for MongoDB
- Implement rate limiting per session

---

## Monitoring & Metrics

### Key Metrics to Track
- Daily whisper count
- Reaction distribution
- Category popularity
- Average comments per whisper
- User streak distribution
- Peak posting times
- Theme engagement

### Health Checks
- MongoDB connection status
- Session store health
- API response times
- TTL index performance
- Cron job execution

---

**Architecture designed for privacy, performance, and ephemeral expression** ✨
