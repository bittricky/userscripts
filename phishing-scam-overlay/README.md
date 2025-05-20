# Phishing Scam Overlay Userscript

A browser userscript that attempts to protect user from phishing and scam websites by checking the current domain against the [PhishTank](https://phishtank.org/) database of known phishing sites. When a malicious site is detected, the script displays a prominent warning banner and blocks form submissions to prevent credential theft.

## Features

- **Real-time Phishing Detection**: Checks websites against PhishTank's regularly updated database of known phishing sites
- **Warning Banner**: Displays a non-intrusive black and red warning banner at the top of the page
- **Form Protection**: Automatically blocks and disables all forms on detected phishing sites
- **Close Button**: Allows users to dismiss the warning if they choose to proceed (though forms remain blocked)
- **API Key Support**: Optional PhishTank API key configuration for higher rate limits
- **Testing Mode**: Special testing capabilities when running on localhost

## Installation

### Prerequisites

You need a userscript manager extension installed in your browser:

- [Tampermonkey](https://www.tampermonkey.net/) (recommended, works on Chrome, Firefox, Safari, Edge)
- [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)
- [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)

### Installation Steps

1. Install a userscript manager extension for your browser

2. Click on this link to install the script: [Install Phishing Scam Overlay](https://github.com/bittricky/userscripts/phishing-scam-overlay/phishing-scam-overlay.js)

   Alternatively, you can manually install the script:
   - Open your userscript manager dashboard
   - Create a new script
   - Copy and paste the contents of `phishing-scam-overlay.js`
   - Save the script

3. The script is now active and will protect you while browsing

## Configuration

### PhishTank API Key (Optional)

While the script works without an API key, PhishTank limits the number of API calls for users without an API key. For better reliability:

1. Register for a free account at [PhishTank](https://www.phishtank.com/)
2. Obtain your API key from your account settings
3. Configure the script by visiting the Tampermonkey dashboard or any page on tampermonkey.net or greasyfork.org
4. Enter your API key in the configuration panel that appears
5. Click "Save Configuration"

## How It Works

1. **Domain Checking**: When you visit a website, the script sends the URL to the PhishTank API
2. **Detection**: If the site is identified as a phishing site in the PhishTank database:
   - A warning banner appears at the top of the page
   - All forms are disabled and visually marked
   - Form submissions are blocked
3. **User Control**: Users can dismiss the warning banner but forms remain blocked for protection

## Testing

You can safely test the userscript without visiting actual phishing sites:

### Using the Test Page

1. Navigate to the `test.html` file in this repository using a local server
   ```
   cd /path/to/phishing-scam-overlay
   python -m http.server 8080
   ```
2. Open `http://localhost:8080/test.html` in your browser
3. The test page will automatically detect if the userscript is active
4. Use the test buttons to:
   - Simulate a phishing detection (shows the warning banner)
   - Test form blocking functionality

### Testing Features

The userscript automatically enables testing capabilities when running on localhost:

- Functions are exposed to the global scope for testing
- A control panel appears in the bottom-right corner with test buttons
- Multiple tests can be run without reloading the page

### Troubleshooting Tests

If the test page doesn't detect your userscript:

1. Make sure the userscript is installed and enabled
2. Check that you're accessing the test page via `localhost` (not `127.0.0.1`)
3. Reload the page after enabling the userscript
4. Check the browser console for any errors

## Technical Details

### API Integration

The script uses the [PhishTank API](https://www.phishtank.com/api_info.php) to check URLs:

- **Endpoint**: `https://checkurl.phishtank.com/checkurl/`
- **Method**: POST
- **Parameters**:
  - `url`: The URL to check (encoded)
  - `format`: "json"
  - `api_key`: Optional PhishTank API key

### DOM Manipulation

The script uses vanilla JavaScript for all DOM operations:

- Creates a warning banner with SVG icons
- Disables form elements and adds visual indicators
- Intercepts form submissions using event listeners

### Security Considerations

- The script runs at document-start for maximum protection
- Testing functions are only exposed on localhost
- API requests use proper encoding to prevent injection

## Browser Compatibility

- Chrome 49+
- Firefox 52+
- Edge 79+
- Safari 10+

## Acknowledgments

- [PhishTank](https://www.phishtank.com/) for providing the phishing site database
- [Tampermonkey](https://www.tampermonkey.net/) for the userscript manager
- [Claude](https://claude.ai/) for AI assistance with the userscript for testing
