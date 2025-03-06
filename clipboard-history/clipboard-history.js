// ==UserScript==
// @name         Clipboard History
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  clipboard history manager with searchable UI, timestamps, and keyboard shortcuts
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// ==/UserScript==

(function () {
  "use strict";

  const CONFIG = {
    MAX_HISTORY: 50,
    PREVIEW_LENGTH: 75,
    KEYBOARD_SHORTCUT: {
      show: { key: "h", ctrl: true, alt: true },
      clear: { key: "x", ctrl: true, alt: true },
    },
  };

  GM_addStyle(`
    #clipboard-history-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 650px;
      max-width: 90vw;
      max-height: 80vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #333;
    }
    
    .clipboard-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f8f8;
      border-radius: 12px 12px 0 0;
    }
    
    .clipboard-modal-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: #333;
    }
    
    .clipboard-actions {
      display: flex;
      gap: 12px;
    }
    
    .clipboard-modal-close, .clipboard-action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      color: #555;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .clipboard-modal-close svg, .clipboard-action-btn svg {
      width: 16px;
      height: 16px;
      fill: #666;
    }
    
    .clipboard-modal-close:hover, .clipboard-action-btn:hover {
      background: #e9e9e9;
    }
    
    .clipboard-modal-close:hover svg, .clipboard-action-btn:hover svg {
      fill: #333;
    }
    
    .clipboard-search-container {
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #fff;
    }
    
    .clipboard-search {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d0d0d0;
      border-radius: 8px;
      font-size: 15px;
      color: #333;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05) inset;
      transition: border-color 0.2s ease;
    }
    
    .clipboard-search:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }
    
    .clipboard-content {
      overflow-y: auto;
      flex-grow: 1;
      padding: 0;
      margin: 0;
      list-style: none;
      background: #fff;
    }
    
    .clipboard-item {
      padding: 14px 24px;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      transition: background 0.2s ease;
      position: relative;
    }
    
    .clipboard-item:last-child {
      border-bottom: none;
    }
    
    .clipboard-item:hover {
      background: #f5f9ff;
    }
    
    .clipboard-item.selected {
      background: #e6f7ff;
    }
    
    .clipboard-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      color: #777;
    }
    
    .clipboard-item-preview {
      font-size: 15px;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #333;
    }
    
    .copy-indicator {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 10000;
      font-size: 15px;
      font-weight: 500;
    }
    
    .copy-indicator.show {
      opacity: 1;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      z-index: 9998;
      backdrop-filter: blur(2px);
    }
    
    .keyboard-shortcut {
      font-size: 13px;
      color: #777;
      margin-left: 10px;
      font-weight: 500;
    }
  `);

  function getClipboardHistory() {
    return GM_getValue("clipboard_history", []);
  }

  function saveToClipboardHistory(text) {
    if (!text || text.length === 0) return;

    let history = getClipboardHistory();

    const existingIndex = history.findIndex((item) => item.text === text);
    if (existingIndex !== -1) {
      const existing = history.splice(existingIndex, 1)[0];
      existing.timestamp = Date.now();
      history.unshift(existing);
    } else {
      history.unshift({
        text: text,
        timestamp: Date.now(),
        tags: [],
      });
    }

    if (history.length > CONFIG.MAX_HISTORY) {
      history = history.slice(0, CONFIG.MAX_HISTORY);
    }

    GM_setValue("clipboard_history", history);
  }

  function clearClipboardHistory() {
    GM_setValue("clipboard_history", []);
    showNotification("Clipboard history cleared");
  }

  function createModal() {
    removeModal();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.addEventListener("click", removeModal);
    document.body.appendChild(overlay);

    const modal = document.createElement("div");
    modal.id = "clipboard-history-modal";

    document.body.appendChild(modal);

    const header = document.createElement("div");
    header.className = "clipboard-modal-header";

    const title = document.createElement("h3");
    title.className = "clipboard-modal-title";
    title.textContent = "Clipboard History";

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "clipboard-actions";

    const clearBtn = document.createElement("button");
    clearBtn.className = "clipboard-action-btn";
    clearBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>`;
    clearBtn.title = "Clear History";
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Clear all clipboard history?")) {
        clearClipboardHistory();
        renderClipboardItems();
      }
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "clipboard-modal-close";
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;
    closeBtn.title = "Close";
    closeBtn.addEventListener("click", removeModal);

    actionsDiv.appendChild(clearBtn);
    actionsDiv.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(actionsDiv);
    modal.appendChild(header);

    const searchContainer = document.createElement("div");
    searchContainer.className = "clipboard-search-container";

    const searchInput = document.createElement("input");
    searchInput.className = "clipboard-search";
    searchInput.placeholder = "Search clipboard history...";
    searchInput.addEventListener("input", () => {
      renderClipboardItems(searchInput.value);
    });

    searchContainer.appendChild(searchInput);
    modal.appendChild(searchContainer);

    const content = document.createElement("ul");
    content.className = "clipboard-content";
    modal.appendChild(content);

    setTimeout(() => searchInput.focus(), 100);

    return { modal, content, searchInput };
  }

  function removeModal() {
    const modal = document.getElementById("clipboard-history-modal");
    if (modal) modal.remove();

    const overlay = document.querySelector(".modal-overlay");
    if (overlay) overlay.remove();
  }

  function renderClipboardItems(searchTerm = "") {
    const { content } = getModalElements();
    if (!content) return;

    content.innerHTML = "";
    const history = getClipboardHistory();

    if (history.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "clipboard-item";
      emptyMessage.textContent = "No clipboard history available";
      content.appendChild(emptyMessage);
      return;
    }

    const filteredHistory = searchTerm
      ? history.filter((item) =>
          item.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : history;

    if (filteredHistory.length === 0) {
      const noResultMessage = document.createElement("li");
      noResultMessage.className = "clipboard-item";
      noResultMessage.textContent = "No results found";
      content.appendChild(noResultMessage);
      return;
    }

    filteredHistory.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.className = "clipboard-item";
      listItem.dataset.index = index;

      const header = document.createElement("div");
      header.className = "clipboard-item-header";

      const timestamp = document.createElement("span");
      timestamp.textContent = formatTimestamp(item.timestamp);

      const index_display = document.createElement("span");
      index_display.textContent = `#${index + 1}`;

      header.appendChild(index_display);
      header.appendChild(timestamp);

      const preview = document.createElement("div");
      preview.className = "clipboard-item-preview";
      preview.textContent = truncateText(item.text, CONFIG.PREVIEW_LENGTH);

      listItem.appendChild(header);
      listItem.appendChild(preview);

      listItem.addEventListener("click", () => {
        copyToClipboard(item.text);
        highlightItem(listItem);
      });

      content.appendChild(listItem);
    });
  }

  function getModalElements() {
    const modal = document.getElementById("clipboard-history-modal");
    if (!modal) return {};

    const content = modal.querySelector(".clipboard-content");
    const searchInput = modal.querySelector(".clipboard-search");

    return { modal, content, searchInput };
  }

  function showClipboardHistory() {
    const { modal } = createModal();
    if (!modal) return;

    renderClipboardItems();
  }

  function truncateText(text, maxLength) {
    if (!text) return "";
    text = text.replace(/\s+/g, " ").trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    now.setDate(now.getDate() - 1);
    if (date.toDateString() === now.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return `${date.toLocaleDateString([], {
        weekday: "short",
      })} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showCopyIndicator("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        showCopyIndicator("Failed to copy!", true);
      });
  }

  function showCopyIndicator(message, isError = false) {
    const existingIndicator = document.querySelector(".copy-indicator");
    if (existingIndicator) existingIndicator.remove();

    const indicator = document.createElement("div");
    indicator.className = "copy-indicator";
    indicator.textContent = message;

    if (isError) {
      indicator.style.background = "#f44336";
    }

    document.body.appendChild(indicator);

    setTimeout(() => indicator.classList.add("show"), 10);

    setTimeout(() => {
      indicator.classList.remove("show");
      setTimeout(() => indicator.remove(), 300);
    }, 2000);
  }

  function highlightItem(item) {
    const allItems = document.querySelectorAll(".clipboard-item");
    allItems.forEach((el) => el.classList.remove("selected"));

    item.classList.add("selected");

    setTimeout(() => {
      item.classList.remove("selected");
    }, 1000);
  }

  function showNotification(message) {
    if (typeof GM_notification === "function") {
      GM_notification({
        text: message,
        title: "Clipboard History",
        timeout: 2000,
      });
    } else {
      showCopyIndicator(message);
    }
  }

  function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (
        e.key.toLowerCase() === CONFIG.KEYBOARD_SHORTCUT.show.key &&
        e.ctrlKey === CONFIG.KEYBOARD_SHORTCUT.show.ctrl &&
        e.altKey === CONFIG.KEYBOARD_SHORTCUT.show.alt
      ) {
        e.preventDefault();
        showClipboardHistory();
      }

      if (
        e.key.toLowerCase() === CONFIG.KEYBOARD_SHORTCUT.clear.key &&
        e.ctrlKey === CONFIG.KEYBOARD_SHORTCUT.clear.ctrl &&
        e.altKey === CONFIG.KEYBOARD_SHORTCUT.clear.alt
      ) {
        e.preventDefault();
        if (confirm("Clear all clipboard history?")) {
          clearClipboardHistory();
          const { modal } = getModalElements();
          if (modal) renderClipboardItems();
        }
      }
    });
  }

  function setupClipboardCapture() {
    document.addEventListener("copy", async () => {
      setTimeout(async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text && text.trim()) {
            saveToClipboardHistory(text.trim());
          }
        } catch (error) {
          console.error("Error accessing clipboard:", error);
        }
      }, 100);
    });
  }

  function init() {
    GM_registerMenuCommand(
      "Show Clipboard History (Ctrl+Alt+H)",
      showClipboardHistory
    );
    GM_registerMenuCommand("Clear Clipboard History (Ctrl+Alt+X)", () => {
      if (confirm("Clear all clipboard history?")) {
        clearClipboardHistory();
      }
    });

    setupKeyboardShortcuts();

    setupClipboardCapture();

    console.log("Enhanced Clipboard History initialized");
  }

  init();
})();
