-(
  // ==UserScript==
  // @name         On Site Timer
  // @namespace    http://tampermonkey.net/
  // @version      1.0
  // @description  Display how long a user has spent on the current site
  // @author       Mitul Patel
  // @match        *://*/*
  // @grant        none
  // ==/UserScript==

  (function () {
    "use strict";

    const STORAGE_KEY = {
      TIME: "onsite_timer_seconds_",
      PAUSED: "onsite_timer_paused_",
    };

    const getDomainKey = (key) => key + window.location.hostname;

    let secondsOnSite =
      parseInt(localStorage.getItem(getDomainKey(STORAGE_KEY.TIME))) || 0;

    let isPaused =
      localStorage.getItem(getDomainKey(STORAGE_KEY.PAUSED)) === "true";

    const timerContainer = document.createElement("div");
    const timeDisplay = document.createElement("div");
    const controls = document.createElement("div");
    const toggleBtn = document.createElement("button");
    const pauseBtn = document.createElement("button");

    timerContainer.style.position = "fixed";
    timerContainer.style.bottom = "10px";
    timerContainer.style.left = "10px";
    timerContainer.style.backgroundColor = "#000000";
    timerContainer.style.color = "#ffffff";
    timerContainer.style.border = "2px solid #ff0000";
    timerContainer.style.padding = "10px";
    timerContainer.style.borderRadius = "5px";
    timerContainer.style.zIndex = "10000";
    timerContainer.style.fontFamily = "Arial, sans-serif";
    timerContainer.style.fontSize = "14px";
    timerContainer.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
    timerContainer.style.transition = "opacity 0.3s";
    timerContainer.style.cursor = "pointer";

    controls.style.marginTop = "5px";
    controls.style.display = "flex";
    controls.style.gap = "5px";
    controls.style.justifyContent = "center";

    const buttonStyle = `
      padding: 2px 5px;
      border: 1px solid #ff0000;
      background: #000000;
      color: #ffffff;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    `;

    const hiddenEyeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="16" height="16" fill="currentColor"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"/></svg>`;

    const visibleEyeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="16" fill="currentColor"><path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"/></svg>`;

    const playSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9l0-176c0-8.7 4.7-16.7 12.3-20.9z"/></svg>`;

    const pauseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm224-72l0 144c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-144c0-13.3 10.7-24 24-24s24 10.7 24 24zm112 0l0 144c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-144c0-13.3 10.7-24 24-24s24 10.7 24 24z"/></svg>`;

    toggleBtn.style.cssText = buttonStyle;
    pauseBtn.style.cssText = buttonStyle;

    toggleBtn.innerHTML = visibleEyeSvg;
    pauseBtn.innerHTML = isPaused ? playSvg : pauseSvg;

    timerContainer.addEventListener("mouseleave", () => {
      updateDisplay();
    });

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      timeDisplay.style.display =
        timeDisplay.style.display === "none" ? "block" : "none";
      toggleBtn.innerHTML =
        timeDisplay.style.display === "none" ? hiddenEyeSvg : visibleEyeSvg;
    });

    pauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isPaused = !isPaused;
      localStorage.setItem(getDomainKey(STORAGE_KEY.PAUSED), isPaused);
      pauseBtn.innerHTML = isPaused ? playSvg : pauseSvg;
    });

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const updateDisplay = () => {
      timeDisplay.innerHTML = `Time on Site: ${formatTime(secondsOnSite)}`;
    };

    controls.appendChild(toggleBtn);
    controls.appendChild(pauseBtn);
    timerContainer.appendChild(timeDisplay);
    timerContainer.appendChild(controls);
    document.body.appendChild(timerContainer);

    updateDisplay();
    setInterval(() => {
      if (!isPaused) {
        secondsOnSite++;
        localStorage.setItem(getDomainKey(STORAGE_KEY.TIME), secondsOnSite);
        updateDisplay();
      }
    }, 1000);

    window.addEventListener("beforeunload", () => {
      localStorage.setItem(getDomainKey(STORAGE_KEY.TIME), secondsOnSite);
    });
  })()
);
