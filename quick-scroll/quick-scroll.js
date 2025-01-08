// ==UserScript==
// @name         Quick Scroll to the Top Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a customizable, animated scroll-to-top button with improved performance
// @author       Mitul Patel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const config = Object.freeze({
    scrollThreshold: 200,
    buttonSize: "50px",
    buttonColor: "#8A2BE2",
    buttonHoverColor: "#9B30FF",
    buttonPosition: {
      bottom: "20px",
      right: "20px",
    },
    transitionDuration: "0.3s",
    scrollBehavior: "smooth",
    debounceDelay: 150,
  });

  function createScrollButton() {
    const button = document.createElement("button");
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="fill: #FFD700; width: 30px; height: 30px;"><path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"/></svg>`;
    button.setAttribute("aria-label", "Scroll to top");
    button.setAttribute("title", "Scroll to top");

    const buttonStyles = {
      position: "fixed",
      bottom: config.buttonPosition.bottom,
      right: config.buttonPosition.right,
      width: config.buttonSize,
      height: config.buttonSize,
      border: "none",
      borderRadius: "50%",
      backgroundColor: config.buttonColor,
      color: "#fff",
      cursor: "pointer",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "999999",
      transition: `all ${config.transitionDuration} ease-in-out`,
      opacity: "0.9",
      outline: "none",
      padding: "10px",
    };

    Object.assign(button.style, buttonStyles);

    button.addEventListener("mouseenter", () => {
      button.style.backgroundColor = config.buttonHoverColor;
      button.style.opacity = "1";
      button.style.transform = "scale(1.1)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.backgroundColor = config.buttonColor;
      button.style.opacity = "0.9";
      button.style.transform = "scale(1)";
    });

    return button;
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function toggleButtonVisibility() {
    const shouldShow = window.scrollY > config.scrollThreshold;
    button.style.display = shouldShow ? "block" : "none";
    button.style.opacity = shouldShow ? "0.9" : "0";
  }

  function scrollToTop() {
    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: config.scrollBehavior,
      });
    } else {
      const scrollStep = -window.scrollY / 20;
      const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
          window.scrollBy(0, scrollStep);
        } else {
          clearInterval(scrollInterval);
        }
      }, 15);
    }
  }

  const button = createScrollButton();
  document.body.appendChild(button);

  window.addEventListener(
    "scroll",
    debounce(toggleButtonVisibility, config.debounceDelay)
  );
  button.addEventListener("click", scrollToTop);

  toggleButtonVisibility();
})();
