# Userscripts Collection

A collection of useful browser userscripts that enhance web browsing experience. These scripts are designed to work with popular userscript managers like Tampermonkey, Greasemonkey, and Violentmonkey.

## What are Userscript Managers?

Userscript managers are browser extensions that allow you to:

- Install and manage userscripts
- Run custom JavaScript code on specific websites
- Enhance website functionality
- Automate browser tasks
- Modify website appearance and behavior

Popular userscript managers include Tampermonkey, Greasemonkey (Firefox's original), and Violentmonkey (open-source alternative).

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
@author Mitul Patel
