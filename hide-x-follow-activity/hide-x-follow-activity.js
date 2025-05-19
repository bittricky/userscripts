// ==UserScript==
// @name         X (Twitter) Hide Follower Activity
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Completely hides the followers and following counts on X (Twitter) profiles
// @author       Mitul Patel
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function addStyle(css) {
    const style = document.createElement("style");
    style.setAttribute("data-x-follower-hider", "true");
    style.textContent = css;
    document.head.appendChild(style);
  }

  const hideFollowersCss = `
    /* Hide following and followers links on X profiles */
    a[href$="/following"],
    a[href$="/followers"],
    a[href*="/verified_followers"],
    /* Hide the entire container if needed */
    div.r-13awgt0.r-18u37iz.r-1w6e6rj {
      display: none !important;
    }
  `;

  addStyle(hideFollowersCss);

  const observer = new MutationObserver(() => {
    if (!document.querySelector("style[data-x-follower-hider]")) {
      addStyle(hideFollowersCss);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
