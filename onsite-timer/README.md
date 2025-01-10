# On Site Timer

A userscript that displays how long you've spent on each website. The timer features a clean black, white, and red design with intuitive controls for visibility and pause functionality.

## Features

- Track time spent on each website separately
- Persist timing data across page refreshes and browser sessions
- Pause/Resume timer functionality
- Show/Hide timer with a single click
- Clean, modern UI with SVG icons
- Position fixed to bottom-left corner
- Local storage for data persistence

## Installation

1. Install a userscript manager for your browser:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. Install the script:
   - Click [here](https://raw.githubusercontent.com/bittricky/onsite-timer/main/onsite-timer.js) to install directly
   - Or manually create a new script in your userscript manager and copy the contents of `onsite-timer.js`

## Usage

Once installed, the timer will automatically appear on all websites:

- **View Time**: The timer displays hours:minutes:seconds format (00:00:00)
- **Toggle Visibility**: Click the eye icon to show/hide the timer
- **Pause/Resume**: Click the play/pause icon to control the timer
- **Persistence**: Time is saved per domain and persists across sessions

## Technical Overview

### Architecture

The script is built as a self-contained userscript that runs in isolation on each webpage. It uses:

- **Local Storage**: For persisting time data per domain
- **DOM Manipulation**: For creating and updating the timer UI
- **Event Listeners**: For handling user interactions
- **SVG Icons**: For a clean, scalable interface

### Key Components

1. **Storage Management**
   ```javascript
   const STORAGE_KEY = Object.freeze({
     TIME: "onsite_timer_seconds_",
     PAUSED: "onsite_timer_paused_"
   });
   ```
   Domain-specific storage using localStorage with prefixed keys

2. **UI Components**
   - Timer display
   - Control buttons (show/hide, pause/resume)
   - SVG icons for intuitive interaction
   - Styled container with fixed positioning

3. **Time Tracking**
   - Interval-based timer updating every second
   - Format function for converting seconds to HH:MM:SS
   - Automatic save on page unload

### Data Persistence

The script maintains separate timers for each domain by:
- Prefixing storage keys with domain names
- Saving state on pause/resume
- Backing up data before page unload
- Restoring state on page load

## Development

### Prerequisites

- A userscript manager installed in your browser
- Basic knowledge of JavaScript
- Text editor or IDE

### Local Development

1. Clone the repository
2. Make changes to `onsite-timer.js`
3. Either:
   - Copy the updated code to your userscript manager
   - Or set up your userscript to load from local file