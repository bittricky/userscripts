// ==UserScript==
// @name         Night Mode Toggle
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a night mode toggle button to websites
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/solid.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/fontawesome.min.js
// ==/UserScript==

(function () {
  "use strict";

  const moonIcon = `<svg class="svg-inline--fa fa-moon" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="moon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path></svg>`;

  const sunIcon = `<svg class="svg-inline--fa fa-sun" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sun" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"></path></svg>`;

  const toggleButton = document.createElement("button");
  toggleButton.innerHTML = moonIcon;
  toggleButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        width: 50px;
        height: 50px;
        border-radius: 25px;
        border: none;
        background: #333;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        padding: 0;
    `;

  const iconStyle = `
        .svg-inline--fa {
            width: 24px;
            height: 24px;
            transition: transform 0.3s ease;
        }
    `;

  const iconStyleElement = document.createElement("style");
  iconStyleElement.textContent = iconStyle;
  document.head.appendChild(iconStyleElement);

  const nightModeStyles = `
        body, div, section, article, nav, header, footer {
            background-color: #1a1a1a !important;
            color: #e0e0e0 !important;
        }

        a {
            color: #80b3ff !important;
        }

        input, textarea, select {
            background-color: #2d2d2d !important;
            color: #e0e0e0 !important;
            border-color: #404040 !important;
        }

        img, video {
            filter: brightness(0.8) !important;
        }

        /* Preserve white backgrounds for specific elements */
        [class*="logo"], [id*="logo"], [class*="brand"], [id*="brand"] {
            filter: brightness(0.9) !important;
        }
    `;

  const styleElement = document.createElement("style");
  styleElement.id = "night-mode-styles";

  let isNightMode = GM_getValue("nightMode", false);

  function toggleNightMode() {
    isNightMode = !isNightMode;
    GM_setValue("nightMode", isNightMode);

    if (isNightMode) {
      styleElement.textContent = nightModeStyles;
      toggleButton.innerHTML = sunIcon;
      toggleButton.style.background = "#666";
    } else {
      styleElement.textContent = "";
      toggleButton.innerHTML = moonIcon;
      toggleButton.style.background = "#333";
    }
  }

  if (isNightMode) {
    styleElement.textContent = nightModeStyles;
    toggleButton.innerHTML = sunIcon;
    toggleButton.style.background = "#666";
  }

  toggleButton.addEventListener("click", toggleNightMode);

  document.head.appendChild(styleElement);
  document.body.appendChild(toggleButton);

  toggleButton.addEventListener("mouseover", () => {
    toggleButton.style.transform = "scale(1.1)";
    toggleButton.querySelector(".svg-inline--fa").style.transform =
      "scale(1.1)";
  });

  toggleButton.addEventListener("mouseout", () => {
    toggleButton.style.transform = "scale(1)";
    toggleButton.querySelector(".svg-inline--fa").style.transform = "scale(1)";
  });
})();
