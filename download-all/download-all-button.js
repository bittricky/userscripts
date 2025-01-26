// ==UserScript==
// @name         Download All Button
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Add a "Download All" button to batch download files from a page
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_download
// @grant        GM_notification
// ==/UserScript==

(function () {
  "use strict";

  const CONFIG = {
    buttonStyle: {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: "9999",
      padding: "12px 20px",
      backgroundColor: "#2196F3",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      userSelect: "none",
      outline: "none",
    },
    fileExtensions: {
      documents: [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"],
      archives: [".zip", ".rar", ".7z", ".tar", ".gz"],
      images: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"],
      audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac"],
      video: [".mp4", ".webm", ".mkv", ".avi", ".mov"],
      ebooks: [".epub", ".mobi", ".azw"],
    },
  };

  const getAllFileExtensions = () => {
    return Object.values(CONFIG.fileExtensions).flat();
  };

  function createDownloadCounter() {
    const counter = document.createElement("div");
    Object.assign(counter.style, {
      position: "fixed",
      top: "80px",
      right: "20px",
      padding: "8px 16px",
      backgroundColor: "rgba(33, 150, 243, 0.9)",
      color: "white",
      borderRadius: "6px",
      fontSize: "13px",
      fontFamily: CONFIG.buttonStyle.fontFamily,
      fontWeight: "500",
      display: "none",
      zIndex: "9999",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    });
    document.body.appendChild(counter);
    return counter;
  }

  function createDownloadAllButton() {
    const button = document.createElement("button");

    const downloadIcon = `<svg style="width: 16px; height: 16px;" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
      <path fill="currentColor" d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zM393.4 288H328v111.9c0 13.2-10.7 23.9-24 23.9h-16c-13.2 0-24-10.7-24-23.9V288h-65.4c-14.3 0-21.4-17.2-11.3-27.3l105.4-105.4c6.2-6.2 16.4-6.2 22.6 0l105.4 105.4c10.1 10.1 2.9 27.3-11.3 27.3z"/>
    </svg>`;

    button.innerHTML = `${downloadIcon}<span>Download All</span>`;
    Object.assign(button.style, CONFIG.buttonStyle);

    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#1976D2";
      button.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.4)";
      button.style.transform = "translateY(-1px)";
    });

    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = CONFIG.buttonStyle.backgroundColor;
      button.style.boxShadow = CONFIG.buttonStyle.boxShadow;
      button.style.transform = "translateY(0)";
    });

    button.addEventListener("mousedown", () => {
      button.style.transform = "translateY(1px)";
      button.style.boxShadow = "0 2px 4px rgba(33, 150, 243, 0.3)";
    });

    button.addEventListener("mouseup", () => {
      button.style.transform = "translateY(-1px)";
      button.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.4)";
    });

    button.onclick = downloadAllFiles;
    document.body.appendChild(button);
    return button;
  }

  function getFileName(url) {
    try {
      const urlObj = new URL(url);
      const fileName = urlObj.pathname.split("/").pop();
      return fileName || `download-${Date.now()}`;
    } catch (e) {
      return `download-${Date.now()}`;
    }
  }

  async function downloadAllFiles() {
    const links = document.querySelectorAll("a");
    const fileExtensions = getAllFileExtensions();
    const downloadLinks = [];
    const counter = createDownloadCounter();
    let completedDownloads = 0;

    links.forEach((link) => {
      const href = link.href;
      if (fileExtensions.some((ext) => href.toLowerCase().endsWith(ext))) {
        downloadLinks.push({
          url: href,
          filename: getFileName(href),
        });
      }
    });

    if (downloadLinks.length === 0) {
      GM_notification({
        text: "No downloadable files found on this page.",
        title: "Download All",
        timeout: 3000,
      });
      return;
    }

    const confirmDownload = confirm(
      `Found ${downloadLinks.length} files to download. Continue?`
    );

    if (!confirmDownload) return;

    counter.style.display = "block";

    for (const [index, download] of downloadLinks.entries()) {
      try {
        counter.textContent = `Downloading: ${index + 1}/${
          downloadLinks.length
        }`;
        await new Promise((resolve, reject) => {
          GM_download({
            url: download.url,
            name: download.filename,
            onload: resolve,
            onerror: reject,
          });
        });
        completedDownloads++;
      } catch (error) {
        console.error(`Failed to download ${download.url}:`, error);
        GM_notification({
          text: `Failed to download: ${download.filename}`,
          title: "Download Error",
          timeout: 3000,
        });
      }
    }

    counter.style.display = "none";

    GM_notification({
      text: `Successfully downloaded ${completedDownloads} of ${downloadLinks.length} files`,
      title: "Download Complete",
      timeout: 5000,
    });
  }

  window.addEventListener("load", createDownloadAllButton);
})();
