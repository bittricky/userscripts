# Userscripts Collection

> Feel like monkeying around with the browser?

A collection of useful browser userscripts that enhance web browsing experience. These scripts are designed to work with popular userscript managers like Tampermonkey, Greasemonkey, and Violentmonkey.

## [<center> <big> <b> 🙈 🙉 🙊 </b> </big> </center>](https://en.wikipedia.org/wiki/Three_wise_monkeys)

## What is the difference between a Userscript and a Browser Extension?

Userscripts and browser extensions both enhance your browsing experience but differ in scope and implementation.
Userscripts are simple JavaScript files that run on specific web pages. They're installed through managers like Tampermonkey and are mainly limited to manipulating page content. They’re easy to create but have limited permissions.

Browser extensions, on the other hand, are comprehensive packages installed through browser stores. They can modify the browser UI, create popups, access powerful APIs, and run background processes. Extensions undergo vendor review and offer much deeper integration with the browser.

TLDR;
- Use userscripts for quick, targeted page tweaks.
- Use browser extensions for complex, browser-wide functionality.

### Quick Comparisons:

| Feature | Userscript | Browser Extension |
| --- | --- | --- |
| Scope | Per website | Full browser |
| Install Method | Through userscript manager | Browser extension store |
| APIs Available | Limited (DOM + GM_* APIs) | Full browser APIs |
| UI Capabilities | Minimal (no popup/menu) | Full UI (popup, options, etc.) |
| Complexity | Simple | Can be complex/multi-file |

## What are Userscript Managers?

Userscript managers are browser extensions that allow you to:

- Install and manage userscripts
- Run custom JavaScript code on specific websites
- Enhance website functionality
- Automate browser tasks
- Modify website appearance and behavior

Popular userscript managers include Tampermonkey, Greasemonkey (Firefox's original), and Violentmonkey (open-source alternative).

## How a Userscript Works in Practice

A userscript runs on a webpage as if it were part of the page's code. When a page loads, the userscript manager checks the page's URL against the script's `@match`/`@include` patterns. If there's a match, the script is injected into the page, and the JavaScript code runs just like any other code on the page. This allows userscripts to modify the page, add or remove features, automate tasks, or enhance privacy and security.


### Key Components and Flow:

#### 1. Userscript Structure
- **Metadata block**  
  Defines directives such as `@name`, `@match`, `@include`, `@grant`, `@run-at`, etc. These directives control when, where, and how the script runs.
- **JavaScript code block**  
  Contains the actual logic that runs on matched pages, including functions, event listeners, and DOM manipulations.

#### 2. Installation and Activation
1. Install the userscript in a manager extension (e.g. Tampermonkey, Greasemonkey).  
2. When you visit a page, the extension checks its URL against each script's `@match`/`@include` patterns.  
3. If there's a match, it injects the script into the page context, essentially merging your code with the page's JavaScript environment.
4. The userscript manager handles permissions and isolation between scripts.

#### 3. Execution Timing
Controlled by the `@run-at` directive (or defaults):
- `document-start` — Executes as soon as the document object is available, before any DOM is constructed or resources are loaded. Ideal for intercepting API calls or preventing elements from appearing.
- `document-idle` — Executes after the DOM has fully parsed but potentially before all resources have loaded (default). Best for most DOM manipulations.
- `document-end` — Executes after all resources, including images and scripts, have loaded. Good for operations that need the complete page.

#### 4. Script Functionality
Once injected, a userscript can:
- Modify page appearance (CSS tweaks, reposition elements, add custom styles).
- Add or remove UI features (buttons, panels, tooltips, notifications).
- Automate repetitive tasks (click buttons, fill forms, navigate pages).
- Enhance privacy/security (block trackers, mask data, filter content).
- Interact with external resources (fetch data from APIs, integrate services).

#### 5. Data Persistence
Userscripts can persist settings or data using:
- **Storage APIs**: `GM_setValue` / `GM_getValue` in Greasemonkey/Tampermonkey for key-value storage.
- **Browser storage**: `localStorage` or `sessionStorage` for site-specific data (requires appropriate permissions).
- **External storage**: Using APIs to store data on external services (requires network permissions).

#### 6. Debugging and Maintenance
- Use browser developer tools (F12) to debug userscripts.
- Console logs from userscripts appear in the browser's console.
- Some userscript managers provide their own debugging tools and logs.
- Scripts may need updates when websites change their structure or functionality.

## Installation

### 1. Install a Userscript Manager

First, install one of these userscript manager extensions for your browser:

Tampermonkey:
- [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Safari Extension](https://apps.apple.com/app/tampermonkey/id1482490089)

Greasemonkey:
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)

Violentmonkey:
- [Chrome Web Store](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomhiblgggliao)

### 2. Install Scripts

To install any of the userscripts from this collection:

1. Click on the script's `<script_name>.js` file in the respective directory
2. Click the "Raw" button on GitHub
3. Your userscript manager will automatically detect the userscript and prompt you to install it
4. Click "Install" in the prompt


## Local Development

To develop or modify these scripts locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/bittricky/userscripts.git
   cd userscripts
   ```

2. Enable your userscript manager's local file access:
   - Open your userscript manager's dashboard
   - Go to Settings
   - Set "Config Mode" to "Advanced" (if applicable)
   - Under "Security", enable "Allow local file access" (if applicable)

3. Load the script in your userscript manager:
   - Create a new script in your userscript manager
   - Copy the content of the local `<script_name>.js` file
   - Save the script

4. For development:
   - Edit the scripts using your preferred code editor
   - Use browser developer tools (F12) for debugging
   - Reload the target webpage to test changes

---
@author Mitul Patel | [GitHub](https://github.com/bittricky) | [Website](https://mitulpa.tel)
