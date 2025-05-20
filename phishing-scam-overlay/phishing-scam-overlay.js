// ==UserScript==
// @name         Crypto Phishing & Scam Alert Overlay
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Warns you if you visit a known crypto-phishing or scam site using PhishTank API
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      checkurl.phishtank.com
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const PHISHTANK_API_URL = "https://checkurl.phishtank.com/checkurl/";

  // User configurable settings
  const USER_CONFIG = {
    // Note:
    // PhishTank API key - users can set this in the script settings
    // Or by using the configuration UI
    apiKey: GM_getValue("phishtank_api_key", ""),
  };

  if (
    window.location.protocol === "https:" &&
    (window.location.hostname === "tampermonkey.net" ||
      window.location.hostname === "greasyfork.org")
  ) {
    addConfigUI();
  } else {
    checkCurrentUrl();
  }

  function addConfigUI() {
    const configDiv = document.createElement("div");
    configDiv.style.margin = "20px";
    configDiv.style.padding = "15px";
    configDiv.style.border = "1px solid #ccc";
    configDiv.style.borderRadius = "5px";
    configDiv.style.backgroundColor = "#f9f9f9";

    const heading = document.createElement("h2");
    heading.textContent = "Phishing Scam Overlay Configuration";
    heading.style.marginTop = "0";

    const apiKeyLabel = document.createElement("label");
    apiKeyLabel.textContent = "PhishTank API Key: ";
    apiKeyLabel.style.display = "block";
    apiKeyLabel.style.marginBottom = "5px";
    apiKeyLabel.style.fontWeight = "bold";

    const apiKeyInput = document.createElement("input");
    apiKeyInput.type = "text";
    apiKeyInput.value = USER_CONFIG.apiKey;
    apiKeyInput.placeholder = "Enter your PhishTank API key here";
    apiKeyInput.style.width = "100%";
    apiKeyInput.style.padding = "5px";
    apiKeyInput.style.marginBottom = "10px";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save Configuration";
    saveButton.style.padding = "8px 15px";
    saveButton.style.backgroundColor = "#4CAF50";
    saveButton.style.color = "white";
    saveButton.style.border = "none";
    saveButton.style.borderRadius = "4px";
    saveButton.style.cursor = "pointer";

    saveButton.addEventListener("click", function () {
      GM_setValue("phishtank_api_key", apiKeyInput.value);
      alert("Configuration saved!");
    });

    const note = document.createElement("p");
    note.textContent =
      "Note: You can get a free PhishTank API key by registering at https://www.phishtank.com/";
    note.style.marginTop = "10px";
    note.style.fontSize = "0.9em";
    note.style.color = "#666";

    configDiv.appendChild(heading);
    configDiv.appendChild(apiKeyLabel);
    configDiv.appendChild(apiKeyInput);
    configDiv.appendChild(saveButton);
    configDiv.appendChild(note);

    document.body.insertBefore(configDiv, document.body.firstChild);
  }

  function checkCurrentUrl() {
    const currentUrl = encodeURIComponent(window.location.href);

    const formData = new FormData();
    formData.append("url", currentUrl);
    formData.append("format", "json");

    if (USER_CONFIG.apiKey) {
      formData.append("api_key", USER_CONFIG.apiKey);
    }

    GM_xmlhttpRequest({
      method: "POST",
      url: PHISHTANK_API_URL,
      data: formData,
      headers: {
        "User-Agent": "PhishingScamOverlay/0.2",
        Accept: "application/json",
      },
      onload: function (response) {
        try {
          const data = JSON.parse(response.responseText);

          if (data.results && data.results.in_database && data.results.valid) {
            showWarningBanner(
              window.location.hostname,
              data.results.phish_detail_url
            );
            blockFormSubmissions();
          }
        } catch (error) {
          console.error("Error parsing PhishTank API response:", error);
        }
      },
      onerror: function (error) {
        console.error("Error making request to PhishTank API:", error);
      },
    });
  }

  function showWarningBanner(domain, detailUrl) {
    if (
      document.readyState !== "complete" &&
      document.readyState !== "interactive"
    ) {
      document.addEventListener("DOMContentLoaded", () =>
        showWarningBanner(domain, detailUrl)
      );
      return;
    }

    const banner = document.createElement("div");
    Object.assign(banner.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      backgroundColor: "#000",
      color: "#fff",
      padding: "15px",
      boxSizing: "border-box",
      zIndex: "999999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "3px solid #ff0000",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
    });

    const messageContainer = document.createElement("div");
    messageContainer.style.display = "flex";
    messageContainer.style.alignItems = "center";
    messageContainer.style.flex = "1";

    const warningIcon = document.createElement("span");
    warningIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ff0000"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;
    warningIcon.style.marginRight = "10px";

    const warningText = document.createElement("div");
    warningText.innerHTML = `<strong>WARNING:</strong> The domain "${domain}" has been identified as a potential phishing site. <a href="${detailUrl}" target="_blank" style="color:#ff6666;text-decoration:underline;">View details</a>`;

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ffffff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`;

    Object.assign(closeButton.style, {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "10px",
    });

    closeButton.addEventListener("click", () => {
      banner.style.display = "none";
    });

    messageContainer.appendChild(warningIcon);
    messageContainer.appendChild(warningText);
    banner.appendChild(messageContainer);
    banner.appendChild(closeButton);

    document.body.insertBefore(banner, document.body.firstChild);

    const bannerHeight = banner.offsetHeight;
    document.body.style.marginTop = `${bannerHeight}px`;
  }

  function blockFormSubmissions() {
    if (
      document.readyState !== "complete" &&
      document.readyState !== "interactive"
    ) {
      document.addEventListener("DOMContentLoaded", blockFormSubmissions);
      return;
    }

    document.addEventListener(
      "submit",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert(
          "Form submission blocked - this site has been identified as a potential phishing site."
        );
        return false;
      },
      true
    );

    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      form.style.border = "2px solid #ff0000";
      form.style.padding = "10px";

      const warningMsg = document.createElement("div");
      warningMsg.textContent =
        "Form submissions are blocked on this site due to phishing concerns.";
      warningMsg.style.color = "#ff0000";
      warningMsg.style.fontWeight = "bold";
      warningMsg.style.marginBottom = "10px";
      form.insertBefore(warningMsg, form.firstChild);

      const formElements = form.querySelectorAll(
        "input, button, select, textarea"
      );
      formElements.forEach((el) => {
        el.disabled = true;
        el.style.opacity = "0.7";
      });
    });
  }
})();
