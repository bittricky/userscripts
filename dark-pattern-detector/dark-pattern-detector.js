// ==UserScript==
// @name         Dark Pattern Detector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Detect and highlight dark patterns on websites
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  "use strict";

  // Add global styles
  GM_addStyle(`
    .dark-pattern-highlight {
      background-color: #ffebee !important;
      border: 2px solid #ef5350 !important;
      transition: all 0.2s ease-in-out;
    }
    .dark-pattern-tooltip {
      position: absolute;
      background: #ef5350;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      display: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      pointer-events: none;
    }
  `);

  const darkPatterns = Object.freeze({
    urgency: [
      "limited time",
      "ending soon",
      "only today",
      "last chance",
      "hurry",
      "expires",
      "running out",
      "few left",
      "flash sale",
      "don't miss out",
      "act fast",
    ],
    scarcity: [
      "only * left",
      "in high demand",
      "selling fast",
      "limited stock",
      "almost gone",
      "while supplies last",
      "* people bought",
      "* viewing now",
      "* in cart",
    ],
    pressure: [
      "in your cart",
      "in your basket",
      "people are viewing",
      "recently viewed",
      "others are interested",
      "popular right now",
      "trending",
      "* others bought",
    ],
    misdirection: [
      "recommended",
      "most popular choice",
      "best value",
      "special offer",
      "premium option",
      "you may also like",
      "handpicked for you",
      "exclusive deal",
    ],
    fomo: [
      "join * others",
      "don't be left out",
      "exclusive access",
      "limited membership",
      "vip only",
      "join the waitlist",
    ],
  });

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function createHighlight(element, patternType) {
    if (element.classList.contains("dark-pattern-highlight")) {
      return;
    }

    element.classList.add("dark-pattern-highlight");

    const tooltip = document.createElement("div");
    tooltip.className = "dark-pattern-tooltip";
    tooltip.textContent = `Potential ${patternType} dark pattern detected`;

    element.addEventListener("mouseenter", () => {
      const rect = element.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.top - 30}px`;
      tooltip.style.display = "block";
    });

    element.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    document.body.appendChild(tooltip);
  }

  function scanForDarkPatterns() {
    const textNodes = document.evaluate(
      "//text()[not(ancestor::script)][not(ancestor::style)][not(ancestor::noscript)]",
      document.body,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    const processedElements = new Set();

    for (let i = 0; i < textNodes.snapshotLength; i++) {
      const node = textNodes.snapshotItem(i);
      const text = node.textContent.toLowerCase().trim();

      if (!text || node.parentElement.closest(".dark-pattern-highlight")) {
        continue;
      }

      for (const [patternType, patterns] of Object.entries(darkPatterns)) {
        for (const pattern of patterns) {
          const regex = new RegExp(pattern.replace("*", "\\d+"), "i");
          if (regex.test(text) && !processedElements.has(node.parentElement)) {
            createHighlight(node.parentElement, patternType);
            processedElements.add(node.parentElement);
            break;
          }
        }
      }
    }
  }

  const debouncedScan = debounce(scanForDarkPatterns, 500);

  function init() {
    scanForDarkPatterns();

    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length || mutation.type === "characterData") {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) {
        debouncedScan();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
