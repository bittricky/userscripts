// ==UserScript==
// @name         Clipboard History
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Save clipboard history and access previous copies
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";

  const MAX_HISTORY = 20;

  function saveToClipboardHistory(text) {
    let history = GM_getValue("clipboard_history", []);
    if (history.includes(text)) return;
    history.unshift(text);
    if (history.length > MAX_HISTORY) history.pop();
    GM_setValue("clipboard_history", history);
  }

  function showClipboardHistory() {
    let history = GM_getValue("clipboard_history", []);
    let historyText = history
      .map((item, index) => `${index + 1}: ${item}`)
      .join("\n");
    alert("Clipboard History:\n" + (historyText || "No history available"));
  }

  function copyFromHistory(index) {
    let history = GM_getValue("clipboard_history", []);
    if (index >= 0 && index < history.length) {
      navigator.clipboard.writeText(history[index]).then(() => {
        alert("Copied: " + history[index]);
      });
    } else {
      alert("Invalid index");
    }
  }

  GM_registerMenuCommand("Show Clipboard History", showClipboardHistory);
  GM_registerMenuCommand("Clear Clipboard History", () =>
    GM_setValue("clipboard_history", [])
  );
  GM_registerMenuCommand("Copy from History", () => {
    let index = prompt("Enter history index to copy:");
    if (index !== null) copyFromHistory(parseInt(index) - 1);
  });

  document.addEventListener("copy", async (event) => {
    let text = (await navigator.clipboard.readText()).trim();
    if (text) saveToClipboardHistory(text);
  });
})();
