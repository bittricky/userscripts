// ==UserScript==
// @name         Website Value Checker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shows the estimated value of the current website in USD
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      www.worthofweb.com
// ==/UserScript==

(function () {
  "use strict";

  const valueDisplay = document.createElement("div");
  valueDisplay.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        gap: 5px;
    `;
  valueDisplay.innerHTML = `
        <div>Checking website stats...</div>
        <div style="font-size: 12px; color: #aaa;">Daily earnings: Loading...</div>
    `;
  document.body.appendChild(valueDisplay);

  // Get current hostname
  const hostname = window.location.hostname;

  // Function to format number as currency
  function formatCurrency(number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(number);
  }

  GM_xmlhttpRequest({
    method: "GET",
    url: `https://www.worthofweb.com/website-value/${hostname}/`,
    onload: function (response) {
      const parser = new DOMParser();

      // Extract website value and daily earnings
      const websiteValue = response.responseText.match(/\$[\d,]+(?:\.\d{2})?/);
      const dailyEarnings = response.responseText.match(
        /Daily Revenue[\s\S]*?(\$[\d,]+(?:\.\d{2})?)/i
      );

      let valueText = "Not Available";
      let earningsText = "Not Available";

      if (websiteValue) {
        valueText = websiteValue[0];
      }
      if (dailyEarnings && dailyEarnings[1]) {
        earningsText = dailyEarnings[1];
      }

      valueDisplay.innerHTML = `
                <div>Est. Website Value: ${valueText}</div>
                <div style="font-size: 12px; color: #aaa;">Daily Earnings: ${earningsText}</div>
            `;
    },
    onerror: function () {
      valueDisplay.innerHTML = `
                <div>Error fetching website stats</div>
                <div style="font-size: 12px; color: #aaa;">Unable to load data</div>
            `;
    },
  });
})();
