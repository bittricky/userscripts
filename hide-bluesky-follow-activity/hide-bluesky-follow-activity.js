// ==UserScript==
// @name         Bluesky Hide Follower Activity
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Completely hides the followers and following counts on Bluesky profiles
// @author       Mitul Patel
// @match        https://bsky.app/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function addStyle(css) {
    const style = document.createElement("style");
    style.setAttribute("data-bsky-follower-hider", "true");
    style.textContent = css;
    document.head.appendChild(style);
  }

  const hideFollowersCss = `
    [data-testid="profileHeaderFollowersButton"],
    [data-testid="profileHeaderFollowsButton"],
    .css-g5y9jx.r-12vffkv > a + a,
    .css-g5y9jx.r-12vffkv > a ~ :not(a):not([data-testid]) {
      display: none !important;
    }

    /* Adjust spacing for the remaining elements */
    .css-g5y9jx.r-12vffkv {
      gap: 0 !important;
    }
  `;

  addStyle(hideFollowersCss);

  const observer = new MutationObserver(() => {
    if (!document.querySelector("style[data-bsky-follower-hider]")) {
      addStyle(hideFollowersCss);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
