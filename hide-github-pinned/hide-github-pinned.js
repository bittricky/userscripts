// ==UserScript==
// @name         GitHub Pinned Items Activity
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Completely hides the pinned items section on GitHub profiles
// @author       Mitul Patel
// @match        https://github.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function addStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  const hideStarsCss = `
    /* Hide the pinned items activity section */
    a.pinned-item-meta.Link--muted{
      display: none !important;
    }
  `;

  addStyle(hideStarsCss);

  const observer = new MutationObserver(() => {
    const elements = document.querySelectorAll(
      "a.pinned-item-meta.Link--muted",
    );
    elements.forEach((element) => {
      element.style.display = "none";
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
