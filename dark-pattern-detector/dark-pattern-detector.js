// ==UserScript==
// @name         Dark Pattern Detector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Detect and highlight dark patterns on websites
// @author       Mitul Patel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

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
    ],
    scarcity: [
      "only * left",
      "in high demand",
      "selling fast",
      "limited stock",
      "almost gone",
      "while supplies last",
    ],
    pressure: [
      "in your cart",
      "in your basket",
      "people are viewing",
      "recently viewed",
      "others are interested",
      "popular right now",
    ],
    misdirection: [
      "recommended",
      "most popular choice",
      "best value",
      "special offer",
    ],
  });

  function createHighlight(element, patternType) {
    element.style.backgroundColor = "#ffebee";
    element.style.border = "2px solid #ef5350";

    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
        position: absolute;
        background: #ef5350;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        display: none;
    `;
    tooltip.textContent = `Potential ${patternType} dark pattern detected`;

    element.addEventListener("mouseenter", () => {
      const rect = element.getBoundingClientRect();
      tooltip.style.left = rect.left + "px";
      tooltip.style.top = rect.top - 30 + "px";
      tooltip.style.display = "block";
    });

    element.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    document.body.appendChild(tooltip);
  }

  function scanForDarkPatterns() {
    const textNodes = document.evaluate(
      "//text()",
      document.body,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    for (let i = 0; i < textNodes.snapshotLength; i++) {
      const node = textNodes.snapshotItem(i);
      const text = node.textContent.toLowerCase();

      for (const [patternType, patterns] of Object.entries(darkPatterns)) {
        for (const pattern of patterns) {
          const regex = new RegExp(pattern.replace("*", "\\d+"), "i");
          if (regex.test(text)) {
            let element = node.parentElement;
            createHighlight(element, patternType);
            break;
          }
        }
      }
    }
  }

  function init() {
    scanForDarkPatterns();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          scanForDarkPatterns();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
