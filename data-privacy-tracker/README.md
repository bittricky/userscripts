# Data Privacy Tracker

A handy userscript that helps identify and visualize data trackers on websites, providing insights into the types of tracking technologies being used.

## Features

- Real-time detection of data trackers across multiple categories
- Visual highlighting of tracker elements on web pages
- Categorization of trackers into analytics, advertising, social, and other types
- Modern, clean UI with animated panel
- Configurable settings for highlighting and notifications
- Detailed tracker information including names and patterns

## Installation

1. Install a userscript manager (Tampermonkey recommended)
2. Create a new userscript
3. Copy the contents of `data-privacy-tracker.js` into the script editor
4. Save and enable the script

## Usage

The script automatically runs on all websites and will:

1. Scan for known tracker patterns in scripts, iframes, and cookies
2. Display a floating panel with detected trackers when any are found
3. Highlight tracker elements on the page (configurable)

### Panel Features
- Toggleable visibility by clicking the header
- Category breakdown of detected trackers
- Count of total trackers
- Toggle highlighting of tracker elements
- Close button to hide the panel

## Technical Details

### Tracker Categories

The script detects trackers in the following categories:

- **Analytics**: Tools for website analytics and user tracking
  - Google Analytics
  - Adobe Analytics
  - Matomo/Piwik
  - Hotjar
  - Mixpanel
  - Segment

- **Advertising**: Ad network and retargeting technologies
  - Google Ads
  - Facebook Ads
  - Twitter Ads
  - Amazon Ads
  - AdSense
  - AppNexus

- **Social**: Social media integration and tracking
  - Facebook
  - Twitter
  - LinkedIn
  - Pinterest
  - Instagram

- **Other**: Additional tracking technologies
  - New Relic
  - Optimizely
  - Criteo
  - Cloudflare
  - Intercom

### Configuration

The script can be configured through the `config` object:

```javascript
const config = {
    highlightTrackers: true,      // Enable/disable element highlighting
    showNotification: true,      // Enable/disable notifications
    categorizeTrackers: true,    // Enable/disable category grouping
    logToConsole: true           // Enable/disable console logging
};
```

### Detection Methods

The script uses multiple methods to detect trackers:

1. Script tag analysis
2. Iframe detection
3. Cookie analysis
4. Image pixel tracking
5. Pattern matching against known tracker signatures

## Troubleshooting

- If the panel doesn't appear, check if any trackers were detected
- If highlighting isn't working, verify that `highlightTrackers` is set to `true`
- If the script isn't running, check if your userscript manager is enabled
- If you're missing tracker detections, the site might be using new tracking methods

## Security Considerations

- The script only reads from the page and doesn't modify any data
- All detection is done client-side
- No data is sent to external servers
- The script is open source and can be audited