# Website Downloader App - Design Guidelines

## Design Approach

**System Selected:** Linear-inspired minimal design system with Material Design feedback principles

**Rationale:** This is a utility-focused productivity tool where clarity, efficiency, and visual feedback are paramount. The interface should feel professional, fast, and trustworthy.

**Key Principles:**
- Clean, spacious layouts that prioritize function
- Clear visual hierarchy for progress tracking
- Minimal distractions, maximum clarity
- Instant feedback for all user actions

---

## Typography

**Font Family:** Inter (Google Fonts)
- Headings: Inter, weight 600-700
- Body text: Inter, weight 400
- Monospace (file paths/URLs): 'Courier New' or system monospace

**Scale:**
- Hero headline: text-4xl (36px)
- Section headers: text-2xl (24px)
- Card titles: text-lg (18px)
- Body text: text-base (16px)
- Helper text/metadata: text-sm (14px)
- File details: text-xs (12px)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 8, 12, 16
- Tight spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, m-4
- Section spacing: p-8, py-12, gap-8
- Large sections: p-12, py-16

**Grid Structure:**
- Main container: max-w-6xl mx-auto
- Single column on mobile, strategic 2-column splits on desktop (lg:grid-cols-2)
- Form area vs. status area side-by-side on larger screens

---

## Core Components

### Header
Simple top bar with app logo/name and minimal navigation. Height: h-16. Shadow: subtle shadow-sm.

### Main Download Interface
**Layout:** Two-section design
- Left: URL input and configuration panel
- Right: Real-time status and progress display

**URL Input Section:**
- Large, prominent input field (h-12)
- Clear "Download" button below input
- Input validation with immediate visual feedback
- Optional advanced settings in collapsible panel

### Progress Indicator
**Active Download Card:**
- Prominent card with border treatment
- Progress bar (h-2 rounded-full with animated fill)
- File count display (e.g., "Downloading: 47/120 files")
- Current file being processed
- Estimated time remaining
- Cancel button

### Download History
**List Design:**
- Cards for each completed download (gap-4)
- Each card shows: Site URL, timestamp, file count, file size
- Download ZIP button per entry
- Delete option
- Expandable to show file tree structure

### File Tree Display
- Hierarchical folder structure
- Indent levels using pl-4, pl-8, pl-12
- Folder/file icons from Heroicons
- File size metadata in text-sm text-gray-600

### Empty States
When no downloads exist, show centered illustration placeholder with descriptive text and CTA to start first download.

---

## Images

**Hero Section:** Include a clean, minimal hero illustration showing website extraction concept (abstract representation of web pages being organized into folders). Use a modern, geometric illustration style rather than photography.

**Empty State Illustration:** Simple icon-based illustration of a folder with download arrow.

**No additional images needed** - keep interface focused on functionality.

---

## Component Specifications

### Buttons
- Primary action: Solid background, rounded-lg, px-6 py-3
- Secondary: Outlined style, same sizing
- Text buttons: No background, subtle hover underline

### Cards
- Border: border rounded-lg
- Padding: p-6
- Spacing between cards: gap-4
- Hover state: subtle shadow elevation

### Form Elements
- Input fields: border rounded-lg h-12 px-4
- Focus state: clear border highlight
- Error state: border treatment with error text below

### Status Badges
- Small pills (px-3 py-1 rounded-full text-xs)
- States: Downloading (animated pulse), Complete (static), Error (alert style)

---

## Layout Sections

1. **Hero/Input Section** (py-16): Centered content with headline, description, and primary URL input
2. **Active Downloads** (py-8): Real-time progress cards when downloads are running
3. **Download History** (py-8): List of completed downloads with management options
4. **Footer** (py-8): Simple links to documentation, GitHub, or support

---

## Animations

**Minimal, purposeful only:**
- Progress bar fill animation (smooth transition)
- Pulse effect on "Downloading" status badge
- Subtle hover elevation on interactive cards
- Loading spinner during initialization

**Avoid:** Page transitions, scroll animations, decorative effects

---

## Accessibility

- All inputs have associated labels
- Keyboard navigation for all interactive elements
- ARIA labels for status indicators and progress
- Clear focus states with visible outlines
- Sufficient contrast ratios throughout