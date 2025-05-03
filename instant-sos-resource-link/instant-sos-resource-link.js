// ==UserScript==
// @name         Instant SOS Resource Link
// @namespace    https://example.com/
// @version      1.0
// @description  Alerts users typing or viewing distress phrases with a discreet mental health resource link before allowing further scrolling.
// @author       Mitul Patel
// @match        https://www.facebook.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // TODO: use an dictionary API to get this list of distress phrases
  const distressPatterns = [
    /i\s*can('?t| not)\s*go\s*on\b/i,
    /\bworthless\b/i,
    /\bi\s+want\s+to\s+die\b/i,
    /\bkill\s+myself\b/i,
    /\bi\s+hate\s+myself\b/i,
    /\bi\s+can't\s+keep\s+going\b/i,
    /\bno\s+reason\s+to\s+live\b/i,
  ];

  let overlayShown = false;

  function showSOSOverlay() {
    if (overlayShown) return;
    overlayShown = true;

    document.body.style.overflow = "hidden";

    const overlay = document.createElement("div");
    overlay.id = "sos-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      background: "#f8d7da",
      color: "#721c24",
      padding: "12px",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      fontSize: "16px",
      zIndex: "999999",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    });

    overlay.innerHTML = `
            <span>
                It seems like you might be in distress. You’re not alone—if you need help, call <strong>988</strong> (U.S.) or visit 
                <a href="https://988lifeline.org" target="_blank" style="color: #721c24; text-decoration: underline;">988 Lifeline</a>.
            </span>
            <button id="sos-close-btn" style="
                margin-left: 16px;
                background: #721c24;
                color: white;
                border: none;
                padding: 6px 12px;
                font-size: 14px;
                cursor: pointer;
                border-radius: 4px;
            ">Close</button>
        `;

    document.documentElement.appendChild(overlay);

    document.getElementById("sos-close-btn").addEventListener("click", () => {
      overlay.remove();
      document.body.style.overflow = "";
    });
  }

  function containsDistress(text) {
    return distressPatterns.some((regex) => regex.test(text));
  }

  document.addEventListener(
    "keyup",
    (e) => {
      const el = e.target;
      if (
        !overlayShown &&
        (el.tagName === "TEXTAREA" ||
          (el.tagName === "INPUT" && el.type === "text"))
      ) {
        const value = el.value;
        if (value && containsDistress(value)) {
          showSOSOverlay();
        }
      }
    },
    true
  );

  window.addEventListener("scroll", () => {
    if (overlayShown) return;
    const inputs = Array.from(
      document.querySelectorAll('textarea, input[type="text"]')
    );
    for (const input of inputs) {
      if (input.value && containsDistress(input.value)) {
        showSOSOverlay();
        break;
      }
    }
  });
})();
