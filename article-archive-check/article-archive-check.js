// ==UserScript==
// @name         Subscription Article Archive Check
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Checks if an article behind a subscription is available on Archive.is
// @author       Mitul Patel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function checkIfArchived() {
    let currentUrl = window.location.href;

    let archiveUrl = `https://archive.is/${encodeURIComponent(currentUrl)}`;

    let img = new Image();

    let timeout = setTimeout(() => {
      console.log("Archive check timed out");
      img.onload = img.onerror = null;
    }, 5000);

    img.onload = function () {
      clearTimeout(timeout);
      displayArchiveLink(archiveUrl);
    };
    img.onerror = function () {
      clearTimeout(timeout);
      console.log(
        "This article is not archived or no access to the Archive page."
      );
    };

    img.src = `https://archive.is/favicon.ico?url=${encodeURIComponent(
      currentUrl
    )}&t=${Date.now()}`;
  }

  function displayArchiveLink(url) {
    const messageBox = document.createElement("div");
    const contentWrapper = document.createElement("div");
    const closeButton = document.createElement("div");
    const messageContent = document.createElement("div");

    closeButton.innerHTML =
      '<svg style="width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';

    messageContent.innerHTML = `
      <strong style="display: block; margin-bottom: 5px; color: #e60000;">Article Available!</strong>
      <p style="margin: 0;">You can view the archived version of this article on <a href="${url}" target="_blank" style="color: #e60000; text-decoration: underline;">Archive.is</a>.</p>
    `;

    contentWrapper.style.display = "flex";
    contentWrapper.style.alignItems = "flex-start";
    contentWrapper.style.gap = "10px";
    contentWrapper.style.padding = "12px 15px";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#666";
    closeButton.style.transition = "color 0.2s";
    closeButton.style.display = "flex";
    closeButton.style.alignItems = "center";
    closeButton.style.justifyContent = "center";
    closeButton.style.marginLeft = "auto";

    closeButton.addEventListener(
      "mouseover",
      () => (closeButton.style.color = "#e60000")
    );
    closeButton.addEventListener(
      "mouseout",
      () => (closeButton.style.color = "#666")
    );

    closeButton.addEventListener("click", () => messageBox.remove());

    messageBox.style.position = "fixed";
    messageBox.style.top = "20px";
    messageBox.style.right = "20px";
    messageBox.style.backgroundColor = "#ffffff";
    messageBox.style.color = "#333";
    messageBox.style.borderRadius = "10px";
    messageBox.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    messageBox.style.zIndex = "9999";
    messageBox.style.fontFamily = "Arial, sans-serif";
    messageBox.style.fontSize = "14px";
    messageBox.style.minWidth = "200px";
    messageBox.style.maxWidth = "300px";
    messageBox.style.display = "flex";
    messageBox.style.flexDirection = "column";
    messageBox.style.border = "1px solid #e60000";

    contentWrapper.appendChild(messageContent);
    contentWrapper.appendChild(closeButton);
    messageBox.appendChild(contentWrapper);

    document.body.appendChild(messageBox);

    setTimeout(() => {
      messageBox.remove();
    }, 5000);
  }

  checkIfArchived();
})();
