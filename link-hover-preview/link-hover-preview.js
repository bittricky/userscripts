// ==UserScript==
// @name         Link Preview on Hover
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show a small preview of the page a link leads to when you hover over it.
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      *
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(`
        .link-preview-tooltip {
            position: absolute;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 10px;
            z-index: 10000;
            display: none;
            max-width: 300px;
            font-size: 14px;
            color: #333;
        }
        .link-preview-thumbnail {
            max-width: 100%;
            max-height: 150px;
            margin-bottom: 8px;
        }
        .loading-indicator {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 8px;
            vertical-align: middle;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `);

  const tooltip = document.createElement("div");
  tooltip.className = "link-preview-tooltip";
  document.body.appendChild(tooltip);

  function fetchMetadata(url, callback) {
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      onload: (response) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.responseText, "text/html");
        const title =
          doc.querySelector("title")?.innerText || "No title available";
        const thumbnail =
          doc.querySelector('meta[property="og:image"]')?.content || null;
        callback({ title, thumbnail });
      },
      onerror: () => {
        callback(null);
      },
    });
  }

  document.addEventListener("mouseover", (e) => {
    const link = e.target.closest("a");
    if (link && link.href) {
      tooltip.style.display = "block";
      tooltip.innerHTML = `
        <div style="display: flex; align-items: center;">
          <div class="loading-indicator"></div>
        </div>
      `;
      fetchMetadata(link.href, (data) => {
        if (data) {
          tooltip.innerHTML = `
                        ${
                          data.thumbnail
                            ? `<img src="${data.thumbnail}" class="link-preview-thumbnail" />`
                            : ""
                        }
                        <div>${data.title}</div>
                    `;
        } else {
          tooltip.textContent = "Unable to load preview.";
        }
      });
    }
  });

  document.addEventListener("mousemove", (e) => {
    tooltip.style.top = `${e.clientY + 15}px`;
    tooltip.style.left = `${e.clientX + 15}px`;
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a")) {
      tooltip.style.display = "none";
    }
  });
})();
