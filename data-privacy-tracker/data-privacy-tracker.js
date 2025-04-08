// ==UserScript==
// @name         Data Tracker Visibility
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Identify and highlight data trackers on websites
// @author       Mitul Patel
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  const config = {
    highlightTrackers: true,
    showNotification: true,
    categorizeTrackers: true,
    logToConsole: true,
  };

  const trackerPatterns = {
    analytics: [
      {
        name: "Google Analytics",
        pattern: /google-analytics\.com|ga\.js|analytics\.js|gtag/i,
      },
      { name: "Adobe Analytics", pattern: /omniture|adobe\.com\/b\/ss/i },
      { name: "Matomo/Piwik", pattern: /matomo\.js|piwik\.js/i },
      { name: "Hotjar", pattern: /hotjar\.com/i },
      { name: "Mixpanel", pattern: /mixpanel\.com|mxpnl/i },
      { name: "Segment", pattern: /segment\.com|segment\.io/i },
    ],
    advertising: [
      {
        name: "Google Ads",
        pattern:
          /doubleclick\.net|googlesyndication\.com|googleadservices\.com/i,
      },
      { name: "Facebook Ads", pattern: /facebook\.com\/tr|fbq\(/i },
      { name: "Twitter Ads", pattern: /static\.ads-twitter\.com|twq\(/i },
      { name: "Amazon Ads", pattern: /amazon-adsystem\.com/i },
      { name: "AdSense", pattern: /adsbygoogle|pagead/i },
      { name: "AppNexus", pattern: /adnxs\.com/i },
    ],
    social: [
      {
        name: "Facebook",
        pattern: /facebook\.com\/plugins|connect\.facebook\.net/i,
      },
      { name: "Twitter", pattern: /platform\.twitter\.com/i },
      { name: "LinkedIn", pattern: /platform\.linkedin\.com/i },
      { name: "Pinterest", pattern: /assets\.pinterest\.com/i },
      { name: "Instagram", pattern: /instagram\.com\/embed/i },
    ],
    other: [
      { name: "New Relic", pattern: /newrelic\.com/i },
      { name: "Optimizely", pattern: /optimizely\.com/i },
      { name: "Criteo", pattern: /criteo\.com|criteo\.net/i },
      { name: "Cloudflare", pattern: /cloudflare\.com/i },
      { name: "Intercom", pattern: /intercom\.io|intercomcdn\.com/i },
    ],
  };

  const detectedTrackers = {
    analytics: [],
    advertising: [],
    social: [],
    other: [],
  };

  const styles = `
    #tracker-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 320px;
      max-height: 600px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 15px;
      color: #1a1a1a;
      transition: all 0.2s ease;
    }

    #tracker-panel-header {
      padding: 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
    }

    #tracker-panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    #tracker-panel-body {
      padding: 16px;
      max-height: 500px;
      overflow-y: auto;
    }

    .tracker-category {
      margin-bottom: 24px;
    }

    .tracker-category h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #4a5568;
    }

    .tracker-list {
      margin: 0;
      padding: 0 0 0 20px;
      list-style-type: none;
    }

    .tracker-list li {
      color: #4a5568;
      margin-bottom: 4px;
      padding: 4px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .tracker-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #e53e3e;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 12px;
      font-weight: 500;
      margin-left: 8px;
    }

    .tracker-buttons {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .tracker-button {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tracker-button:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }

    .highlighted-element {
      outline: 2px dashed #e53e3e !important;
      background-color: rgba(229, 62, 62, 0.05) !important;
      transition: all 0.2s ease;
    }

    #tracker-panel-body::-webkit-scrollbar {
      width: 6px;
    }

    #tracker-panel-body::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    #tracker-panel-body::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }

    #tracker-panel-body::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `;

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function scanScripts() {
    const scripts = document.getElementsByTagName("script");
    for (const script of scripts) {
      const src = script.getAttribute("src") || script.textContent;
      checkTracker(src, script);
    }
  }

  function scanOtherElements() {
    const iframes = document.getElementsByTagName("iframe");
    const images = document.getElementsByTagName("img");

    [...iframes, ...images].forEach((el) => {
      const src = el.getAttribute("src");
      if (src) checkTracker(src, el);
    });
  }

  function analyzeCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      checkTracker(name, null);
    });
  }

  function checkTracker(str, element) {
    if (!str) return;

    for (const category in trackerPatterns) {
      const patterns = trackerPatterns[category];
      for (const tracker of patterns) {
        if (tracker.pattern.test(str)) {
          if (!detectedTrackers[category].includes(tracker.name)) {
            detectedTrackers[category].push(tracker.name);
            if (element && config.highlightTrackers) {
              element.classList.add("highlighted-element");
            }
            if (config.logToConsole) {
              console.log(`[Tracker Detected] ${category}: ${tracker.name}`);
            }
          }
        }
      }
    }
  }

  function createTrackerPanel() {
    const panel = document.createElement("div");
    panel.id = "tracker-panel";

    const header = document.createElement("div");
    header.id = "tracker-panel-header";

    const title = document.createElement("h3");
    title.textContent = "Data Trackers";

    const count = document.createElement("span");
    count.className = "tracker-count";
    const totalTrackers = Object.values(detectedTrackers).reduce(
      (acc, val) => acc + val.length,
      0
    );
    count.textContent = totalTrackers;

    header.appendChild(title);
    header.appendChild(count);
    panel.appendChild(header);

    const body = document.createElement("div");
    body.id = "tracker-panel-body";

    for (const category in detectedTrackers) {
      if (detectedTrackers[category].length > 0) {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "tracker-category";

        const categoryHeader = document.createElement("h4");
        const categoryName =
          category.charAt(0).toUpperCase() + category.slice(1);
        categoryHeader.textContent = `${categoryName} (${detectedTrackers[category].length})`;
        categoryDiv.appendChild(categoryHeader);

        const list = document.createElement("ul");
        list.className = "tracker-list";

        detectedTrackers[category].forEach((tracker) => {
          const item = document.createElement("li");
          item.textContent = tracker;
          list.appendChild(item);
        });

        categoryDiv.appendChild(list);
        body.appendChild(categoryDiv);
      }
    }

    panel.appendChild(body);

    const buttons = document.createElement("div");
    buttons.className = "tracker-buttons";

    const hideButton = document.createElement("button");
    hideButton.className = "tracker-button";
    hideButton.textContent = "Close";
    hideButton.onclick = function () {
      panel.style.display = "none";
    };

    const toggleHighlightButton = document.createElement("button");
    toggleHighlightButton.className = "tracker-button";
    toggleHighlightButton.textContent = config.highlightTrackers
      ? "Hide Highlights"
      : "Show Highlights";
    toggleHighlightButton.onclick = function () {
      config.highlightTrackers = !config.highlightTrackers;
      toggleHighlightButton.textContent = config.highlightTrackers
        ? "Hide Highlights"
        : "Show Highlights";

      const highlightedElements = document.querySelectorAll(
        ".highlighted-element"
      );
      highlightedElements.forEach((el) => {
        if (config.highlightTrackers) {
          el.classList.add("highlighted-element");
        } else {
          el.classList.remove("highlighted-element");
        }
      });
    };

    buttons.appendChild(toggleHighlightButton);
    buttons.appendChild(hideButton);
    panel.appendChild(buttons);

    header.onclick = function (e) {
      if (e.target !== toggleHighlightButton && e.target !== hideButton) {
        body.style.display = body.style.display === "none" ? "block" : "none";
      }
    };

    document.body.appendChild(panel);
  }

  function initialize() {
    addStyles();
    scanScripts();
    scanOtherElements();
    analyzeCookies();

    const totalTrackers = Object.values(detectedTrackers).reduce(
      (acc, val) => acc + val.length,
      0
    );
    if (totalTrackers > 0) {
      createTrackerPanel();
    }
  }

  window.addEventListener("load", function () {
    setTimeout(initialize, 1000);
  });
})();
