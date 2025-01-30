# Night Mode Toggle

A userscript that adds a floating night mode toggle button to any website. The script automatically persists your dark mode preference and applies a carefully designed dark theme that enhances readability while maintaining website usability.

## Features

- 🌓 Floating toggle button with smooth animations
- 💾 Persistent dark mode preference across page reloads
- 🎨 Carefully designed dark theme with improved contrast
- 🖼️ Automatic image brightness adjustment
- 🔒 High z-index to ensure button visibility
- ⚡ Efficient CSS-based implementation


## Technical Implementation

### Core Components

1. **Toggle Button**
   - Implemented as a fixed-position button element
   - Uses Font Awesome icons for sun/moon display
   - Includes hover animations and smooth transitions
   - Z-index of 9999 to ensure visibility

2. **Theme Management**
   - Uses `GM_setValue/GM_getValue` for persistence
   - Implements dynamic style injection via `<style>` elements
   - Separate style elements for icons and night mode styles

3. **Dark Theme Implementation**
   - Targets common HTML elements (body, div, section, etc.)
   - Applies !important rules to override existing styles
   - Includes special handling for inputs and images
   - Preserves branding elements through selective filtering

### CSS Structure

```css
/* Main dark theme colors */
Background: #1a1a1a
Text: #e0e0e0
Links: #80b3ff
Input fields: #2d2d2d
Borders: #404040

/* Image adjustments */
Images/Videos: brightness(0.8)
Logos/Branding: brightness(0.9)
```

### State Management

The script maintains a simple boolean state (`isNightMode`) that is:
- Initialized from stored preferences using `GM_getValue`
- Toggled via button click
- Persisted using `GM_setValue`
- Used to determine current theme state

## Required Permissions

The userscript requires the following Tampermonkey permissions:
- `GM_setValue`: For storing theme preference
- `GM_getValue`: For retrieving theme preference
- `@match *://*/*`: To run on all websites

## Dependencies

- Font Awesome 6.5.1 (loaded via CDN)
  - solid.min.js
  - fontawesome.min.js