// ==UserScript==
// @name         Text-to-Speech Reader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Injects a button to read highlighted text using Text-to-Speech
// @author       Mitul Patel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const SPEAKER_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>';

  const PAUSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="width: 16px; height: 16px; fill: currentColor;">
          <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
        </svg>`;

  const PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>`;

  const buttonStyles = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    display: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    align-items: center;
    gap: 5px;
    transition: all 0.2s ease;
    opacity: 0.9;
    &:hover {
      opacity: 1;
    }
  `;

  const button = document.createElement("button");
  button.innerHTML = `${SPEAKER_ICON} Read`;
  button.style.cssText = buttonStyles;
  button.style.display = "none";

  const updateSvgStyles = () => {
    const svg = button.querySelector("svg");
    if (svg) {
      svg.style.cssText = `
        width: 16px;
        height: 16px;
        fill: currentColor;
      `;
    }
  };

  updateSvgStyles();

  document.body.appendChild(button);

  let speaking = false;
  let paused = false;
  const speech = window.speechSynthesis;
  let utterance = null;

  let voices = [];

  speech.addEventListener("voiceschanged", () => {
    voices = speech.getVoices();
  });

  const getPreferredLanguage = () => {
    if (navigator.language) {
      return navigator.language;
    }

    if (navigator.languages && navigator.languages.length) {
      return navigator.languages[0];
    }

    return "en-US";
  };

  const findVoiceForLanguage = (targetLang) => {
    const langCode = targetLang.split("-")[0].toLowerCase();

    let voice = voices.find(
      (v) => v.lang.toLowerCase() === targetLang.toLowerCase()
    );

    if (!voice) {
      voice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode));
    }

    if (!voice && voices.length > 0) {
      voice = voices.find((v) => v.localService) || voices[0];
    }

    return voice;
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  button.addEventListener("click", () => {
    if (speaking) {
      if (paused) {
        speech.resume();
      } else {
        speech.pause();
      }
      return;
    }

    const selectedText = window.getSelection().toString().trim();

    if (selectedText) {
      utterance = new SpeechSynthesisUtterance(selectedText);

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const preferredLanguage = getPreferredLanguage();
      utterance.lang = preferredLanguage;

      const preferredVoice = findVoiceForLanguage(preferredLanguage);

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        speaking = true;
        paused = false;
        button.innerHTML = `${PAUSE_ICON} Pause`;
        button.style.backgroundColor = "#f44336";
        updateSvgStyles();
      };

      utterance.onpause = () => {
        speaking = true;
        paused = true;
        button.innerHTML = `${PLAY_ICON} Play`;
        button.style.backgroundColor = "#4CAF50";
        updateSvgStyles();
      };

      utterance.onresume = () => {
        speaking = true;
        paused = false;
        button.innerHTML = `${PAUSE_ICON} Pause`;
        button.style.backgroundColor = "#f44336";
        updateSvgStyles();
      };

      utterance.onend = () => {
        speaking = false;
        paused = false;
        button.innerHTML = `${SPEAKER_ICON} Read`;
        button.style.backgroundColor = "#4CAF50";
        updateSvgStyles();
      };

      speech.speak(utterance);
    }
  });

  const handleSelectionChange = debounce(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && selection.rangeCount > 0) {
      button.style.display = "flex";
    } else {
      button.style.display = "none";
    }
  }, 150);

  handleSelectionChange();

  document.addEventListener("selectionchange", handleSelectionChange);

  document.addEventListener("click", (e) => {
    if (!e.target.contains(button) && !button.contains(e.target)) {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (!selectedText) {
        button.style.display = "none";
      }
    }
  });
})();
