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
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: rgba(240, 240, 240, 0.9);
            color: #333;
            padding: 8px 12px;
            border-radius: 4px;
            margin: 12px 0;
            display: inline-block;
            font-size: 14px;
            line-height: 1.4;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1;
        `;
    const minuteText = minutes === 1 ? "minute" : "minutes";
    readingTimeElement.innerHTML = `
            <span style="font-weight: bold;">⏱️ ${minutes} ${minuteText} read</span>
            <span style="color: #666; margin-left: 6px;">(${wordCount} words)</span>
        `;
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "✕";
    closeButton.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
        `;
    closeButton.addEventListener("click", () => {
      readingTimeElement.remove();
    });
    readingTimeElement.appendChild(closeButton);
    contentElement.appendChild(readingTimeElement);
  }

  setTimeout(init, 500);
})();
