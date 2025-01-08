# Dark Pattern Detector

A Tampermonkey userscript that helps identify and highlight potential dark patterns on websites. [Dark patterns](https://en.wikipedia.org/wiki/Dark_pattern) are user interface design choices that manipulate or trick users into doing things they might not want to do.

## Features

The script detects several types of dark patterns:

1. **Urgency Patterns**
   - "Limited time" offers
   - "Ending soon" messages
   - "Last chance" promotions
   - Time-pressure tactics

2. **Scarcity Patterns**
   - "Only X left" messages
   - "In high demand" claims
   - Limited stock warnings
   - Supply shortage indicators

3. **Social Pressure**
   - "In your cart" reminders
   - "Others are viewing" messages
   - "Popular right now" claims
   - Recent activity notifications

4. **Misdirection**
   - "Recommended" options
   - "Most popular choice" suggestions
   - "Best value" claims
   - Special offer highlighting

## How It Works

The script:
1. Scans webpage text for common dark pattern phrases
2. Highlights suspicious content with a red border
3. Shows tooltips on hover explaining the potential dark pattern
4. Continuously monitors for new content being added to the page

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click [dark-pattern-detector.user.js](dark-pattern-detector.user.js)
3. Click "Install" when Tampermonkey opens the install page

## Usage

Once installed, the script runs automatically on all websites. When it detects potential dark patterns:
- The suspicious content will be highlighted with a light red background
- Hovering over the highlighted area shows what type of dark pattern was detected
- The detection runs automatically on new content as you scroll or as the page updates

## Contributing

Feel free to contribute by:
- Adding new dark pattern detection phrases
- Improving the detection algorithm
- Enhancing the visual feedback
- Reporting false positives/negatives

## License

MIT License