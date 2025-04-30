# Auto Dismiss Cookie/Consent Banners

A lightweight userscript that automatically dismisses cookie consent popups and GDPR banners by preferentially clicking "Reject" buttons.

## Overview

This userscript helps you browse the web without constantly having to click through cookie consent banners. It works by automatically detecting cookie consent dialogs and dismissing them according to your preferences.

### Key Features

- **Privacy-Focused**: Prioritizes "Reject" buttons over "Accept" to minimize tracking cookies
- **Smart Detection**: Identifies cookie banners based on content, position, and styling
- **Multiple Strategies**: Uses several approaches to dismiss banners (button clicking, overlay removal)
- **Configurable**: Easy to customize timing, scan frequency, and button preferences
- **Lightweight**: Minimal performance impact while browsing

## Installation

### Prerequisites

You need a userscript manager extension installed in your browser:

- [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge)
- [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox)
- [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)

### Installation Steps

1. Ensure you have a userscript manager installed (see above)
2. Open the [auto-dismiss-cookies.js](auto-dismiss-cookies.js) file
3. Click the "Raw" button to view the raw script
4. Your userscript manager should detect the script and prompt you to install it
5. Click "Install" or "Confirm installation"

Alternatively, you can manually create a new script in your userscript manager and copy-paste the contents of [auto-dismiss-cookies.js](auto-dismiss-cookies.js).

## How It Works

The script employs several techniques to identify and dismiss cookie consent banners:

1. **Banner Detection**: Identifies potential cookie banners using common selectors and content patterns
2. **Button Identification**: Searches for buttons with text like "Reject", "Decline", "Close", etc.
3. **Multiple Scans**: Performs several scans with delays to catch banners that appear after page load
4. **Mutation Observer**: Monitors for dynamically added banners that appear after initial page load
5. **Fallback Methods**: If no buttons can be clicked, attempts to hide the banner elements directly

## Configuration

The script includes a configuration object at the top that can be modified to change behavior:

```javascript
const config = {
  initialDelay: 500,      // Initial delay before first scan (ms)
  scanInterval: 1500,     // Delay between scans (ms)
  maxScans: 5,            // Maximum number of scans
  preferReject: true,     // Prefer reject over accept buttons
  debug: false            // Enable logging
};
```

### Configuration Options

- **initialDelay**: Time to wait before first scan (milliseconds)
- **scanInterval**: Time between consecutive scans (milliseconds)
- **maxScans**: Maximum number of scans to perform
- **preferReject**: If true, prioritizes "Reject" buttons over "Accept"
- **debug**: If true, outputs detailed logs to the browser console

## Troubleshooting

### The script doesn't dismiss some cookie banners

Some websites use highly customized cookie banners that may not be detected. You can:

1. Enable debug mode by setting `config.debug = true`
2. Open the browser console (F12 > Console) to see debug information
3. Consider adding additional selectors to the `selectors.overlays` array

### The script is clicking the wrong buttons

If the script is accepting cookies when you want to reject them:

1. Ensure `config.preferReject` is set to `true`
2. Add the specific button text patterns to the `buttonPatterns.reject` array

## Compatibility

The script is designed to work on most websites but excludes Google and YouTube domains by default (as they have their own consent flows that may require specific user choices).

## Privacy & Security

This userscript:
- Runs only in your browser
- Does not collect or transmit any data
- Does not modify website functionality beyond dismissing cookie banners
- Prioritizes rejecting tracking cookies by default