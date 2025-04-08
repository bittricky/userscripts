// ==UserScript==
// @name         Data Tracker Visibility
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Identify and highlight data trackers on websites
// @author       Mitul Patel
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  ("use strict");

  const hiddenEyeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="16" height="16" fill="currentColor"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"/></svg>`;

  const visibleEyeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="16" fill="currentColor"><path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"/></svg>`;

  const caretDownSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="caret-icon"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 306.7 54.6 201.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128z"/></svg>`;

  const caretUpSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="caret-icon"><path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 205.3 265.4 310.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128z"/></svg>`;

  const crossSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16" height="16" fill="currentColor"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;

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
      overflow: hidden;
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
    
    /* Hide border when panel is collapsed */
    #tracker-panel.collapsed #tracker-panel-header {
      border-bottom: none;
      border-radius: 12px;
    }

    #tracker-panel-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    #tracker-panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .caret-icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
      color: #4a5568;
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
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    
    /* Hide tracker buttons when panel is collapsed */
    #tracker-panel.collapsed .tracker-buttons {
      display: none;
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
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tracker-button:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }
    
    .tracker-button-icon {
      background: transparent;
      border: none;
      color: #718096;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .tracker-button-icon:hover {
      background: rgba(0,0,0,0.05);
    }
    
    .tracker-button-icon svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
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

  let trackerHighlightingEnabled = true;
  let panelBodyVisible = true;
  let highlightedElements = [];

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

  function toggleHighlighting() {
    trackerHighlightingEnabled = !trackerHighlightingEnabled;
    highlightedElements.forEach((el) => {
      if (trackerHighlightingEnabled) {
        el.classList.add("highlighted-element");
      } else {
        el.classList.remove("highlighted-element");
      }
    });

    return trackerHighlightingEnabled;
  }

  function togglePanelBodyVisibility() {
    const body = document.getElementById("tracker-panel-body");
    if (body) {
      panelBodyVisible = !panelBodyVisible;
      body.style.display = panelBodyVisible ? "block" : "none";
    }
    return panelBodyVisible;
  }

  function createTrackerPanel() {
    const panel = document.createElement("div");
    panel.id = "tracker-panel";

    const header = document.createElement("div");
    header.id = "tracker-panel-header";

    const headerLeft = document.createElement("div");
    headerLeft.id = "tracker-panel-header-left";

    const caretIndicator = document.createElement("div");
    caretIndicator.innerHTML = caretDownSvg;
    caretIndicator.className = "caret-indicator";
    headerLeft.appendChild(caretIndicator);

    const title = document.createElement("h3");
    title.textContent = "Data Trackers";
    headerLeft.appendChild(title);

    const count = document.createElement("span");
    count.className = "tracker-count";
    const totalTrackers = Object.values(detectedTrackers).reduce(
      (acc, val) => acc + val.length,
      0
    );
    count.textContent = totalTrackers;
    headerLeft.appendChild(count);

    const closeBtn = document.createElement("button");
    closeBtn.className = "tracker-button-icon";
    closeBtn.title = "Close panel";
    closeBtn.innerHTML = crossSvg;

    closeBtn.onclick = function (e) {
      e.stopPropagation();
      panel.remove();
    };

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);
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

    const toggleHighlightBtn = document.createElement("button");
    toggleHighlightBtn.className = "tracker-button";
    toggleHighlightBtn.innerHTML = trackerHighlightingEnabled
      ? visibleEyeSvg
      : hiddenEyeSvg;
    toggleHighlightBtn.title = "Toggle tracker highlighting";
    toggleHighlightBtn.onclick = function (e) {
      e.stopPropagation();
      const isVisible = toggleHighlighting();
      toggleHighlightBtn.innerHTML = isVisible ? visibleEyeSvg : hiddenEyeSvg;
    };

    buttons.appendChild(toggleHighlightBtn);
    panel.appendChild(buttons);

    header.onclick = function (e) {
      if (!closeBtn.contains(e.target)) {
        const isVisible = togglePanelBodyVisibility();

        caretIndicator.innerHTML = isVisible ? caretDownSvg : caretUpSvg;

        if (isVisible) {
          panel.classList.remove("collapsed");
        } else {
          panel.classList.add("collapsed");
        }
      }
    };

    document.body.appendChild(panel);
  }

  function togglePanelBodyVisibility() {
    const body = document.getElementById("tracker-panel-body");
    const buttons = document.querySelector(".tracker-buttons");

    if (body) {
      panelBodyVisible = !panelBodyVisible;
      body.style.display = panelBodyVisible ? "block" : "none";

      if (buttons) {
        buttons.style.display = panelBodyVisible ? "flex" : "none";
      }
    }
    return panelBodyVisible;
  }

  function togglePanelBodyVisibility() {
    const body = document.getElementById("tracker-panel-body");
    const buttons = document.querySelector(".tracker-buttons");

    if (body) {
      panelBodyVisible = !panelBodyVisible;
      body.style.display = panelBodyVisible ? "block" : "none";

      if (buttons) {
        buttons.style.display = panelBodyVisible ? "flex" : "none";
      }
    }
    return panelBodyVisible;
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
