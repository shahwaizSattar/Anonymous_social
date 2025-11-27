# Lock Feature - Visual Reference

## Before (Not Working)
```
┌─────────────────────────────────┐
│ @username          2h ago       │
│ #Category                       │
│ This is my post...              │
│                                 │
│ 👍 Like (50)    💬 Comment (10) │  ← Both clickable
│ 50 likes • 10 comments          │
└─────────────────────────────────┘
User can click and interact ❌
```

## After (Working) - Reactions Locked

```
┌─────────────────────────────────┐
│ @username          2h ago       │
│ #Category                       │
│ This is my post...              │
│                                 │
│ 👍 Like (50)    💬 Comment (10) │
│    ↑ greyed                     │
│    ↑ 40% opacity                │
│    ↑ disabled                   │
│                                 │
│ 50 likes • 10 comments          │
│ 🔒 Reactions locked             │  ← Small red text
└─────────────────────────────────┘
Like button doesn't respond ✅
```

## After (Working) - Comments Locked

```
┌─────────────────────────────────┐
│ @username          2h ago       │
│ #Category                       │
│ This is my post...              │
│                                 │
│ 👍 Like (50)    💬 Comment (10) │
│                     ↑ greyed    │
│                     ↑ 40% opacity│
│                     ↑ disabled  │
│                                 │
│ 50 likes • 10 comments          │
│ 🔒 Comments locked              │  ← Small red text
└─────────────────────────────────┘
Comment button doesn't respond ✅
```

## After (Working) - Both Locked

```
┌─────────────────────────────────┐
│ @username          2h ago       │
│ #Category                       │
│ This is my post...              │
│                                 │
│ 👍 Like (50)    💬 Comment (10) │
│    ↑ greyed        ↑ greyed     │
│    ↑ disabled      ↑ disabled   │
│                                 │
│ 50 likes • 10 comments          │
│ 🔒 Reactions & Comments locked  │  ← Small red text
└─────────────────────────────────┘
Both buttons don't respond ✅
```

## Post Detail Screen - Reactions Locked

```
┌─────────────────────────────────────┐
│ @username              2h ago       │
│ #Category                           │
│ This is my post content...          │
│                                     │
│ 😂   😡   😱   💯   ❤️   🤔        │
│ [5]  [2]  [1]  [3]  [8]  [0]       │
│  ↑    ↑    ↑    ↑    ↑    ↑        │
│ All greyed out (40% opacity)       │
│ All disabled                        │
│                                     │
│ 🔒 Reactions are locked on this post│
│                                     │
│ ─────────────────────────────────  │
│ Comments (5)                        │
│ @user1: Great post!                 │
│ @user2: I agree!                    │
└─────────────────────────────────────┘
```

## Post Detail Screen - Comments Locked

```
┌─────────────────────────────────────┐
│ Comments (5)                        │
│ @user1: Great post!                 │
│ @user2: I agree!                    │
│ ─────────────────────────────────  │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Comments are locked...      │   │  ← Greyed input
│ └─────────────────────────────┘   │     40% opacity
│ [Post]  ← Greyed button            │     Disabled
│                                     │
│ 🔒 Comments are locked on this post │
└─────────────────────────────────────┘
```

## Color Scheme

- **Greyed Buttons**: `opacity: 0.4`
- **Lock Text Color**: `theme.colors.error` (red)
- **Lock Text Size**: `fontSize: 11-12`
- **Lock Icon**: 🔒 emoji
- **Disabled State**: `disabled={true}`

## Interaction Flow

### User Clicks Locked Like Button:
1. Button doesn't respond (disabled)
2. If somehow triggered:
   ```
   ┌─────────────────────────┐
   │ ❌ Reactions Locked     │
   │ Reactions are locked on │
   │ this post               │
   └─────────────────────────┘
   Toast appears for 3 seconds
   ```

### User Clicks Locked Comment Button:
1. Button doesn't respond (disabled)
2. If somehow triggered:
   ```
   ┌─────────────────────────┐
   │ ❌ Comments Locked      │
   │ Comments are locked on  │
   │ this post               │
   └─────────────────────────┘
   Toast appears for 3 seconds
   ```

### Post Author View:
```
┌─────────────────────────────────┐
│ @myusername        2h ago       │
│ #Category                       │
│ This is my post...              │
│                                 │
│ 👍 Like (50)    💬 Comment (10) │  ← Both normal
│ 50 likes • 10 comments          │  ← No lock text
└─────────────────────────────────┘
Author can interact normally ✅
```

## Key Visual Indicators

1. **Opacity Change**: Most obvious indicator (40% vs 100%)
2. **Lock Text**: Clear explanation below post
3. **Disabled Cursor**: On web, cursor shows "not-allowed"
4. **No Hover Effect**: Buttons don't respond to hover
5. **Toast Feedback**: If somehow clicked, clear error message

## Responsive Design

### Mobile:
- Touch feedback disabled on locked buttons
- Toast appears at top of screen
- Lock text wraps if needed

### Desktop/Web:
- Cursor changes to "not-allowed"
- Hover states disabled
- Lock text stays on one line

## Accessibility

- Screen readers announce "disabled" state
- Lock text is readable by assistive technology
- Color contrast meets WCAG standards
- Clear visual and textual indicators
