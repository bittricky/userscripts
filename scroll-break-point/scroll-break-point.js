// ==UserScript==
// @name         Universal Scroll Break Point
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Prevent infinite scrolling across all applications with smart intervention
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  const config = {
    SCROLL_LIMIT: 5000,
    TIME_LIMIT: 10 * 60 * 1000,
    BLOCK_DURATION: 3 * 60 * 1000,
    SCROLL_SPEED_LIMIT: 100,
    CHECK_INTERVAL: 100,
  };

  let state = {
    totalScrollDistance: GM_getValue("totalScrollDistance", 0),
    startTime: Date.now(),
    blocked: false,
    lastScrollY: window.scrollY,
    lastScrollTime: Date.now(),
    scrollSpeeds: [],
  };

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  overlay.style.color = "#fff";
  overlay.style.display = "none";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = 999999;
  overlay.style.fontSize = "24px";
  overlay.style.fontFamily = "Arial, sans-serif";
  overlay.style.textAlign = "center";
  overlay.style.padding = "20px";
  overlay.innerHTML = `
    <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; max-width: 600px;">
      <h2 style="margin-bottom: 20px; color: #ff6b6b;">Time for a Scroll Break! 🌟</h2>
      <p style="margin-bottom: 15px;">You've been scrolling for a while. Let's take a moment to pause.</p>
      <p style="font-size: 18px;">Page will unlock in <span id="countdown" style="font-weight: bold; color: #4ecdc4;"></span> seconds</p>
      <div style="margin-top: 20px; font-size: 16px;">
        <p>Why not try:</p>
        <ul style="list-style: none; padding: 0;">
          <li>• Taking a deep breath</li>
          <li>• Stretching your arms</li>
          <li>• Looking at something 20 feet away</li>
        </ul>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function updateCountdown(timeLeft) {
    const countdown = document.getElementById("countdown");
    if (countdown) {
      countdown.innerText = Math.ceil(timeLeft / 1000);
    }
  }

  function preventScroll(e) {
    if (state.blocked) {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo(0, state.lastScrollY);
      return false;
    }
  }

  function startBlocking() {
    state.blocked = true;
    overlay.style.display = "flex";

    window.addEventListener("scroll", preventScroll, { passive: false });
    window.addEventListener("mousewheel", preventScroll, { passive: false });
    window.addEventListener("DOMMouseScroll", preventScroll, {
      passive: false,
    });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    let blockEndTime = Date.now() + config.BLOCK_DURATION;
    const interval = setInterval(() => {
      let timeLeft = blockEndTime - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        stopBlocking();
      } else {
        updateCountdown(timeLeft);
      }
    }, 1000);
  }

  function stopBlocking() {
    state.blocked = false;
    overlay.style.display = "none";
    state.totalScrollDistance = 0;
    state.startTime = Date.now();
    state.scrollSpeeds = [];
    GM_setValue("totalScrollDistance", 0);

    window.removeEventListener("scroll", preventScroll);
    window.removeEventListener("mousewheel", preventScroll);
    window.removeEventListener("DOMMouseScroll", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
  }

  function checkScrollSpeed() {
    const currentTime = Date.now();
    const currentScroll = window.scrollY;
    const timeDiff = currentTime - state.lastScrollTime;
    const scrollDiff = Math.abs(currentScroll - state.lastScrollY);

    if (timeDiff > 0) {
      const speed = (scrollDiff / timeDiff) * 1000;
      state.scrollSpeeds.push(speed);

      if (state.scrollSpeeds.length > 10) {
        state.scrollSpeeds.shift();
      }

      const avgSpeed =
        state.scrollSpeeds.reduce((a, b) => a + b, 0) /
        state.scrollSpeeds.length;

      if (avgSpeed > config.SCROLL_SPEED_LIMIT) {
        startBlocking();
      }
    }

    state.lastScrollTime = currentTime;
    state.lastScrollY = currentScroll;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (state.blocked) return;

      const scrollDiff = Math.abs(window.scrollY - state.lastScrollY);
      state.totalScrollDistance += scrollDiff;
      GM_setValue("totalScrollDistance", state.totalScrollDistance);

      const elapsedTime = Date.now() - state.startTime;

      if (
        state.totalScrollDistance > config.SCROLL_LIMIT ||
        elapsedTime > config.TIME_LIMIT
      ) {
        startBlocking();
      }

      checkScrollSpeed();
    },
    { passive: false }
  );

  let activityTimeout;
  function handleUserActivity() {
    if (state.blocked) return;

    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      state.startTime = Date.now();
      state.scrollSpeeds = [];
    }, 1000);
  }

  document.addEventListener("mousemove", handleUserActivity);
  document.addEventListener("keydown", handleUserActivity);
  document.addEventListener("click", handleUserActivity);
  document.addEventListener("touchstart", handleUserActivity);
})();
