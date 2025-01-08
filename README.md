# Userscripts Collection

A collection of useful browser userscripts that enhance web browsing experience. These scripts are designed to work with Tampermonkey, a popular userscript manager.

## What is Tampermonkey?

Tampermonkey is a popular userscript manager available as a browser extension for Chrome, Firefox, Safari, Opera, and other browsers. It allows you to:

- Install and manage userscripts
- Run custom JavaScript code on specific websites
- Enhance website functionality
- Automate browser tasks
- Modify website appearance and behavior

## Installation

### 1. Install Tampermonkey

First, install the Tampermonkey extension for your browser:
- [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Safari Extension](https://apps.apple.com/app/tampermonkey/id1482490089)

### 2. Install Scripts

To install any of the userscripts from this collection:

1. Click on the script's `.user.js` file in the respective directory
2. Click the "Raw" button on GitHub
3. Tampermonkey will automatically detect the userscript and prompt you to install it
4. Click "Install" in the Tampermonkey prompt

## Local Development

To develop or modify these scripts locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/bittricky/userscripts.git
   cd userscripts
   ```

2. Enable Tampermonkey's local file access:
   - Open Tampermonkey's dashboard
   - Go to Settings
   - Set "Config Mode" to "Advanced"
   - Under "Security", enable "Allow local file access"

3. Load the script in Tampermonkey:
   - Create a new script in Tampermonkey
   - Copy the content of the local `.user.js` file
   - Save the script

4. For development:
   - Edit the scripts using your preferred code editor
   - Use browser developer tools (F12) for debugging
   - Reload the target webpage to test changes


## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have suggestions:
1. Open an issue in the GitHub repository
2. Provide detailed information about the problem
3. Include steps to reproduce the issue

---
@author Mitul Patel
