// ==UserScript==
// @name         Udemy Course Exporter
// @namespace    http://tampermonkey.net/
// @version      1.0
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
    const courseCardGrid = document.querySelector(
      ".my-courses__course-card-grid"
    );
    if (!courseCardGrid) {
      console.log("Could not find course card grid");
      return [];
    }

    const courseCards = courseCardGrid.querySelectorAll(
      ".enrolled-course-card--container--WJYo9"
    );
    const courses = [];

    courseCards.forEach((card) => {
      const titleEl = card.querySelector('[data-purpose="course-title-url"]');
      const linkEl = titleEl?.querySelector("a");
      const progressMeter = card.querySelector('[role="meter"]');
      let progress = "0%";

      if (progressMeter) {
        const ariaLabel = progressMeter.getAttribute("aria-label");
        const ariaValueNow = progressMeter.getAttribute("aria-valuenow");

        if (ariaLabel && ariaLabel.includes("complete")) {
          progress = ariaLabel;
        } else if (ariaValueNow) {
          progress = `${ariaValueNow}%`;
        }
      }

      const progressText = card.querySelector(
        ".enrolled-course-card--progress-and-rating--z0u5V"
      );
      if (progressText && progressText.textContent.includes("%")) {
        const match = progressText.textContent.match(/(\d+)%/);
        if (match) {
          progress = `${match[1]}%`;
        }
      }

      const instructorsEl = card.querySelector(
        ".course-card-instructors-module--instructor-list--cJTfw"
      );
      const instructors = instructorsEl?.textContent.trim() || "";

      const imageEl = card.querySelector("img");
      const imageUrl = imageEl?.src || "";

      const title = titleEl?.textContent.trim();
      const link = linkEl?.href;

      if (title && link) {
        courses.push({
          title,
          progress,
          link,
          instructors,
          imageUrl,
        });
      }
    });

    console.log(`Found ${courses.length} courses to export`);
    return courses;
  }

  function createIconSVG() {
    // Font Awesome file-export icon (fa-file-export)
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 576 512");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("class", "fa-icon");

    // Font Awesome file-export icon path
    svg.innerHTML = `
      <path fill="white" d="M384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128zM571 308l-95.7-96.4c-10.1-10.1-27.4-3-27.4 11.3V288h-64v64h64v65.2c0 14.3 17.3 21.4 27.4 11.3L571 332c6.6-6.6 6.6-17.4 0-24zm-379 28v-32c0-8.8 7.2-16 16-16h176V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V352H208c-8.8 0-16-7.2-16-16z"/>
    `;
    return svg;
  }

  function injectExportButton() {
    if (document.querySelector("#udemy-export-button")) return;

    const btn = document.createElement("button");
    btn.id = "udemy-export-button";
    const icon = createIconSVG();
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(" Export Courses"));

    // Style for floating button at bottom right
    btn.style = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            padding: 10px 16px;
            background-color: #a435f0;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        `;

    // Add hover effect
    btn.onmouseover = () => {
      btn.style.backgroundColor = "#8710d8";
      btn.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)";
      btn.style.transform = "translateY(-2px)";
    };

    btn.onmouseout = () => {
      btn.style.backgroundColor = "#a435f0";
      btn.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
      btn.style.transform = "translateY(0)";
    };

    btn.onclick = () => {
      const courses = getCourses();
      if (courses.length === 0) {
        alert(
          "❌ No courses found. Make sure you're on the Udemy My Learning page."
        );
        return;
      }

      const json = JSON.stringify(courses, null, 2);
      GM_setClipboard(json);
      alert(`✅ ${courses.length} courses copied to clipboard in JSON format!`);
      console.log("Exported courses:", courses);
    };

    document.body.appendChild(btn);
    console.log("Floating button added to bottom right corner");
  }

  setTimeout(() => {
    injectExportButton();
    console.log("Initial button injection attempt");

    const observer = new MutationObserver(() => {
      if (!document.querySelector("#udemy-export-button")) {
        injectExportButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log("Observer set up");
  }, 2000);
})();
