# Currency Converter

A modern, minimalist currency converter userscript that can be added to any webpage when you find yourself having difficulty doing the conversion. This tool allows for quick currency conversions without leaving your current page.

## Features

- **Modern Minimalist Design**: Clean interface with green and gold color scheme inspired by U.S. currency
- **Floating Toggle Button**: Easily show/hide the converter with a single click
- **Universal Currency Support**: Convert between any currencies supported by the ExchangeRate-API
- **Real-time Exchange Rates**: Uses the free ExchangeRate-API for up-to-date conversion rates
- **Currency Swap**: Quickly swap between source and target currencies
- **Keyboard Support**: Press Enter to convert after entering an amount
- **CSP Compatible**: Works on all websites regardless of Content Security Policy

## Installation

### Prerequisites

You need a userscript manager extension installed in your browser:

- [Tampermonkey](https://www.tampermonkey.net/) (recommended, works on Chrome, Firefox, Safari, Edge)
- [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)
- [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)

### Installation Steps

1. Ensure you have a userscript manager installed (see above)
2. Open the [currency-converter.js](./currency-converter.js) file in this repository
3. Copy the entire code
4. Open your userscript manager dashboard:
   - Tampermonkey: Click the extension icon → "Dashboard"
   - Greasemonkey: Click the extension icon → "New User Script"
   - Violentmonkey: Click the extension icon → "Open Dashboard"
5. Create a new script:
   - Tampermonkey: Click the "+" tab
   - Greasemonkey: It should already be in edit mode for a new script
   - Violentmonkey: Click the "+" button → "New script"
6. Delete any template code and paste the copied code
7. Save the script:
   - Tampermonkey: Press Ctrl+S or click File → Save
   - Greasemonkey: Click "Save" button
   - Violentmonkey: Click "Save" button

## Usage

1. After installation, visit any website
2. Look for a green circular button in the bottom right corner of the page
3. Click this button to open the currency converter
4. Enter the amount you want to convert
5. Enter the source currency code (e.g., USD, EUR, GBP)
6. Enter the target currency code (e.g., JPY, CNY, INR)
7. Click "Convert" or press Enter
8. View the conversion result
9. To swap currencies, click the exchange icon between the input fields
10. To hide the converter, click the close button or the toggle button again

## Technical Details

### API Information

This userscript uses the free tier of ExchangeRate-API:
- Endpoint: `https://open.er-api.com/v6/latest/[CURRENCY_CODE]`
- Documentation: [ExchangeRate-API Docs](https://www.exchangerate-api.com/docs/free)
- No API key required
- Rate limits apply (see API documentation for details)
- Supports a wide range of currency codes (see API documentation for the full list)
- Validates currency codes and provides error messages for unsupported currencies

### Permissions

The userscript requires the following permissions:

- `GM_addStyle`: To add custom CSS styles to the page
- `GM_xmlhttpRequest`: To make cross-origin requests to the currency API
- `@connect open.er-api.com`: To allow connections to the API domain

### Browser Compatibility

Tested and working on:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (with Tampermonkey)

### What is CSP (Content Security Policy)?

Content Security Policy (CSP) is a security feature implemented by browsers that restricts which external resources a webpage can load. It helps prevent cross-site scripting (XSS) attacks and other code injection vulnerabilities by controlling which domains a page can communicate with.

### Local Development

To modify and test the userscript locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/bittricky/userscripts.git
   cd userscripts/currency-converter
   ```

2. Open the `currency-converter.js` file in your preferred code editor

3. Make your desired changes

4. To test your changes:
   - Option 1: Copy the updated code to your userscript manager as described in the installation steps
   - Option 2: Use the local file option in your userscript manager (if supported):
     - Tampermonkey: Click the "+" tab → "Utilities" tab → "File" (under Import from disk)
     - Navigate to your local `currency-converter.js` file and select it

5. Refresh any webpage to see your changes

## Customization

You can customize various aspects of the converter by modifying the following variables in the code:

- **Color Scheme**: Modify the CSS variables in the `style` constant
- **Position**: Adjust the `bottom` and `right` properties in the CSS for `#cc-toggle-btn` and `#currency-converter`
- **Currencies**: Add or remove currency options in the HTML template within the `widget.innerHTML` assignment

## Acknowledgements

- [ExchangeRate-API](https://www.exchangerate-api.com/) for providing free currency conversion data
- [Font Awesome](https://fontawesome.com/) for the SVG icons used in the interface