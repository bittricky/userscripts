// ==UserScript==
// @name         Speech-to-Text
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add reliable speech-to-text functionality with network error handling
// @author       Mitul Patel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  class SpeechToTextManager {
    constructor() {
      this.recognition = null;
      this.isListening = false;
      this.currentInput = null;
      this.feedback = this.createFeedbackElement();
      this.retryAttempts = 0;
      this.maxRetries = 3;
      this.retryDelay = 1000; // 1 second
      this.initializeSpeechRecognition();
    }

    initializeSpeechRecognition() {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        this.showFeedback(
          "Speech recognition not supported in this browser",
          true
        );
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognitionHandlers();
    }

    setupRecognitionHandlers() {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      // Increase timeout for slower connections
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.showFeedback("Listening...");
        // Reset retry attempts when successfully started
        this.retryAttempts = 0;
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.currentInput) {
          const start =
            this.currentInput.selectionStart || this.currentInput.value.length;
          const end =
            this.currentInput.selectionEnd || this.currentInput.value.length;
          const before = this.currentInput.value.substring(0, start);
          const after = this.currentInput.value.substring(end);
          this.currentInput.value = before + transcript + after;
          this.currentInput.selectionStart = this.currentInput.selectionEnd =
            start + transcript.length;
        }
        this.showFeedback("Text captured: " + transcript);
      };

      this.recognition.onerror = (event) => {
        console.log("Speech recognition error:", event.error);

        switch (event.error) {
          case "network":
            this.handleNetworkError();
            break;
          case "no-speech":
            this.showFeedback("No speech detected. Please try again.", true);
            this.stopListening();
            break;
          case "aborted":
            this.showFeedback("Recording stopped", false);
            break;
          case "audio-capture":
            this.showFeedback(
              "No microphone detected. Please check your settings.",
              true
            );
            this.stopListening();
            break;
          case "not-allowed":
            this.showFeedback(
              "Microphone access denied. Please allow access in your browser settings.",
              true
            );
            this.stopListening();
            break;
          default:
            this.showFeedback(`Error: ${event.error}`, true);
            this.stopListening();
        }
      };

      this.recognition.onend = () => {
        // Only stop listening if we're not in the middle of a retry attempt
        if (!this.isRetrying) {
          this.stopListening();
        }
      };
    }

    handleNetworkError() {
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        this.isRetrying = true;
        this.showFeedback(
          `Network error. Retrying... (${this.retryAttempts}/${this.maxRetries})`,
          true
        );

        setTimeout(() => {
          if (this.currentInput) {
            try {
              this.recognition.start();
            } catch (e) {
              console.error("Retry failed:", e);
              this.showFeedback(
                "Failed to reconnect. Please try again later.",
                true
              );
              this.stopListening();
            }
          }
          this.isRetrying = false;
        }, this.retryDelay);
      } else {
        this.showFeedback(
          "Network connection failed. Please check your internet connection and try again.",
          true
        );
        this.stopListening();
      }
    }

    createFeedbackElement() {
      const feedback = document.createElement("div");
      feedback.id = "speech-feedback";
      feedback.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border-radius: 5px;
                z-index: 10000;
                display: none;
                font-family: Arial, sans-serif;
                transition: opacity 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            `;
      document.body.appendChild(feedback);
      return feedback;
    }

    showFeedback(message, isError = false) {
      this.feedback.style.background = isError
        ? "rgba(220, 53, 69, 0.8)"
        : "rgba(0, 0, 0, 0.8)";
      this.feedback.textContent = message;
      this.feedback.style.display = "block";
      this.feedback.style.opacity = "1";

      if (!isError || message.includes("Retrying")) {
        setTimeout(() => {
          this.feedback.style.opacity = "0";
          setTimeout(() => {
            this.feedback.style.display = "none";
          }, 300);
        }, 2000);
      }
    }

    createMicButton() {
      const button = document.createElement("button");
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16" height="16" fill="currentColor">
                <path d="M192 0C139 0 96 43 96 96v160c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zm128 256c0 70.7-57.3 128-128 128S64 326.7 64 256v-32c0-13.3 10.7-24 24-24s24 10.7 24 24v32c0 44.2 35.8 80 80 80s80-35.8 80-80v-32c0-13.3 10.7-24 24-24s24 10.7 24 24v32z"/>
            </svg>`;

      button.style.cssText = `
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                background: #007BFF;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                padding: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.3s ease;
                z-index: 1000;
            `;

      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleRecognition(e.target.closest("button"));
      });

      return button;
    }

    toggleRecognition(button) {
      if (this.isListening) {
        this.stopListening();
        button.style.background = "#007BFF";
      } else {
        this.currentInput =
          button.parentElement.querySelector("input, textarea");
        try {
          this.recognition.start();
          button.style.background = "#dc3545";
        } catch (e) {
          console.error("Speech recognition error:", e);
          this.showFeedback("Error starting speech recognition", true);
        }
      }
    }

    stopListening() {
      if (this.isListening) {
        this.isListening = false;
        this.isRetrying = false;
        this.retryAttempts = 0;
        try {
          this.recognition.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
        const button = document.querySelector(
          'button[style*="background: rgb(220, 53, 69)"]'
        );
        if (button) button.style.background = "#007BFF";
      }
    }

    addSpeechButton(input) {
      if (input.dataset.speechEnabled) return;

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      wrapper.style.width = input.offsetWidth + "px";

      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      wrapper.appendChild(this.createMicButton());

      input.dataset.speechEnabled = "true";
      input.style.paddingRight = "40px";
    }
  }

  const speechManager = new SpeechToTextManager();

  function initializeExistingInputs() {
    document
      .querySelectorAll('input[type="text"], input[type="search"], textarea')
      .forEach((input) => {
        speechManager.addSpeechButton(input);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExistingInputs);
  } else {
    initializeExistingInputs();
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (
            node.matches('input[type="text"], input[type="search"], textarea')
          ) {
            speechManager.addSpeechButton(node);
          }
          node
            .querySelectorAll(
              'input[type="text"], input[type="search"], textarea'
            )
            .forEach((input) => {
              speechManager.addSpeechButton(input);
            });
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
