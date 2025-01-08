# Scroll Break Point

A Tampermonkey userscript that helps prevent infinite scrolling by implementing smart scroll detection and enforced breaks.

## Features

- Universal compatibility with all websites
- Smart scroll speed detection
- Persistent scroll tracking across page refreshes
- Enforced break periods with a modern, user-friendly overlay
- Multiple scroll prevention methods (mouse wheel, touch, DOM events)
- Activity-based timer reset

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension:

   - [Chrome Extension](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Safari Extension](https://apps.apple.com/app/tampermonkey/id1482490089)

2. Click on the Tampermonkey icon in your browser and select "Create a new script"

3. Copy the entire contents of `scroll-break-point.js` into the editor

4. Click File → Save or press Ctrl+S (Cmd+S on Mac)

## How It Works

The script monitors your scrolling behavior using several metrics:

1. **Total Scroll Distance**: Tracks how far you've scrolled in pixels
2. **Scroll Speed**: Monitors how quickly you're scrolling
3. **Time Spent**: Keeps track of continuous scrolling time

When any of these metrics exceed their limits:

- Total scroll distance > 5000 pixels
- Scroll speed > 100 pixels/second
- Time spent > 10 minutes

The script will:

1. Display a friendly overlay suggesting a break
2. Temporarily prevent further scrolling for 3 minutes
3. Provide mindful suggestions during the break
4. Automatically resume normal functionality after the break

## Configuration

The script comes with default settings that you can modify in the `config` object:

```javascript
const config = {
  SCROLL_LIMIT: 5000, // Maximum scroll distance in pixels
  TIME_LIMIT: 10 * 60 * 1000, // Maximum time before break (10 minutes)
  BLOCK_DURATION: 3 * 60 * 1000, // Break duration (3 minutes)
  SCROLL_SPEED_LIMIT: 100, // Maximum scroll speed (pixels/second)
  CHECK_INTERVAL: 100, // How often to check scroll speed (milliseconds)
};
```

## Testing

1. After installing the script, visit a website with infinite scroll like Twitter, Reddit, or Facebook
2. Start scrolling continuously. You can test different trigger conditions:
   - Rapid scrolling: Quickly scroll up and down to trigger the speed limit
   - Distance scrolling: Continuously scroll down a long page
   - Time-based: Keep scrolling periodically for over 10 minutes

To test with lower thresholds during development:

```javascript
const config = {
  SCROLL_LIMIT: 1000, // Lower scroll limit for faster testing
  TIME_LIMIT: 1 * 60 * 1000, // Reduce to 1 minute
  BLOCK_DURATION: 30 * 1000, // Reduce to 30 seconds
  SCROLL_SPEED_LIMIT: 50, // More sensitive speed detection
  CHECK_INTERVAL: 100,
};
```

You can modify these values in Tampermonkey's editor and save to immediately test with new settings.

## Contributing

Feel free to submit issues and enhancement requests!

## Troubleshooting

If the script isn't working:

1. Make sure Tampermonkey is enabled
2. Check if the script is enabled in Tampermonkey's dashboard
3. Try refreshing the page
4. Check browser's console for any errors (Press F12 to open DevTools)
