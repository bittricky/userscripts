# Auto Captcha Clicker

A userscript that automatically detects and clicks on common CAPTCHA checkboxes to save you time when browsing the web.

## Features

- Automatically detects and clicks on common CAPTCHA checkboxes
- Works with reCAPTCHA v2, hCaptcha, and other common implementations
- Configurable delay before clicking to avoid detection
- Blacklist specific domains where you don't want auto-clicking
- Toggle functionality on/off via the Tampermonkey menu
- Visual notifications when CAPTCHAs are clicked
- Comprehensive settings panel

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Create a new userscript in Tampermonkey
3. Copy the contents of `auto-captcha-clicker.js` into the editor
4. Save the script

## Usage

The script will automatically detect and click on CAPTCHA checkboxes when they appear on a page. You can:

- Access settings through the Tampermonkey menu > "Auto Captcha Settings"
- Toggle the script on/off through the Tampermonkey menu > "Toggle Auto Captcha"
- Blacklist specific domains where you don't want the script to run
- Adjust the delay before clicking (useful to avoid detection)

## Settings

The settings panel allows you to configure:

- Enable/disable automatic clicking
- Set delay before clicking (milliseconds)
- Enable/disable notifications
- Add/remove current domain from blacklist

## Permissions

The script requires the following Tampermonkey permissions:

- `GM_addStyle`: For styling the settings panel and notifications
- `GM_setValue`: For saving your configuration
- `GM_getValue`: For loading your saved configuration
- `GM_registerMenuCommand`: For adding commands to the Tampermonkey menu
- `GM_notification`: For displaying notifications

## Note on CAPTCHAs

This script is designed to help with the initial checkbox click of CAPTCHAs. It cannot solve image verification puzzles or other advanced CAPTCHA challenges. The script is intended for convenience only and should be used responsibly.

## Disclaimer

Some websites use CAPTCHAs to prevent automated access. Using this script might violate the terms of service of some websites. Use at your own discretion and responsibility.
