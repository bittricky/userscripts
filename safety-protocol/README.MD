# Safety Protocol Userscript

A Tampermonkey userscript that automatically redirects HTTP URLs to HTTPS and handles mixed content security issues. This script helps protect your browsing by ensuring secure connections whenever possible.

## Features

- 🔒 Automatic HTTP to HTTPS redirection
- 🛡️ Mixed content protection (upgrades HTTP resources to HTTPS)
- ⚪ Whitelist support for trusted domains
- 📝 Console logging for tracking redirects
- 🔄 Retry mechanism for failed HTTPS attempts
- ⚙️ Configurable settings via Tampermonkey menu

## Installation

1. Install the Tampermonkey browser extension:

   - [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

2. Click on the Tampermonkey icon in your browser
3. Select "Create a new script"
4. Copy the entire contents of `safety-protocol.js` into the editor
5. Save the script (Ctrl+S or File > Save)

## Usage

The script runs automatically on all websites. You can control its behavior through the Tampermonkey menu:

1. Click the Tampermonkey icon in your browser
2. Find "Safety Protocol" in the menu
3. Click "Enable Safety Protocol" to toggle the whitelist feature on/off

### Whitelist

By default, the following domains are whitelisted (allowed to use HTTP):

- localhost
- 127.0.0.1

These domains are useful for local development and testing.

### Testing

To test the script locally:

1. Navigate to the `test` directory
2. Start a local server:
   ```bash
   python3 -m http.server 8080
   # or
   npx http-server
   # or
   npx live-server --port=8080
   # or
   ruby -run -ehttpd . -p8080
   # or
   cargo install miniserve && miniserve --port 8080
   ```
3. Open `http://localhost:8080/test.html` in your browser
4. Check the browser console (F12) to see redirect logs

## Configuration

The script includes several configurable options in the `CONFIG` object:

- `enableWhitelist`: Toggle whitelist functionality
- `whitelistedDomains`: Array of domains allowed to use HTTP
- `logRedirects`: Enable/disable console logging
- `handleMixedContent`: Automatically upgrade mixed content to HTTPS
- `retryFailedHttps`: Retry failed HTTPS connections
- `maxRetries`: Maximum number of retry attempts

## Security Features

1. **Automatic HTTPS Upgrade**: Redirects HTTP URLs to their HTTPS equivalents
2. **Mixed Content Protection**: Upgrades HTTP resources (images, scripts, etc.) to HTTPS
3. **Whitelist System**: Allows exceptions for trusted domains
4. **Retry Mechanism**: Handles failed HTTPS attempts gracefully

@Author: Mitul Patel
