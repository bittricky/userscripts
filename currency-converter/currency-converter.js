// ==UserScript==
// @name         Currency Converter
// @namespace    http://tampermonkey.net/
// @version      1.1
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
            width: 320px;
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
        #currency-converter input {
            width: 100%;
            margin-bottom: 12px;
            padding: 10px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
            outline: none;
        }
        #currency-converter input:focus {
            border-color: #006400;
        }
        .cc-input-container {
            position: relative;
            margin-bottom: 12px;
        }
        .cc-error {
            color: #d32f2f;
            font-size: 12px;
            margin-top: -8px;
            margin-bottom: 8px;
            min-height: 16px;
        }
        #from, #to {
            text-transform: uppercase;
        }
        #cc-exchange {
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
            padding-bottom: 5%;
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
                <div id="cc-close" class="cc-icon-btn">${svgIcons.close}</div>
            </div>
        </div>
        <input type="number" id="amount" placeholder="Amount" />
        <div class="cc-input-container">
            <input type="text" id="from" placeholder="From Currency (e.g. USD)" maxlength="3" />
            <div id="from-error" class="cc-error"></div>
        </div>
        <div id="cc-exchange">
            <button id="cc-exchange-btn" title="Swap currencies">${svgIcons.exchange}</button>
        </div>
        <div class="cc-input-container">
            <input type="text" id="to" placeholder="To Currency (e.g. EUR)" maxlength="3" />
            <div id="to-error" class="cc-error"></div>
        </div>
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

  document.getElementById("cc-exchange-btn").addEventListener("click", () => {
    const fromInput = document.getElementById("from");
    const toInput = document.getElementById("to");
    const tempValue = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = tempValue;

    document.getElementById("from-error").textContent = "";
    document.getElementById("to-error").textContent = "";

    const amount = document.getElementById("amount").value;
    if (amount && parseFloat(amount) > 0) {
      document.getElementById("convert").click();
    }
  });

  function validateCurrency(currencyCode, elementId) {
    if (!currencyCode) {
      document.getElementById(`${elementId}-error`).textContent =
        "Please enter a currency code";
      return false;
    }

    currencyCode = currencyCode.toUpperCase();
    document.getElementById(elementId).value = currencyCode;

    if (!/^[A-Z]{3}$/.test(currencyCode)) {
      document.getElementById(`${elementId}-error`).textContent =
        "Currency code must be 3 letters";
      return false;
    }

    return true;
  }

  document.getElementById("from").addEventListener("input", () => {
    document.getElementById("from-error").textContent = "";
  });

  document.getElementById("to").addEventListener("input", () => {
    document.getElementById("to-error").textContent = "";
  });

  document.getElementById("convert").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("amount").value);
    const fromEl = document.getElementById("from");
    const toEl = document.getElementById("to");
    const from = fromEl.value.toUpperCase();
    const to = toEl.value.toUpperCase();
    const resultEl = document.getElementById("result");

    document.getElementById("from-error").textContent = "";
    document.getElementById("to-error").textContent = "";

    if (!amount || amount <= 0) {
      resultEl.textContent = "Please enter a valid amount.";
      return;
    }

    const isFromValid = validateCurrency(from, "from");
    const isToValid = validateCurrency(to, "to");

    if (!isFromValid || !isToValid) {
      resultEl.textContent = "Please fix currency code errors.";
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
          if (data && data.error && data.error.includes("not supported")) {
            document.getElementById(
              "from-error"
            ).textContent = `Currency '${from}' is not supported by the API`;
            resultEl.textContent = "Error: Invalid currency code.";
          } else {
            resultEl.textContent = "Error: Could not convert currencies.";
          }
          return;
        }

        const rate = data.rates[to];

        if (!rate) {
          document.getElementById(
            "to-error"
          ).textContent = `Currency '${to}' is not supported by the API`;
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
