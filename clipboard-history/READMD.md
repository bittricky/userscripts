# Clipboard History

A userscript that maintains a history of your clipboard contents, allowing you to access and reuse previously copied text with a modern, searchable UI.

## Features

- Automatically saves text copied to clipboard
- Stores up to 50 most recent clipboard entries (configurable)
- Modern, searchable UI with timestamps
- Keyboard shortcuts for quick access (Ctrl+Alt+H to show history, Ctrl+Alt+X to clear)
- Visual copy confirmation with feedback
- Prevents duplicate entries (moves existing entries to top)
- Styled modal interface with smooth transitions
- FontAwesome icons for better visual experience

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Create a new userscript in Tampermonkey
3. Copy the contents of `clipboard-history.js` into the editor
4. Save the script

## Usage

The script adds commands to your Tampermonkey menu:

1. **Show Clipboard History (Ctrl+Alt+H)**: Opens a modern UI modal with all saved clipboard entries
2. **Clear Clipboard History (Ctrl+Alt+X)**: Removes all saved entries

### How It Works

- The script automatically saves text whenever you perform a copy operation (Ctrl+C/⌘+C)
- Each entry is stored only once (no duplicates) - if you copy the same text again, it moves to the top
- Entries include timestamps showing when they were copied
- When the history reaches the maximum size (50 entries by default), the oldest entry is removed
- Search functionality allows you to quickly find specific entries
- Click on any entry to copy it back to your clipboard with visual confirmation

## Permissions

The script requires the following Tampermonkey permissions:

- `GM_setValue`: For storing clipboard history
- `GM_getValue`: For retrieving clipboard history
- `GM_addStyle`: For styling the modal interface
- `GM_registerMenuCommand`: For adding commands to the Tampermonkey menu
- `GM_notification`: For displaying notifications


### Technical Details

- Written in modern JavaScript
- Uses the Clipboard API for reading/writing clipboard content
- Implements event listeners for 'copy' events and keyboard shortcuts
- Stores data using Tampermonkey's storage API
- Uses FontAwesome SVG icons for better visual experience
- Implements a responsive modal UI with search functionality

### Configuration

The script can be configured by modifying the `CONFIG` object at the top of the script:

```javascript
const CONFIG = {
  MAX_HISTORY: 50,           // Maximum number of entries to store
  PREVIEW_LENGTH: 75,         // Length of text preview in the UI
  KEYBOARD_SHORTCUT: {
    show: { key: "h", ctrl: true, alt: true },    // Ctrl+Alt+H to show history
    clear: { key: "x", ctrl: true, alt: true },   // Ctrl+Alt+X to clear history
  },
};
```
