# GitHub Hide Follower Activity

A simple userscript that completely hides the followers and following information from GitHub profile pages when you are viewing it.

## Overview

This userscript removes all follower-related information from GitHub profiles, providing a cleaner, more focused interface. It's perfect for users who prefer to interact with GitHub purely as a code repository platform rather than as a social network.

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Click [here](https://raw.githubusercontent.com/bittricky/userscripts/main/hide-github-follow-activity/hide-github-follow-activity.js) to install the script
3. Visit any GitHub profile page to see the script in action

## Technical Documentation

### How It Works

#### CSS Injection

The script uses CSS injection to hide follower-related elements on GitHub profile pages:

```javascript
function addStyle(css) {
  const style = document.createElement("style");
  style.setAttribute("data-gh-follower-hider", "true");
  style.textContent = css;
  document.head.appendChild(style);
}
```

This function creates a new `<style>` element, sets a custom data attribute for tracking, adds the CSS content, and appends it to the document head.

#### Target Selectors

The script uses three types of CSS selectors to completely hide follower information:

1. **Direct link selectors** - Hide the follower and following links themselves:
   ```css
   .mb-3 a.Link--secondary.no-underline.no-wrap[href$="tab=followers"],
   .mb-3 a.Link--secondary.no-underline.no-wrap[href$="tab=following"]
   ```

2. **Separator selectors** - Hide the dot separator between follower metrics:
   ```css
   .mb-3 a.Link--secondary.no-underline.no-wrap[href$="tab=followers"] + :not(a)
   ```

3. **Container selectors** - Hide the entire container if it only contains follower elements:
   ```css
   .mb-3:has(a.Link--secondary.no-underline.no-wrap[href$="tab=followers"]):not(:has(> :not(a.Link--secondary.no-underline.no-wrap[href$="tab=followers"], a.Link--secondary.no-underline.no-wrap[href$="tab=following"], :not(a))))
   ```

#### Dynamic Content Handling

GitHub is a single-page application that loads content dynamically. To ensure the script works even after page navigation, it uses the [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver):

```javascript
const observer = new MutationObserver(() => {
  if (!document.querySelector("style[data-gh-follower-hider]")) {
    addStyle(hideFollowersCss);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
```

This observer watches for changes to the DOM and reapplies the CSS if the style element is removed during navigation.

### Performance Considerations

- **Efficiency**: Using CSS to hide elements is more efficient than using JavaScript to remove them from the DOM.
- **Lightweight**: The script is minimal.
- **Browser Support**: The `:has()` pseudo-class is supported in all modern browsers (Chrome 105+, Firefox 121+, Safari 15.4+).
