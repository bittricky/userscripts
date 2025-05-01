# Subscription Article Archive Check

A userscript that automatically checks if articles behind paywalls are available on [Archive.is](https://archive.is) and provides a convenient notification with a direct link to the archived version.

## Features

- **Universal Website Compatibility**: Works on any website with paywalled content
- **Automatic Detection**: Silently checks if the current page is available on [Archive.is](https://archive.is)
- **Elegant Notification**: Shows a clean, modern notification only when an archived version is available
- **Direct Access**: One-click access to the archived version of the article
- **Non-Intrusive**: Only appears when an archive is actually available
- **Lightweight**: Minimal performance impact on browsing experience

## Installation

### Prerequisites

You need a userscript manager extension installed in your browser:

- **For Chrome**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **For Firefox**: [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **For Safari**: [Tampermonkey](https://apps.apple.com/app/tampermonkey/id1482490089)
- **For Edge**: [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### Installing the Userscript

1. Ensure you have a userscript manager installed (see above)
2. Create a new script in your userscript manager and copy-paste the code from `article-archive-check.js`
3. Your userscript manager should prompt you to install the script
4. Click "Install" or "OK" to confirm

## Usage

Once installed, the userscript works automatically:

1. Browse the web normally
2. When you encounter a paywalled article, the script silently checks if it's available on [Archive.is](https://archive.is)
3. If an archived version is available, a notification appears in the top-right corner of your browser
4. Click the "Archive.is" link in the notification to view the archived version
5. The notification can be dismissed by clicking the X button

## How It Works

The userscript uses a technique to check if a page is archived without running into CORS (Cross-Origin Resource Sharing) issues:

1. When you visit any webpage, the script captures the current URL
2. It attempts to load a tiny image (favicon) from [Archive.is](https://archive.is) with the current URL as a parameter
3. If the image loads successfully, it indicates that Archive.is has the page archived
4. The script then displays a notification with a direct link to the archived version

This approach is more reliable than direct API calls and works around common limitations in browser security policies.

## Customization

You can customize the script by editing the following sections:

- **Notification Style**: Modify the CSS properties in the `displayArchiveLink` function
- **Timeout Duration**: Change the `5000` value in the `setTimeout` call to adjust how long the script waits for Archive.is to respond
- **Auto-dismiss**: Add a timeout to automatically remove the notification after a certain period

## Troubleshooting

### The notification doesn't appear for articles I know are archived

This could happen for several reasons:

1. **Archive.is API Changes**: The Archive.is website might have changed how their service works
2. **Network Issues**: Your connection to Archive.is might be blocked or restricted
3. **Script Conflicts**: Another extension or script might be interfering

Try checking the browser console (F12 > Console) for any error messages from the script.

### The script slows down my browsing

The script is designed to be lightweight, but if you notice performance issues:

1. Check if you have many other userscripts running simultaneously
2. Consider disabling the script on sites where you don't need it