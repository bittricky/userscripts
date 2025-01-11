# Link Preview on Hover

A userscript that enhances web browsing by showing preview tooltips when hovering over links. The preview includes thumbnails and titles from the linked pages.

## Features

- Instant preview tooltips on link hover
- Displays page thumbnails (when available via OpenGraph metadata)
- Shows page titles
- Smooth loading indicator
- Works on any website
- Lightweight and performant

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (recommended)
   - [Greasemonkey](https://www.greasespot.net/)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. Install this userscript by clicking [here](link-hover-preview.js)

## How It Works

The script automatically detects when you hover over any link on a webpage. It then:
1. Shows a loading indicator
2. Fetches metadata from the linked page
3. Displays a tooltip with the page's thumbnail and title

## Permissions

The script requires the following permissions:
- `GM_xmlhttpRequest`: To fetch metadata from linked pages
- `GM_addStyle`: To add custom CSS styles for the tooltip