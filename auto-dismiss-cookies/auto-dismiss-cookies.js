// ==UserScript==
// @name         Auto Dismiss Cookie/Consent Banners
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically dismisses cookie consent popups by preferring 'Reject' options
// @author       Mitul Patel
// @match        *://*/*
// @exclude      *://*.google.com/*
// @exclude      *://*.youtube.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const config = {
    initialDelay: 500,
    scanInterval: 1500,
    maxScans: 5,
    preferReject: true,
    debug: false,
  };

  const log = (...args) =>
    config.debug && console.log("[AutoDismiss]", ...args);

  const buttonPatterns = {
    reject: [
      /reject( all)?$/i,
      /decline( all)?$/i,
      /refuse$/i,
      /deny$/i,
      /disagree$/i,
      /opt[ -]?out/i,
      /no[, ]? thanks/i,
      /necessary only/i,
      /only essential/i,
      /continue without/i,
    ],
    close: [
      /^close$/i,
      /dismiss$/i,
      /^(i )?understand$/i,
      /^continue$/i,
      /^proceed$/i,
      /^skip$/i,
      /^save$/i,
      /^done$/i,
    ],
    accept: [
      /accept( all)?$/i,
      /agree( all)?$/i,
      /allow( all)?$/i,
      /consent$/i,
      /^ok(ay)?$/i,
      /^yes$/i,
      /confirm$/i,
      /^got it$/i,
    ],
  };

  const selectors = {
    overlays: [
      '[class*="cookie"]',
      '[class*="consent"]',
      '[class*="gdpr"]',
      '[class*="privacy"]',
      '[class*="banner"]',
      '[class*="notice"]',
      '[id*="cookie"]',
      '[id*="consent"]',
      '[id*="gdpr"]',
      ".cc-window",
      ".cookie-banner",
      "#cookieConsent",
      "#cookie-notice",
      "#onetrust-consent-sdk",
      "#CybotCookiebotDialog",
    ],
    closeButtons: [
      ".close-button",
      ".close-icon",
      '[aria-label="close"]',
      '[data-action="close"]',
      ".cc-dismiss",
      "#onetrust-close-btn",
      'button[class*="close"]',
      'a[class*="close"]',
    ],
    buttons:
      'button, a, input[type="button"], [role="button"], .button, [class*="btn"]',
  };

  const helpers = {
    getText: (el) => {
      let text = (el.innerText || el.textContent || el.value || "").trim();
      return text || (el.getAttribute("aria-label") || "").trim();
    },

    isVisible: (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0
      );
    },

    isCookieBanner: (el) => {
      if (!helpers.isVisible(el)) return false;

      const rect = el.getBoundingClientRect();
      const isLarge = rect.width > window.innerWidth * 0.3 && rect.height > 50;
      const isAtEdge = rect.top < 10 || rect.bottom > window.innerHeight - 10;
      const text = el.innerText || "";
      const hasCookieText = /cookie|gdpr|consent|privacy|data|tracking/i.test(
        text
      );

      return (
        (isLarge && (isAtEdge || hasCookieText)) ||
        (hasCookieText && rect.height > window.innerHeight * 0.3)
      );
    },

    click: (el) => {
      try {
        el.click();
        return true;
      } catch (e) {
        log("Click error:", e);
        return false;
      }
    },

    hide: (el) => {
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.style.opacity = "0";
      el.style.pointerEvents = "none";

      const parent = el.parentElement;
      if (parent && /modal|overlay|backdrop/i.test(parent.className)) {
        parent.style.display = "none";
      }

      if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = "auto";
        document.body.style.position = "static";
      }
    },
  };

  function findAndClickButton(container = document) {
    for (const selector of selectors.closeButtons) {
      const buttons = Array.from(container.querySelectorAll(selector));
      for (const btn of buttons) {
        if (helpers.isVisible(btn) && helpers.click(btn)) {
          log("Clicked close button:", selector);
          return true;
        }
      }
    }

    const buttons = Array.from(
      container.querySelectorAll(selectors.buttons)
    ).filter(helpers.isVisible);

    const buttonTypes = [
      config.preferReject ? "reject" : "accept",
      "close",
      config.preferReject ? "accept" : "reject",
    ];

    for (const type of buttonTypes) {
      for (const btn of buttons) {
        const text = helpers.getText(btn);
        if (
          text &&
          buttonPatterns[type].some((pattern) => pattern.test(text))
        ) {
          if (helpers.click(btn)) {
            log(`Clicked ${type} button: "${text}"`);
            return true;
          }
        }
      }
    }

    const smallButtons = buttons.filter((btn) => {
      const rect = btn.getBoundingClientRect();
      return (
        rect.width < 40 &&
        rect.height < 40 &&
        (btn.textContent === "x" ||
          btn.textContent === "×" ||
          btn.innerHTML.includes("svg"))
      );
    });

    for (const btn of smallButtons) {
      if (helpers.click(btn)) {
        log("Clicked close icon");
        return true;
      }
    }

    return false;
  }

  function dismissCookieBanners() {
    let handled = false;

    for (const selector of selectors.overlays) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (helpers.isCookieBanner(el)) {
            log("Found cookie banner:", selector);

            if (!findAndClickButton(el)) {
              helpers.hide(el);
              log("Hid cookie banner");
            }

            handled = true;
          }
        }
      } catch (e) {}
    }

    if (!handled && findAndClickButton()) {
      handled = true;
    }

    return handled;
  }

  let scanCount = 0;
  function runScans() {
    if (scanCount >= config.maxScans) return;

    scanCount++;
    log(`Scan ${scanCount}/${config.maxScans}`);

    if (dismissCookieBanners()) {
      log("Successfully handled cookie notice");
    } else if (scanCount < config.maxScans) {
      setTimeout(runScans, config.scanInterval);
    }
  }

  function initialize() {
    log("Initializing");
    setTimeout(runScans, config.initialDelay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  window.addEventListener("load", () => {
    setTimeout(runScans, 1000);
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const className = (node.className || "").toLowerCase();
            const id = (node.id || "").toLowerCase();

            if (
              /cookie|consent|gdpr|privacy|banner|notice/i.test(
                className + " " + id
              )
            ) {
              log("Detected potential cookie banner via mutation");
              dismissCookieBanners();
              break;
            }
          }
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
