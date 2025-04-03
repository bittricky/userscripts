// ==UserScript==
// @name         Udemy Course Exporter
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Export Udemy courses to JSON for Notion
// @author       Mitul
// @match        https://*.udemy.com/*learning*
// @match        https://*.udemy.com/*my-courses*
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  function getCourses() {
    // More flexible course card selection
    const courseCards = document.querySelectorAll(
      '[class*="course-card"],[data-purpose*="course-card"],[class*="course-container"]'
    );
    const courses = [];

    courseCards.forEach((card) => {
      // Look for title using multiple potential selectors
      const titleEl = card.querySelector(
        '[data-purpose="course-title"], .course-title, h3, [class*="title"]'
      );
      // Look for progress with flexible selectors
      const progressEl = card.querySelector(
        '[data-purpose*="progress"], [class*="progress"], [class*="percentage"]'
      );
      // Look for link - any anchor that would be the main course link
      const linkEl = card.querySelector(
        'a[href*="/course/"], a[href*="/learn/"]'
      );

      const title = titleEl?.textContent.trim();
      const progress = progressEl?.textContent.trim() || "0%";
      const link = linkEl?.href;

      if (title && link) {
        courses.push({ title, progress, link });
      }
    });

    // Log the number of courses found for debugging
    console.log(`Found ${courses.length} courses to export`);
    return courses;
  }

  function createIconSVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 384 512");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.innerHTML = `
            <path fill="white" d="M384 121.9V128H256V0h6.1c6.4 0 12.5 2.5
            17 7l97.9 97.9c4.5 4.5 7 10.6 7 17zM224 0v128c0
            17.7 14.3 32 32 32h128v288c0 35.3-28.7 64-64
            64H64c-35.3 0-64-28.7-64-64V64C0 28.7 28.7
            0 64 0h160z"/>
        `;
    return svg;
  }

  function injectExportButton() {
    // Don't inject again if already present
    if (document.querySelector("#udemy-export-button")) return;

    // Try to find the header with more flexible selectors
    const header = document.querySelector("header, .header, [class*='header']");
    if (!header) {
      console.log("Could not find header element to attach button");
      return;
    }

    const btn = document.createElement("button");
    btn.id = "udemy-export-button";
    const icon = createIconSVG();
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(" Export Courses"));
    btn.style = `
            margin-left: 10px;
            padding: 6px 12px;
            background-color: #a435f0;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
        `;

    btn.onclick = () => {
      const courses = getCourses();
      const json = JSON.stringify(courses, null, 2);
      GM_setClipboard(json);
      alert("✅ Courses copied to clipboard in JSON format for Notion!");
      console.log("Exported courses:", courses);
    };

    // Try to find right controls with more flexible selectors
    const rightControls = header.querySelector(
      '[data-testid="desktop-header"] > div:last-child, header > div:last-child, .header-right, .right-controls'
    );

    if (rightControls) {
      rightControls.prepend(btn);
      console.log("Button added to header");
    } else {
      // Fallback: just append to the header
      header.appendChild(btn);
      console.log("Button added to header (fallback)");
    }
  }

  // Wait a bit longer for the page to fully load
  setTimeout(() => {
    injectExportButton();
    console.log("Initial button injection attempt");

    // Set up observer for dynamic content
    const observer = new MutationObserver(() => {
      if (!document.querySelector("#udemy-export-button")) {
        injectExportButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log("Observer set up");
  }, 2000);
})();
