# Clipboard History

A userscript that maintains a history of your clipboard contents, allowing you to access and reuse previously copied text.

## Features

- Automatically saves text copied to clipboard
- Stores up to 20 most recent clipboard entries
- Prevents duplicate entries
- Access clipboard history through browser context menu
- Copy previous entries back to clipboard
- Clear clipboard history

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Create a new userscript in Tampermonkey
3. Copy the contents of `clipboard-history.js` into the editor
4. Save the script

## Usage

The script adds three commands to your Tampermonkey menu:

1. **Show Clipboard History**: Displays a list of all saved clipboard entries
2. **Clear Clipboard History**: Removes all saved entries
3. **Copy from History**: Prompts for an index number and copies the corresponding entry back to clipboard

### How It Works

- The script automatically saves text whenever you perform a copy operation (Ctrl+C/⌘+C)
- Each entry is stored only once (no duplicates)
- When the history reaches 20 entries, the oldest entry is removed

## Permissions

The script requires the following Tampermonkey permissions:

- `GM_setValue`: For storing clipboard history
- `GM_getValue`: For retrieving clipboard history
- `GM_addStyle`: For potential future styling features
- `GM_registerMenuCommand`: For adding commands to the Tampermonkey menu


### Technical Details

- Written in JavaScript
- Uses the Clipboard API for reading/writing clipboard content
- Implements event listener for 'copy' events
- Stores data using Tampermonkey's storage API

### Configuration

The maximum history size can be adjusted by modifying the `MAX_HISTORY` constant in the script.
