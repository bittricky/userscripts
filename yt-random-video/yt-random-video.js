// ==UserScript==
// @name         YouTube Random Video Button
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Adds a "Random Video" button to YouTube to watch a random video.
// @author       Mitul Patel
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function getRandomQuery() {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = (crypto.getRandomValues(new Uint8Array(1))[0] % 5) + 3;
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);

    let query = "";
    for (let i = 0; i < length; i++) {
      let randomValue;
      do {
        randomValue = randomBytes[i];
      } while (randomValue >= 256 - (256 % characters.length));

      query += characters[randomValue % characters.length];
    }

    return query;
  }

  function goToRandomVideo() {
    const query = getRandomQuery();
    fetch(`https://www.youtube.com/results?search_query=${query}`)
      .then((response) => response.text())
      .then((html) => {
        const videoIdMatch = html.match(/"videoId":"(.*?)"/);
        if (videoIdMatch && videoIdMatch[1]) {
          window.location.href = `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
        } else {
          alert("No random video found. Try again!");
        }
      })
      .catch((err) => {
        console.error("Error fetching random video:", err);
        alert(
          "Failed to fetch a random video. Check your connection or try again."
        );
      });
  }

  function addRandomButton() {
    const navBar = document.querySelector("#end");
    if (navBar && !document.querySelector("#random-video-btn")) {
      const button = document.createElement("button");
      button.id = "random-video-btn";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 640 512");
      svg.style.width = "20px";
      svg.style.height = "20px";
      svg.style.fill = "currentColor";

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M274.9 34.3c-28.1-28.1-73.7-28.1-101.8 0L34.3 173.1c-28.1 28.1-28.1 73.7 0 101.8L173.1 413.7c28.1 28.1 73.7 28.1 101.8 0L413.7 274.9c28.1-28.1 28.1-73.7 0-101.8L274.9 34.3zM200 224a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM96 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 376a24 24 0 1 1 0-48 24 24 0 1 1 0 48zM352 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 120a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm96 328c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-114.3 0c11.6 36 3.1 77-25.4 105.5L320 413.8l0 34.2zM480 328a24 24 0 1 1 0 48 24 24 0 1 1 0-48z");
      
      svg.appendChild(path);
      button.appendChild(svg);

      button.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                color: white;
                background-color: #272727;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                margin-right: 10px;
                box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
                transition: background-color 0.3s ease;
                min-width: 36px;
                min-height: 36px;
            `;
      button.onmouseover = () => {
        button.style.backgroundColor = "#383838";
      };
      button.onmouseout = () => {
        button.style.backgroundColor = "#272727";
      };
      button.onclick = goToRandomVideo;

      navBar.prepend(button);
    }
  }

  const observer = new MutationObserver(addRandomButton);
  observer.observe(document.body, { childList: true, subtree: true });

  addRandomButton();
})();
