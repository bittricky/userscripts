# Positive Affirmations 

> A little positivity goes a long way.

A userscript that displays positive affirmations in a clean, modern floating element that refreshes periodically. The affirmations are fetched from the [Affirmations.dev](https://www.affirmations.dev/) API.

## Features

- 🎯 Displays motivational affirmations in a floating element
- 🔄 Automatically refreshes every 30 seconds
- 🎨 Clean, modern UI with smooth hover effects
- ❌ Easy-to-use close button
- 📱 Responsive design with min/max width constraints
- 🌐 Works on any website

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click [here](positive-affirmations.js) to install the script
3. Click "Install" or "OK" when prompted by your userscript manager

## Usage

Once installed, the script will:

1. Create a floating element in the top-right corner of any webpage
2. Display a new affirmation every 30 seconds
3. Allow you to close the element using the X button
4. Automatically handle API errors with fallback messages

## Technical Details

### API Integration

The script uses the Affirmations.dev API to fetch random positive affirmations:
- Endpoint: `https://www.affirmations.dev/`
- Method: GET
- Response Format: JSON with an `affirmation` field

### Styling

The element features:
- Fixed positioning in the top-right corner
- White background with subtle shadow
- Rounded corners (10px radius)
- Responsive width (200px - 300px)
- Clean sans-serif typography
- Smooth hover transitions

### Error Handling

The script includes comprehensive error handling:
- API fetch failures
- JSON parsing errors
- Network connectivity issues

## Dependencies

- Tampermonkey or compatible userscript manager
- Font Awesome 6.7.2 SVG icon (embedded)

## Browser Compatibility

- Chrome
- Firefox
- Safari
- Edge
- Any browser that supports userscripts