// ==UserScript==
// @name         Currency Converter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a modern minimalist currency converter to any webpage
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      open.er-api.com
// ==/UserScript==

(function () {
  "use strict";

  // Free Font Awesome SVG icons
  const svgIcons = {
    close:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>',
    minimize:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>',
    expand:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>',
    exchange:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M32 96l320 0V32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160L32 160c-17.7 0-32-14.3-32-32s14.3-32 32-32zM480 352c17.7 0 32 14.3 32 32s-14.3 32-32 32H160v64c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-96-96c-6-6-9.4-14.1-9.4-22.6s3.4-16.6 9.4-22.6l96-96c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 64H480z"/></svg>',
  };

  const style = `
        #cc-toggle-btn {
            position: fixed;
            bottom: 30px;
            right: 20px;
            width: 48px;
            height: 48px;
            background: #006400;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 9998;
            transition: all 0.3s ease;
        }
        #cc-toggle-btn:hover {
            transform: scale(1.05);
            background: #004d00;
        }
        #cc-toggle-btn svg {
            width: 24px;
            height: 24px;
            fill: white;
        }
        #currency-converter {
            position: fixed;
            bottom: 90px;
            right: 20px;
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            width: 250px;
            transition: all 0.3s ease;
            opacity: 1;
            transform: translateY(0);
            border: 1px solid #e6c200;
        }
        #currency-converter.hidden {
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        }
        #cc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        #cc-title {
            font-weight: 600;
            color: #006400;
            font-size: 16px;
        }
        #cc-controls {
            display: flex;
            gap: 8px;
        }
        .cc-icon-btn {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.2s;
        }
        .cc-icon-btn:hover {
            opacity: 1;
        }
        .cc-icon-btn svg {
            width: 14px;
            height: 14px;
            fill: #555;
        }
        #currency-converter input, #currency-converter select {
            width: 100%;
            margin-bottom: 12px;
            padding: 10px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
            outline: none;
        }
        #currency-converter input:focus, #currency-converter select:focus {
            border-color: #006400;
        }
        #cc-exchange {
            display: flex;
            justify-content: center;
           margin-bottom: 8px;
        }
        #cc-exchange-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        #cc-exchange-btn:hover {
            background: #f0f0f0;
        }
        #cc-exchange-btn svg {
            width: 18px;
            height: 18px;
            fill: #006400;
        }
        #convert {
            width: 100%;
            padding: 10px;
            cursor: pointer;
            background: #006400;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.2s;
        }
        #convert:hover {
            background: #004d00;
        }
        #result {
            margin-top: 12px;
            padding: 10px;
            background: #fffbeb;
            border-radius: 6px;
            text-align: center;
            font-weight: 500;
            color: #333;
            border: 1px solid #e6c200;
        }
    `;

  GM_addStyle(style);

  const toggleBtn = document.createElement("div");
  toggleBtn.id = "cc-toggle-btn";
  toggleBtn.innerHTML = svgIcons.exchange;
  document.body.appendChild(toggleBtn);

  const widget = document.createElement("div");
  widget.id = "currency-converter";
  widget.classList.add("hidden");
  widget.innerHTML = `
        <div id="cc-header">
            <div id="cc-title">Currency Converter</div>
            <div id="cc-controls">
                <div id="cc-minimize" class="cc-icon-btn">${svgIcons.minimize}</div>
                <div id="cc-close" class="cc-icon-btn">${svgIcons.close}</div>
            </div>
        </div>
        <input type="number" id="amount" placeholder="Amount" />
        <select id="from">
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="CNY">CNY - Chinese Yuan</option>
            <option value="CHF">CHF - Swiss Franc</option>
            <option value="SGD">SGD - Singapore Dollar</option>
        </select>
        <div id="cc-exchange">
            <button id="cc-exchange-btn" title="Swap currencies">${svgIcons.exchange}</button>
        </div>
        <select id="to">
            <option value="EUR">EUR - Euro</option>
            <option value="USD">USD - US Dollar</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="CNY">CNY - Chinese Yuan</option>
            <option value="CHF">CHF - Swiss Franc</option>
            <option value="SGD">SGD - Singapore Dollar</option>
        </select>
        <button id="convert">Convert</button>
        <div id="result">Enter an amount to convert</div>
    `;

  document.body.appendChild(widget);

  toggleBtn.addEventListener("click", () => {
    widget.classList.toggle("hidden");
  });

  document.getElementById("cc-close").addEventListener("click", () => {
    widget.classList.add("hidden");
  });

  document.getElementById("cc-minimize").addEventListener("click", () => {
    widget.classList.add("hidden");
  });

  document.getElementById("cc-exchange-btn").addEventListener("click", () => {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");
    const tempValue = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tempValue;

    const amount = document.getElementById("amount").value;
    if (amount && parseFloat(amount) > 0) {
      document.getElementById("convert").click();
    }
  });

  document.getElementById("convert").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("amount").value);
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const resultEl = document.getElementById("result");

    if (!amount || amount <= 0) {
      resultEl.textContent = "Please enter a valid amount.";
      return;
    }

    resultEl.textContent = "Converting...";

    // Using GM_xmlhttpRequest to bypass CSP restrictions
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://open.er-api.com/v6/latest/${from}`,
      responseType: "json",
      onload: function (response) {
        const data = response.response;

        if (!data || data.result !== "success") {
          resultEl.textContent = "Error: Could not convert currencies.";
          return;
        }

        const rate = data.rates[to];

        if (!rate) {
          resultEl.textContent = `Error: Rate for ${to} not available.`;
          return;
        }

        const convertedAmount = amount * rate;

        resultEl.textContent = `${amount.toLocaleString()} ${from} = ${convertedAmount.toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} ${to}`;
      },
      onerror: function (error) {
        resultEl.textContent = "Error fetching conversion rate.";
        console.error("Currency conversion error:", error);
      },
    });
  });

  document.getElementById("amount").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("convert").click();
    }
  });
})();
