// ==UserScript==
// @name         Auto Captcha Clicker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically detects and clicks on common captcha checkboxes
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// ==/UserScript==

(function () {
  "use strict";

  const CONFIG = {
    enabled: true,
    delay: 1500,
    showNotifications: true,
    captchaSelectors: [
      ".recaptcha-checkbox-border",
      "#recaptcha-anchor",
      'iframe[src*="recaptcha/api2/anchor"]',
      '.checkbox[aria-checked="false"]',
      "#checkbox",
      'iframe[src*="hcaptcha.com/captcha"]',
      ".captcha-checkbox",
      ".captcha-check",
      '.captcha-container input[type="checkbox"]',
    ],
    blacklistedDomains: [],
  };

  GM_addStyle(`
        #auto-captcha-status {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }
        
        #auto-captcha-status.show {
            opacity: 1;
        }
        
        .auto-captcha-settings {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            padding: 20px;
            z-index: 10000;
            width: 350px;
            font-family: Arial, sans-serif;
        }
        
        .auto-captcha-settings h2 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
            color: #333;
        }
        
        .auto-captcha-settings .setting-row {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .auto-captcha-settings label {
            font-size: 14px;
            color: #555;
        }
        
        .auto-captcha-settings input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }
        
        .auto-captcha-settings input[type="number"] {
            width: 80px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .auto-captcha-settings .buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        
        .auto-captcha-settings button {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .auto-captcha-settings .save-btn {
            background: #4a90e2;
            color: white;
        }
        
        .auto-captcha-settings .cancel-btn {
            background: #f5f5f5;
            color: #333;
        }
        
        .auto-captcha-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        }
    `);

  function loadConfig() {
    const savedConfig = GM_getValue("autoCaptchaConfig", null);
    if (savedConfig) {
      Object.assign(CONFIG, JSON.parse(savedConfig));
    }
  }

  function saveConfig() {
    GM_setValue(
      "autoCaptchaConfig",
      JSON.stringify({
        enabled: CONFIG.enabled,
        delay: CONFIG.delay,
        showNotifications: CONFIG.showNotifications,
        blacklistedDomains: CONFIG.blacklistedDomains,
      })
    );
  }

  function showNotification(message) {
    if (!CONFIG.showNotifications) return;

    if (typeof GM_notification === "function") {
      GM_notification({
        text: message,
        title: "Auto Captcha Clicker",
        timeout: 3000,
      });
    } else {
      showStatusIndicator(message);
    }
  }

  function showStatusIndicator(message) {
    let indicator = document.getElementById("auto-captcha-status");

    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "auto-captcha-status";
      document.body.appendChild(indicator);
    }

    indicator.textContent = message;
    indicator.classList.add("show");

    setTimeout(() => {
      indicator.classList.remove("show");
    }, 3000);
  }

  function isDomainBlacklisted() {
    const currentDomain = window.location.hostname;
    return CONFIG.blacklistedDomains.includes(currentDomain);
  }

  function findAndClickCaptcha() {
    if (!CONFIG.enabled || isDomainBlacklisted()) return;

    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      try {
        const iframeContent =
          iframe.contentDocument || iframe.contentWindow.document;
        findCaptchaInDocument(iframeContent, iframe.src);
      } catch (e) {}
    });

    findCaptchaInDocument(document, window.location.href);
  }

  function findCaptchaInDocument(doc, url) {
    for (const selector of CONFIG.captchaSelectors) {
      const elements = doc.querySelectorAll(selector);

      for (const element of elements) {
        if (isVisibleElement(element) && !element.dataset.autoCaptchaClicked) {
          element.dataset.autoCaptchaClicked = "true";

          setTimeout(() => {
            try {
              element.click();
              showNotification("Captcha clicked");
              console.log(
                "Auto Captcha Clicker: Clicked captcha",
                selector,
                url
              );
            } catch (e) {
              console.error("Auto Captcha Clicker: Error clicking captcha", e);
            }
          }, CONFIG.delay);

          return true;
        }
      }
    }

    return false;
  }

  function isVisibleElement(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  function showSettings() {
    const overlay = document.createElement("div");
    overlay.className = "auto-captcha-overlay";
    document.body.appendChild(overlay);

    const panel = document.createElement("div");
    panel.className = "auto-captcha-settings";

    panel.innerHTML = `
            <h2>Auto Captcha Clicker Settings</h2>
            
            <div class="setting-row">
                <label for="auto-captcha-enabled">Enable Auto Clicking</label>
                <input type="checkbox" id="auto-captcha-enabled" ${
                  CONFIG.enabled ? "checked" : ""
                }>
            </div>
            
            <div class="setting-row">
                <label for="auto-captcha-delay">Delay before clicking (ms)</label>
                <input type="number" id="auto-captcha-delay" min="500" max="5000" value="${
                  CONFIG.delay
                }">
            </div>
            
            <div class="setting-row">
                <label for="auto-captcha-notifications">Show Notifications</label>
                <input type="checkbox" id="auto-captcha-notifications" ${
                  CONFIG.showNotifications ? "checked" : ""
                }>
            </div>
            
            <div class="setting-row">
                <label>Current Domain: ${window.location.hostname}</label>
                <button id="auto-captcha-toggle-blacklist" class="toggle-btn">
                    ${
                      isDomainBlacklisted()
                        ? "Remove from Blacklist"
                        : "Add to Blacklist"
                    }
                </button>
            </div>
            
            <div class="buttons">
                <button class="cancel-btn" id="auto-captcha-cancel">Cancel</button>
                <button class="save-btn" id="auto-captcha-save">Save</button>
            </div>
        `;

    document.body.appendChild(panel);

    document
      .getElementById("auto-captcha-cancel")
      .addEventListener("click", () => {
        overlay.remove();
        panel.remove();
      });

    document
      .getElementById("auto-captcha-save")
      .addEventListener("click", () => {
        CONFIG.enabled = document.getElementById(
          "auto-captcha-enabled"
        ).checked;
        CONFIG.delay =
          parseInt(document.getElementById("auto-captcha-delay").value, 10) ||
          1500;
        CONFIG.showNotifications = document.getElementById(
          "auto-captcha-notifications"
        ).checked;

        saveConfig();
        showNotification("Settings saved");

        overlay.remove();
        panel.remove();
      });

    document
      .getElementById("auto-captcha-toggle-blacklist")
      .addEventListener("click", () => {
        const currentDomain = window.location.hostname;
        const index = CONFIG.blacklistedDomains.indexOf(currentDomain);

        if (index === -1) {
          CONFIG.blacklistedDomains.push(currentDomain);
          document.getElementById("auto-captcha-toggle-blacklist").textContent =
            "Remove from Blacklist";
        } else {
          CONFIG.blacklistedDomains.splice(index, 1);
          document.getElementById("auto-captcha-toggle-blacklist").textContent =
            "Add to Blacklist";
        }
      });
  }

  function init() {
    loadConfig();

    GM_registerMenuCommand("Auto Captcha Settings", showSettings);
    GM_registerMenuCommand("Toggle Auto Captcha", () => {
      CONFIG.enabled = !CONFIG.enabled;
      saveConfig();
      showNotification(
        `Auto Captcha ${CONFIG.enabled ? "Enabled" : "Disabled"}`
      );
    });

    const observer = new MutationObserver((mutations) => {
      findAndClickCaptcha();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(findAndClickCaptcha, 1000);

    setInterval(findAndClickCaptcha, 3000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
