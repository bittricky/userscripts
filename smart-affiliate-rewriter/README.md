# Smart Affiliate Rewriter

Automatically adds your affiliate IDs to product links you share via the web. Designed for seamless affiliate management and link rewriting, with a modern floating UI and full control over your affiliate rules.

## Overview
Smart Affiliate Rewriter is a Tampermonkey/Greasemonkey userscript that automatically appends your affiliate tags to supported shopping and travel sites whenever you copy or share a product URL. It features a floating, user-friendly UI for managing affiliate rules and leverages Font Awesome SVG icons for a polished experience.

## Features
- **Automatic Affiliate Tagging**: Appends your affiliate ID to URLs you copy from supported sites.
- **Floating Affiliate Manager**: Easily add, edit, or delete affiliate rules via a floating button and modal interface.
- **Modern SVG Icons**: All UI controls use Font Awesome SVGs for a clean, consistent look.
- **Persistent Settings**: Rules are saved using Tampermonkey/Greasemonkey storage APIs and persist across sessions.
- **Customizable**: Add your own domains, parameters, and affiliate tags.

## How It Works
- When you copy a product link from a supported site, the script intercepts the copy event and rewrites the URL to include your affiliate tag if not already present.
- The floating "Affiliate" button (bottom-right) opens a modal where you can manage affiliate rules for any domain.
- All changes are instantly saved and applied to future copied URLs.

## Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/) in your browser.
2. Download or copy the latest version of `smart-affiliate-rewriter.js` from this repository.
3. Add the script to your userscript manager and enable it.

## Usage
- **Floating Button**: Click the ⚙️ Affiliate button (bottom-right) to open the Affiliate Tag Manager modal.
- **Managing Rules**:
  - **Add/Edit**: Enter the domain, parameter name, and your affiliate tag. Click "Add/Edit" to save.
  - **Delete**: Click the trash icon next to any rule to remove it.
- **Copying Links**: Simply copy a product URL from a supported site. The affiliate tag will be appended automatically if needed.
- **Menu Commands**: Right-click the Tampermonkey icon for quick options like toggling, showing current settings, or resetting to defaults.

## Configuration
- Rules are stored using Tampermonkey's `GM_setValue`/`GM_getValue` APIs.
- Default rules are provided for Amazon, Walmart, Target, BestBuy, eBay, Etsy, Newegg, Booking.com, Hotels.com, Expedia, AliExpress, and Wayfair.
- You can add custom rules for any domain via the UI.

## Supported Sites (Default)
- amazon.*
- walmart.com
- target.com
- bestbuy.com
- ebay.com
- etsy.com
- newegg.com
- booking.com
- hotels.com
- expedia.com
- aliexpress.com
- wayfair.com

## Security & Privacy
- All affiliate settings are stored locally in your browser using secure Tampermonkey storage.
- The script does **not** send any data externally and does not track or log your browsing activity.

## Troubleshooting
- If affiliate tags are not being appended, ensure the script is enabled and your rules are correct.
- Use the "Reset to Default Settings" menu command if you encounter issues.
- For advanced debugging, check the browser console for logs tagged `[AffiliateHelper]`.

## License
MIT License. See [LICENSE](./LICENSE) for details.
