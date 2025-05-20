// ==UserScript==
// @name         LinkedIn Hide Follower Activity
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Completely hides the followers and connections count on LinkedIn profiles
// @author       Mitul Patel
// @match        https://www.linkedin.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function addStyle(css) {
    const style = document.createElement("style");
    style.setAttribute("data-linkedin-follower-hider", "true");
    style.textContent = css;
    document.head.appendChild(style);
  }

  const hideFollowersCss = `
    .not-first-middot {
      display: none !important;
    }
  `;

  addStyle(hideFollowersCss);

  const observer = new MutationObserver(() => {
    if (!document.querySelector("style[data-linkedin-follower-hider]")) {
      addStyle(hideFollowersCss);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
