# Quick Scroll to the Top Button

A customizable userscript that adds a sleek, animated scroll-to-top button to any webpage. The button appears when scrolling down and smoothly returns you to the top of the page when clicked.

## Features

- Smooth scrolling animation
- Customizable appearance (purple button with yellow icon)
- Responsive design
- Performance optimized with debouncing
- Works on all websites
- Accessibility-friendly with ARIA labels

## Technical Details

### Configuration

The script uses a configuration object for easy customization:

```javascript
const config = {
    scrollThreshold: 200,      // Button appears after scrolling this many pixels
    buttonSize: "50px",        // Size of the button
    buttonColor: "#8A2BE2",    // Purple background color
    buttonHoverColor: "#9B30FF", // Lighter purple on hover
    buttonPosition: {
        bottom: "20px",
        right: "20px",
    },
    transitionDuration: "0.3s", // Animation speed
    scrollBehavior: "smooth",   // Scroll animation type
    debounceDelay: 150,        // Milliseconds to wait before handling scroll events
}
```

### Performance Optimization

- **Debouncing**: Scroll events are debounced to prevent performance issues
- **CSS Transitions**: Smooth animations using CSS instead of JavaScript
- **SVG Icon**: Lightweight SVG icon instead of image or emoji
- **Event Delegation**: Efficient event handling

### Browser Compatibility

- Modern browsers: Uses native smooth scrolling
- Legacy browsers: Falls back to JavaScript-based smooth scrolling
- No external dependencies required

### Functions

1. `createScrollButton()`: Creates and styles the button element
2. `debounce(func, wait)`: Limits the rate at which a function can fire
3. `toggleButtonVisibility()`: Shows/hides button based on scroll position
4. `scrollToTop()`: Handles the smooth scrolling animation

## Installation

1. Install a userscript manager (like Tampermonkey or Greasemonkey)
2. Click [install link] or copy the script into your userscript manager
3. Enable the script and refresh your pages

## Development

To modify the script:

1. Clone the repository
2. Edit `quick-scroll.js`
3. Update the version number in the userscript metadata block
4. Test in your browser with a userscript manager