// ==UserScript==
// @name         Positive Affirmations
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Display positive affirmations fetched from an open-source API that change periodically.
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      affirmations.dev
// ==/UserScript==

(function () {
  "use strict";

  const affirmationDiv = document.createElement("div");
  const contentWrapper = document.createElement("div");
  const closeButton = document.createElement("div");
  closeButton.innerHTML =
    '<svg style="width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';

  contentWrapper.style.display = "flex";
  contentWrapper.style.alignItems = "center";
  contentWrapper.style.gap = "10px";
  contentWrapper.style.padding = "12px 15px";

  closeButton.style.cursor = "pointer";
  closeButton.style.color = "#666";
  closeButton.style.transition = "color 0.2s";
  closeButton.style.display = "flex";
  closeButton.style.alignItems = "center";
  closeButton.style.justifyContent = "center";
  closeButton.addEventListener(
    "mouseover",
    () => (closeButton.style.color = "#000")
  );
  closeButton.addEventListener(
    "mouseout",
    () => (closeButton.style.color = "#666")
  );
  closeButton.addEventListener("click", () => affirmationDiv.remove());

  affirmationDiv.style.position = "fixed";
  affirmationDiv.style.top = "20px";
  affirmationDiv.style.right = "20px";
  affirmationDiv.style.backgroundColor = "#ffffff";
  affirmationDiv.style.color = "#333";
  affirmationDiv.style.borderRadius = "10px";
  affirmationDiv.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  affirmationDiv.style.zIndex = "9999";
  affirmationDiv.style.fontFamily = "Arial, sans-serif";
  affirmationDiv.style.fontSize = "14px";
  affirmationDiv.style.minWidth = "200px";
  affirmationDiv.style.maxWidth = "300px";
  affirmationDiv.style.display = "flex";
  affirmationDiv.style.flexDirection = "column";

  contentWrapper.appendChild(closeButton);
  affirmationDiv.appendChild(contentWrapper);
  document.body.appendChild(affirmationDiv);

  function fetchAffirmation() {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://www.affirmations.dev/",
      onload: function (response) {
        try {
          const data = JSON.parse(response.responseText);
          contentWrapper.textContent = data.affirmation;
          contentWrapper.appendChild(closeButton);
        } catch (e) {
          console.error("Failed to parse affirmation:", e);
          contentWrapper.textContent = "Stay positive and keep smiling!";
          contentWrapper.appendChild(closeButton);
        }
      },
      onerror: function () {
        contentWrapper.textContent =
          "Unable to fetch affirmation. Stay awesome anyway!";
        contentWrapper.appendChild(closeButton);
      },
    });
  }

  fetchAffirmation();
  setInterval(fetchAffirmation, 30000);
})();
