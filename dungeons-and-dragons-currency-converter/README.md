# D&D 5e Currency Converter

A userscript that adds a Dungeons & Dragons 5th Edition currency converter to any webpage. When mental math has just become a bit too difficult to do. This tool allows for easy conversion between the D&D currency denominations within their core monetary system: 

- Platinum (pp)
- Gold (gp)
- Electrum (ep)
- Silver (sp)
- Copper (cp)

## Features

- **Universal Website Compatibility**: Works on any website
- **Complete D&D 5e Currency System**: Supports all official D&D 5e currency denominations
- **Accurate Conversion**: Uses the standard D&D 5e exchange rates
- **Optimal Currency Breakdown**: Provides the most efficient combination of coins when converting to lower value currencies
- **Clean Medieval-themed UI**: Styled with a dark red color scheme reminiscent of D&D aesthetics
- **Floating Toggle Button**: Accessible but unobtrusive interface

## Installation

1. Install a userscript manager extension for your browser:
   - [Tampermonkey](https://www.tampermonkey.net/) (recommended, works on Chrome, Firefox, Edge, Safari, and Opera)
   - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox only)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, and Edge)

2. Click on the userscript manager icon in your browser and select "Create a new script" or "Add a new script"

3. Copy the entire contents of `dungeons-and-dragons-currency-converter.js` and paste it into the script editor

4. Save the script (typically Ctrl+S or Command+S)

5. The script should now be installed and active on all websites

## Usage

1. Navigate to any webpage

2. Click on the red coin icon that appears in the bottom-right corner of the page

3. The D&D 5e Currency Converter widget will appear with the following fields:
   - **Amount**: Enter the numerical amount to convert
   - **From Currency**: Select the source currency denomination (pp, gp, ep, sp, or cp)
   - **To Currency**: Select the target currency denomination

4. Click the "Convert" button to perform the conversion

5. The result will be displayed below the button

6. For conversions to lower value currencies, an optimal breakdown of mixed coins will also be displayed

7. Use the exchange button (↔) to quickly swap the source and target currencies

8. Click the X button or the coin icon again to close the converter

## Technical Details

### D&D 5e Currency Exchange Rates

The script uses the standard D&D 5e currency exchange rates:

| Currency | Abbreviation | Value in Gold Pieces |
|----------|--------------|----------------------|
| Platinum | pp           | 10 gp                |
| Gold     | gp           | 1 gp                 |
| Electrum | ep           | 0.5 gp               |
| Silver   | sp           | 0.1 gp               |
| Copper   | cp           | 0.01 gp              |

### Conversion Logic

The conversion process follows these steps:

1. Convert the input amount from the source currency to gold pieces (the base currency)
2. Convert from gold pieces to the target currency
3. Format the result with appropriate decimal places
4. If converting to a lower value currency, calculate the optimal breakdown

### Code Structure

The userscript is structured as follows:

- **UserScript Metadata**: Defines script properties for userscript managers
- **SVG Icons**: Font Awesome icons for the UI elements
- **Currency Rates**: Object defining the D&D 5e currency values
- **CSS Styles**: Styling for the converter widget and toggle button
- **DOM Elements**: Creation of the toggle button and converter widget
- **Event Listeners**: Handling user interactions
- **Conversion Functions**: Logic for currency conversion and breakdown

## Customization

You can customize the script by modifying the following sections:

- **Color Scheme**: Change the colors in the CSS styles section (look for `#8B0000` and related colors)
- **Position**: Adjust the `bottom` and `right` properties in the CSS for `#dnd-toggle-btn` and `#dnd-currency-converter`
- **Size**: Modify the `width` property of `#dnd-currency-converter` to change the widget size

## Troubleshooting

- **Widget Not Appearing**: Make sure your userscript manager is enabled for the current website
- **Conversion Not Working**: Check that you've entered a valid number in the Amount field
- **Styling Issues**: Some websites with aggressive CSS might affect the widget styling; try adjusting the z-index values in the CSS


