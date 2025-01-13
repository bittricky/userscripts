// ==UserScript==
// @name         Carbon Footprint Tracker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Track and display the carbon footprint of your web browsing
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  ("use strict");

  const CARBON_PER_MB = 0.2; // Average carbon emissions per MB of data transfer
  const CARBON_PER_SECOND = 0.0002; // Average carbon emissions per second of browsing

  GM_addStyle(`
        #carbon-tracker {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid #eee;
            border-radius: 12px;
            padding: 14px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            z-index: 10000;
            min-width: 180px;
            transition: all 0.2s ease;
        }
        #carbon-tracker.minimized .content {
            display: none;
        }
        #carbon-tracker h3 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 500;
        }
        #carbon-tracker .content {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        #carbon-tracker .stats {
            font-size: 12px;
            color: #666;
        }
        #carbon-tracker button {
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            margin-left: auto;
        }
        #carbon-tracker button:hover {
            opacity: 0.7;
        }
        #carbon-tracker svg {
            width: 16px;
            height: 16px;
        }
        #carbon-tracker-label {
            padding-left: 5px;
            color: #000000;
        }
        .carbon-icon {
            fill: #ff4757;
        }
        .minimize-icon, .plus-icon {
            fill: #666;
        }
    `);

  const FIRE_ICON =
    '<svg class="carbon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M372.5 256.5l-.7-1.9C337.8 160.8 282 76.5 209.1 8.5l-3.3-3C202.1 2 197.1 0 192 0s-10.1 2-13.8 5.5l-3.3 3C102 76.5 46.2 160.8 12.2 254.6l-.7 1.9C3.9 277.3 0 299.4 0 321.6C0 426.7 86.8 512 192 512s192-85.3 192-190.4c0-22.2-3.9-44.2-11.5-65.1zm-90.8 49.5c4.1 9.3 6.2 19.4 6.2 29.5c0 53-43 96.5-96 96.5s-96-43.5-96-96.5c0-10.1 2.1-20.3 6.2-29.5l1.9-4.3c15.8-35.4 37.9-67.7 65.3-95.1l8.9-8.9c3.6-3.6 8.5-5.6 13.6-5.6s10 2 13.6 5.6l8.9 8.9c27.4 27.4 49.6 59.7 65.3 95.1l1.9 4.3z"/></svg>';
  const MINUS_ICON =
    '<svg class="minimize-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>';
  const PLUS_ICON =
    '<svg class="plus-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>';

  const tracker = document.createElement("div");
  tracker.id = "carbon-tracker";
  tracker.innerHTML = `
        <h3>
            <span>${FIRE_ICON}</span>
            <span id="carbon-tracker-label">Carbon Impact</span>
            <button class="minimize" title="Toggle">${MINUS_ICON}</button>
        </h3>
        <div class="content">
            <div class="stats" id="carbon">Carbon: 0g CO₂</div>
            <div class="stats" id="data-transferred">Data: 0 MB</div>
        </div>
    `;
  document.body.appendChild(tracker);

  let totalCarbon = GM_getValue("totalCarbon", 0);
  let dataTransferred = 0;
  let isMinimized = false;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "resource") {
        const size = entry.transferSize / (1024 * 1024); // Convert to MB
        dataTransferred += size;
        const carbonImpact = size * CARBON_PER_MB;
        totalCarbon += carbonImpact;
        updateDisplay();
        GM_setValue("totalCarbon", totalCarbon);
      }
    }
  });

  observer.observe({ entryTypes: ["resource"] });

  setInterval(() => {
    totalCarbon += CARBON_PER_SECOND;
    GM_setValue("totalCarbon", totalCarbon);
    updateDisplay();
  }, 1000);

  function updateDisplay() {
    document.getElementById(
      "carbon"
    ).textContent = `Carbon: ${totalCarbon.toFixed(6)}g CO₂`;
    document.getElementById(
      "data-transferred"
    ).textContent = `Data: ${dataTransferred.toFixed(2)} MB`;
  }

  document
    .querySelector("#carbon-tracker .minimize")
    .addEventListener("click", () => {
      isMinimized = !isMinimized;
      tracker.classList.toggle("minimized");
      document.querySelector("#carbon-tracker .minimize").innerHTML =
        isMinimized ? PLUS_ICON : MINUS_ICON;
    });
})();
