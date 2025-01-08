# Dark Pattern Detector

A Tampermonkey userscript that helps identify and highlight potential dark patterns on websites. [Dark patterns](https://en.wikipedia.org/wiki/Dark_pattern) are user interface design choices that manipulate or trick users into doing things they might not want to do.

## Features

The script detects several types of dark patterns:

1. **Urgency Patterns**
   - "Limited time" offers
   - "Ending soon" messages
   - "Last chance" promotions
   - "Flash sale" announcements
   - "Don't miss out" warnings
   - "Act fast" prompts

2. **Scarcity Patterns**
   - "Only X left" messages
   - "In high demand" claims
   - "Selling fast" warnings
   - "X people bought" counters
   - "X viewing now" indicators
   - "X in cart" notifications

3. **Social Pressure**
   - "In your cart" reminders
   - "Others are viewing" messages
   - "Popular right now" claims
   - "Trending" indicators
   - "X others bought" notifications

4. **Misdirection**
   - "Recommended" options
   - "Most popular choice" suggestions
   - "Best value" claims
   - "Premium option" highlights
   - "Handpicked for you" recommendations
   - "Exclusive deal" promotions

5. **FOMO (Fear Of Missing Out)**
   - "Join X others" prompts
   - "Don't be left out" warnings
   - "Exclusive access" offers
   - "Limited membership" claims
   - "VIP only" restrictions
   - "Join the waitlist" prompts

## How It Works

The script:
1. Scans webpage text for common dark pattern phrases
2. Highlights suspicious content with a red border and light red background
3. Shows tooltips on hover explaining the potential dark pattern type
4. Continuously monitors for new content being added to the page
5. Uses performance optimizations to handle dynamic content efficiently

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click [dark-pattern-detector.js](dark-pattern-detector.js)
3. Click "Install" when Tampermonkey opens the install page

## Testing

You can test this userscript on various websites known for using dark patterns or the [test.html](test.html):


---
@author Mitul Patel