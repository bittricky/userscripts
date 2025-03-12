// ==UserScript==
// @name         Time to Read
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Displays estimated reading time for articles and long-form content
// @author       Mitul Patel
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  const WORDS_PER_MINUTE = 225;
  const MIN_WORD_COUNT = 100;

  const sitePatterns = [
    { domain: "medium.com", contentSelector: "article" },
    {
      domain: "nytimes.com",
      contentSelector: 'article, [data-testid="article-body"]',
    },
    { domain: "washingtonpost.com", contentSelector: "article, .article-body" },
    {
      domain: "theguardian.com",
      contentSelector: ".article-body, .content__article-body",
    },
    {
      domain: "bbc.com",
      contentSelector: '.article, [data-component="text-block"]',
    },
    { domain: "techcrunch.com", contentSelector: "article, .article-content" },
    { domain: "arstechnica.com", contentSelector: "article, .article-content" },
    { domain: "wired.com", contentSelector: "article, .article__body" },
    { domain: "*", contentSelector: "article" },
    { domain: "*", contentSelector: ".article, .post, .entry, .content" },
    { domain: "*", contentSelector: '[itemprop="articleBody"]' },
    { domain: "*", contentSelector: "main" },
  ];

  function init() {
    if (isExcludedPage()) return;
    const contentElement = findContentElement();
    if (!contentElement) return;
    const wordCount = countWords(contentElement);
    if (wordCount < MIN_WORD_COUNT) return;
    const readingTimeMinutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
    displayReadingTime(contentElement, readingTimeMinutes, wordCount);
  }

  function isExcludedPage() {
    const excludedPatterns = [/\/search\//, /\/tag\//, /\/category\//];

    for (const pattern of excludedPatterns) {
      if (window.location.pathname.match(pattern)) return true;
    }

    return false;
  }

  function findContentElement() {
    const currentDomain = window.location.hostname;
    for (const pattern of sitePatterns) {
      if (currentDomain.includes(pattern.domain) || pattern.domain === "*") {
        const element = document.querySelector(pattern.contentSelector);
        if (element) return element;
      }
    }
    return findLargestTextBlock();
  }

  function findLargestTextBlock() {
    const contentBlocks = [
      ...document.querySelectorAll(
        'article, .article, .post, .entry, .content, main, [role="main"]'
      ),
    ];

    if (contentBlocks.length === 0) return null;

    let largestBlock = contentBlocks[0];
    let maxLength = countWords(largestBlock);

    for (let i = 1; i < contentBlocks.length; i++) {
      const blockLength = countWords(contentBlocks[i]);
      if (blockLength > maxLength) {
        maxLength = blockLength;
        largestBlock = contentBlocks[i];
      }
    }

    return maxLength >= MIN_WORD_COUNT ? largestBlock : null;
  }

  function countWords(element) {
    if (!element) return 0;
    const clone = element.cloneNode(true);
    const elementsToRemove = clone.querySelectorAll(
      "script, style, code, pre, nav, header, footer"
    );
    elementsToRemove.forEach((el) => el.remove());
    const text = clone.textContent || clone.innerText || "";
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function displayReadingTime(contentElement, minutes, wordCount) {
    const readingTimeElement = document.createElement("div");
    readingTimeElement.id = "ttr-reading-time";
    readingTimeElement.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: rgba(255, 255, 255, 0.98);
      color: #0047AB;
      padding: 20px 20px 20px 20px;
      border-radius: 8px;
      margin: 0;
      display: flex;
      align-items: center;
      font-size: 15px;
      line-height: 1.5;
      box-shadow: 0 2px 8px rgba(0, 70, 171, 0.15);
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 9999;
      border: 1px solid rgba(0, 70, 171, 0.2);
      transition: opacity 0.2s ease;
      max-width: 300px;
    `;

    const minuteText = minutes === 1 ? "minute" : "minutes";

    readingTimeElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 18px; position: relative; padding-right: 20px;">
        <div style="width: 24px; height: 24px; color: #0047AB;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 600; font-size: 16px; color: #0047AB;"> Avg. Read: ${minutes} ${minuteText} </span>
          <span style="color: #E6A817; font-size: 14px; margin-top: 2px;">${wordCount} words</span>
        </div>
      </div>
    `;

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="14" height="14" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
    `;
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      padding: 6px;
      cursor: pointer;
      opacity: 0.7;
      color: #000;
      font-size: 14px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      margin-left: 12px;
    `;

    closeButton.addEventListener("mouseover", () => {
      closeButton.style.opacity = "1";
      closeButton.style.color = "#000";
      closeButton.style.backgroundColor = "rgba(0, 70, 171, 0.1)";
    });

    closeButton.addEventListener("mouseout", () => {
      closeButton.style.opacity = "0.7";
      closeButton.style.color = "#000";
      closeButton.style.backgroundColor = "transparent";
    });

    closeButton.addEventListener("click", () => {
      readingTimeElement.style.opacity = "0";
      setTimeout(() => readingTimeElement.remove(), 200);
    });

    readingTimeElement.appendChild(closeButton);
    contentElement.appendChild(readingTimeElement);
  }

  setTimeout(init, 500);
})();
