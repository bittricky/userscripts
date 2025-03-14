// ==UserScript==
// @name         GitHub Hide Follower Activity
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Completely hides the followers and following section on GitHub profiles
// @author       Mitul Patel
// @match        https://github.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function addStyle(css) {
    const style = document.createElement("style");
    style.setAttribute("data-gh-follower-hider", "true");
    style.textContent = css;
    document.head.appendChild(style);
  }

  const hideFollowersCss = `
        /* Hide the entire div containing followers and following links */
        .mb-3 a.Link--secondary.no-underline.no-wrap[href$="tab=followers"],
        .mb-3 a.Link--secondary.no-underline.no-wrap[href$="tab=following"],
        /* Hide the dot separator between followers and following */
        .mb-3 a.Link--secondary.no-underline.no-wrap[href$="tab=followers"] + :not(a),
        /* Hide the entire container if it only contains followers/following */
        .mb-3:has(a.Link--secondary.no-underline.no-wrap[href$="tab=followers"]):not(:has(> :not(a.Link--secondary.no-underline.no-wrap[href$="tab=followers"], a.Link--secondary.no-underline.no-wrap[href$="tab=following"], :not(a)))) {
            display: none !important;
        }
    `;

  addStyle(hideFollowersCss);

  const observer = new MutationObserver(() => {
    if (!document.querySelector("style[data-gh-follower-hider]")) {
      addStyle(hideFollowersCss);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
