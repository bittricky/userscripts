# LinkedIn Hide Follower Activity

A simple userscript that completely hides the followers and connections counts on LinkedIn profiles.

## Features

- Hides the followers count on all LinkedIn profiles
- Hides the connections count on all LinkedIn profiles
- Works on your own profile and other users' profiles
- Automatically applies to dynamically loaded content

## Installation

1. Install a userscript manager extension for your browser:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox)
   - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)

2. Click on this link to install the script: [Install LinkedIn Hide Follower Activity](https://github.com/yourusername/userscripts/raw/main/hide-linkedin-follow-activity/hide-linkedin-follow-activity.js) (update with your actual GitHub URL)

   Alternatively, you can manually install the script:
   - Open your userscript manager dashboard
   - Create a new script
   - Copy and paste the contents of `hide-linkedin-follow-activity.js`
   - Save the script

## Usage

Once installed, simply browse to any LinkedIn profile. The followers and connections counts will be automatically hidden.

No configuration is necessary, and there are no user-facing controls. The script works automatically in the background.

## Why Hide Follower Counts?

Hiding follower and connection counts can provide several benefits:

- Reduces social comparison and status anxiety
- Creates a more content-focused experience
- Helps evaluate content based on its merit rather than the creator's popularity
- Provides a cleaner, less cluttered profile view

## Technical Details

The script works by injecting CSS that targets the specific elements containing follower and connection information on LinkedIn profiles. It uses a MutationObserver to ensure the CSS is reapplied when the page content changes dynamically.
