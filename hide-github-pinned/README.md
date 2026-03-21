# GitHub Pinned Items Activity

A simple userscript that completely hides the pinned items section on GitHub profile pages.

## Overview

This userscript removes the pinned items/repositories section from GitHub profiles, providing a cleaner, more focused interface. It can be an interesting experience for users who want to view GitHub profiles without the visual indicator of their pinned activities.

## Installation

1. Install a userscript manager
2. Click [here](https://raw.githubusercontent.com/bittricky/userscripts/main/hide-github-pinned/hide-github-pinned.js) to install the script
3. Visit any GitHub profile page to see the script in action

## Technical Documentation

### How It Works

#### CSS Injection

The script uses CSS injection to hide pinned item elements on GitHub profile pages:

```javascript
function addStyle(css) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
```

This function creates a new `<style>` element and appends it to the document head with the CSS content.

#### Target Selectors

The script uses CSS selectors to hide pinned item meta links:

```css
a.pinned-item-meta.Link--muted {
  display: none !important;
}
```

This targets the link elements associated with pinned repository metadata on GitHub profile pages.

#### Dynamic Content Handling

GitHub is a single-page application that loads content dynamically. To ensure the script works even after page navigation, it uses the [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver):

```javascript
const observer = new MutationObserver(() => {
  const elements = document.querySelectorAll(
    "a.pinned-item-meta.Link--muted",
  );
  elements.forEach((element) => {
    element.style.display = "none";
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
```

This observer watches for changes to the DOM and hides any newly appearing pinned item elements.
