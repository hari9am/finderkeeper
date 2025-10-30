# Lost and Found Platform - Design Guidelines

## Design Approach

**Hybrid System + Reference Approach**
- Foundation: Tailwind CSS with Shadcn UI components for consistency and accessibility
- Inspiration: Linear (clean data presentation), Airbnb (trust signals, card design), Notion (intuitive navigation)
- Philosophy: Balance professional utility with approachable community warmth

**Core Design Principles**
1. **Trust First**: Design must convey security and legitimacy for users sharing personal items and contact information
2. **Visual Clarity**: Item photos are hero content - design supports, never competes with user-submitted imagery
3. **Efficient Scanning**: Users need to quickly browse multiple items - prioritize scannable card layouts
4. **Progressive Disclosure**: Show essential info at a glance, reveal details on interaction

## Typography

**Font System**
- Primary: Inter (Google Fonts) - Clean, professional, excellent readability at all sizes
- Headings: Inter Semi-Bold (600) and Bold (700)
- Body: Inter Regular (400) and Medium (500)

**Type Scale**
- Hero Headings: text-5xl md:text-6xl (48-60px) - Homepage, major section headers
- Page Titles: text-3xl md:text-4xl (30-36px) - Dashboard, search results
- Section Headers: text-2xl md:text-3xl (24-30px) - Card groups, form sections
- Card Titles: text-lg md:text-xl (18-20px) - Item names, message headers
- Body Text: text-base (16px) - Descriptions, content
- Small Text: text-sm (14px) - Metadata, timestamps, labels
- Micro Text: text-xs (12px) - Helper text, legal

## Layout System

**Spacing Primitives**
Core spacing units using Tailwind: **2, 3, 4, 6, 8, 12, 16, 20, 24**
- Tight spacing: p-2, p-3 (component internals, badges)
- Standard spacing: p-4, p-6 (cards, forms)
- Section spacing: p-8, py-12, py-16 (page sections)
- Large breaks: py-20, py-24 (major section dividers)

**Container Strategy**
- App wrapper: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Content sections: max-w-6xl mx-auto
- Forms/reading content: max-w-2xl
- Dashboard layout: Sidebar 256px fixed + main content flex-1

**Grid Patterns**
- Item cards grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Dashboard stats: grid-cols-2 md:grid-cols-4 gap-4
- Feature highlights: grid-cols-1 md:grid-cols-3 gap-8
- Search filters: Single column stack on mobile, sidebar on desktop (w-64)

## Component Library

### Navigation
**Header**
- Sticky top navigation with blur backdrop (backdrop-blur-lg)
- Logo left, main nav center (Desktop), auth/profile right
- Mobile: Hamburger menu with slide-out drawer
- Height: h-16, with shadow-sm

**Sidebar Navigation (Dashboard)**
- Fixed left sidebar w-64 on desktop
- Sections: Dashboard, My Items, Messages, Browse, Settings
- Active states with subtle highlight strip (border-l-4)

### Item Cards
**Primary Card Design**
- Rounded corners: rounded-xl
- Border: border with subtle shadow
- Image ratio: aspect-square for thumbnail, maintains original in detail view
- Image loads with blur placeholder
- Card structure:
  - Image container (position-relative for status badges)
  - Category badge (absolute top-3 left-3, rounded-full, text-xs)
  - Content padding: p-4
  - Title: font-semibold text-lg, line-clamp-1
  - Description: text-sm, line-clamp-2
  - Metadata row: flex justify-between items-center text-xs (location, date)
  - AI match indicator: small badge when relevant

### Forms
**Input Fields**
- Standard height: h-12
- Border radius: rounded-lg
- Border: border-2 on focus
- Labels: text-sm font-medium mb-2
- Helper text: text-xs below input with mt-1
- Required asterisk handling with proper labels

**Photo Upload**
- Drag-and-drop zone with dashed border
- Preview thumbnails in grid: grid-cols-3 md:grid-cols-4 gap-3
- Max 5 photos per item
- Each preview: aspect-square, rounded-lg with remove button overlay

**Buttons**
- Primary CTA: h-12 px-6 rounded-lg font-medium
- Secondary: h-10 px-4 rounded-md
- Icon buttons: h-10 w-10 rounded-full
- Blurred background when overlaying images: backdrop-blur-md with semi-transparent background

### Search & Filters
**Search Bar**
- Prominent placement: h-14 with rounded-full on homepage, rounded-lg elsewhere
- Icon left, clear button right
- Placeholder text guides user ("Search lost items by description, location...")

**Filter Panel**
- Collapsible sections (Category, Location, Date Range)
- Checkbox groups with proper spacing (gap-3)
- Applied filters shown as dismissible pills above results
- "Clear all" button when filters active

### Messaging
**Message List**
- Conversation cards showing: avatar, name, preview text, timestamp, unread indicator
- Unread conversations with subtle highlight background
- Height: min-h-[80px] for each conversation

**Message Thread**
- Chat bubbles: max-w-[70%], rounded-2xl
- Sender bubbles: rounded-tr-sm
- Receiver bubbles: rounded-tl-sm
- Padding: px-4 py-3
- Input area: Fixed bottom with h-16, rounded-lg input with send button

### Dashboard Widgets
**Stat Cards**
- Grid of metric cards showing: Total Posts, Active Items, Successful Matches, Karma Points
- Each card: p-6, rounded-xl, border
- Large number: text-3xl font-bold
- Label: text-sm
- Trend indicator if applicable (↑ ↓)

**Activity Feed**
- Timeline layout with connecting line
- Items: Flex with icon, content, timestamp
- Icons in rounded-full containers (w-10 h-10)

### Community Features
**Karma Display**
- Badge system with icon + number
- Appears in profile header and success stories
- Tiered badges: Bronze, Silver, Gold with corresponding visual treatment

**Success Stories**
- Card with before/after or item recovered photo
- User avatars of both parties
- Short testimonial text: italic, text-base
- Recovery date and location

## Images

**Hero Section - Homepage**
- Large hero image showing diverse people helping each other / community moment
- Dimensions: Full-width, height ~60vh on desktop, 50vh mobile
- Overlay: gradient overlay for text readability
- CTA buttons with blurred backdrop (backdrop-blur-md bg-white/20)

**Item Photos**
- User-uploaded content is primary visual element
- Always display in cards at aspect-square for consistency
- Detail view: larger preview with thumbnail gallery below
- Lazy loading with blur-up placeholder

**Illustration Spots**
- Empty states: Friendly illustration when no items found ("No matches yet - be the first to post!")
- FAQ section: Small icons/illustrations for each question category
- Safety tips page: Illustrative icons for each tip

**Profile Avatars**
- Circular: rounded-full
- Sizes: w-8 h-8 (small), w-12 h-12 (standard), w-24 h-24 (profile page)
- Default fallback with initials on solid background

## Animations

Minimal, purposeful animations only:
- Page transitions: Subtle fade (200ms)
- Card hover: Gentle lift (translateY -2px) with shadow increase
- Button states: Built-in component states
- Message send: Brief slide-in animation
- Success notifications: Slide down from top

**Prohibited**: No scroll-triggered animations, parallax effects, or loading spinners beyond necessary feedback.