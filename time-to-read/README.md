# Time to Read

A userscript that estimates reading time for articles and long-form content by analyzing the word count and displaying it in a clean, non-intrusive tooltip.

## Implementation Details

### Content Detection Strategy

The userscript employs a multi-layered approach to detect article content across various websites:

1. **Domain-Specific Selectors**: First tries to match the current domain against a predefined list of popular websites with known content selectors.
   
2. **Generic Selectors**: If no domain-specific match is found, falls back to common content container selectors like `article`, `.content`, etc.

3. **Heuristic Detection**: As a final fallback, uses the `findLargestTextBlock()` function which analyzes all potential content blocks and selects the one with the most text content.

### Word Count Algorithm

To accurately count words while ignoring code, scripts, and non-content elements:

1. The script clones the detected content element to avoid modifying the original DOM.
2. Removes all `<script>`, `<style>`, `<code>`, `<pre>`, `<nav>`, `<header>`, and `<footer>` elements.
3. Extracts raw text using `textContent` or `innerText`.
4. Splits text on whitespace and filters out empty strings.
5. Returns the length of the resulting array as the word count.

### Page Type Detection

To avoid showing reading time on non-article pages, the script:

1. Maintains a list of URL patterns that typically indicate non-article pages (search pages, tag pages, etc.)
2. Checks the current URL path against these patterns
3. Only proceeds if the current page doesn't match any excluded patterns
4. Also enforces a minimum word count threshold (default: 100 words)

## Code Structure

```
(function () {
  // Configuration constants
  // Website pattern definitions
  // Main initialization function
  // Page type detection
  // Content element finder functions
  // Word counting function
  // Reading time display function
})();
```

## Customization Points

### Key Variables

- `WORDS_PER_MINUTE`: The average reading speed (default: 225 words per minute)
- `MIN_WORD_COUNT`: Minimum threshold to display reading time (default: 100 words)

### Adding Support for New Websites

To add a custom selector for a specific website, add to the `sitePatterns` array:

```javascript
{ domain: "example.com", contentSelector: ".article-content" }
```

The script will automatically try this selector when a user visits example.com.

### Visual Customization

The tooltip's appearance is controlled via inline CSS in the `displayReadingTime()` function:

- Position and size are defined in the container element's style
- Colors use a blue/yellow scheme with:
  - Royal blue (#0047AB) for primary text and icon
  - Amber yellow (#E6A817) for secondary text
  - White background (98% opacity)
  - Black close button

## Performance Considerations

1. **Content Detection Overhead**: The content detection algorithm has O(n) complexity where n is the number of potential content blocks on the page.

2. **DOM Cloning**: The word counting function clones the content DOM, which can be expensive for very large articles. However, this ensures accurate counting without modifying the page content.

3. **Script Initialization**: The script uses a small setTimeout to ensure it runs after the page is fully loaded, preventing race conditions with content loading.
