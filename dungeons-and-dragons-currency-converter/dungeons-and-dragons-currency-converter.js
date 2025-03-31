// ==UserScript==
// @name         D&D 5e Currency Converter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds a D&D 5e currency converter to any webpage for easy conversion between platinum, gold, electrum, silver, and copper
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  // Free Font Awesome SVG icons
  const svgIcons = {
    close:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>',
    exchange:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M32 96l320 0V32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160L32 160c-17.7 0-32-14.3-32-32s14.3-32 32-32zM480 352c17.7 0 32 14.3 32 32s-14.3 32-32 32H160v64c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-96-96c-6-6-9.4-14.1-9.4-22.6s3.4-16.6 9.4-22.6l96-96c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 64H480z"/></svg>',
    coins:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V336zm0-96V208c0-1.8-.1-3.5-.2-5.3c20 4.8 37.8 11.1 52.4 18.5c27.3 13.8 43.8 31.6 43.8 50.9v35.6c-12.5-10.3-27.6-18.7-43.9-25.5c-22-9.1-47.9-16.1-76.2-20.5c13.5-13.6 24.1-31.6 24.1-53.4zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"/></svg>',
  };

  // D&D 5e Currency Exchange Rates
  const currencyRates = {
    pp: { value: 10, name: "Platinum" },
    gp: { value: 1, name: "Gold" },
    ep: { value: 0.5, name: "Electrum" },
    sp: { value: 0.1, name: "Silver" },
    cp: { value: 0.01, name: "Copper" },
  };

  const style = `
    #dnd-formula {
      font-size: 13px;
      text-align: center;
      margin-bottom: 5px;
      color: #4B0082;
      font-style: italic;
    }
    #dnd-rates {
      font-size: 12px;
      text-align: center;
      margin-bottom: 12px;
      color: #555;
      background: #FFFACD;
      padding: 5px;
      border-radius: 4px;
      border: 1px dashed #FFD700;
    }
    #dnd-toggle-btn {
      position: fixed;
      bottom: 30px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: #663399;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 9998;
      transition: all 0.3s ease;
    }
    #dnd-toggle-btn:hover {
      transform: scale(1.05);
      background: #4B0082;
    }
    #dnd-toggle-btn svg {
      width: 24px;
      height: 24px;
      fill: white;
    }
    #dnd-currency-converter {
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
      border: 1px solid #FFD700;
    }
    #dnd-currency-converter.hidden {
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
    }
    #dnd-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    #dnd-title {
      font-weight: 600;
      color: #663399;
      font-size: 16px;
    }
    #dnd-controls {
      display: flex;
      gap: 8px;
    }
    .dnd-icon-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .dnd-icon-btn:hover {
      opacity: 1;
    }
    .dnd-icon-btn svg {
      width: 14px;
      height: 14px;
      fill: #555;
    }
    #dnd-currency-converter input {
      width: 100%;
      margin-bottom: 12px;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
      outline: none;
      background-color: white;
      box-sizing: border-box;
      height: 40px;
    }
    #dnd-currency-converter input:focus {
      border-color: #663399;
    }
    #dnd-currency-converter select {
      width: 100%;
      margin-bottom: 12px;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
      outline: none;
      background-color: white;
      box-sizing: border-box;
      height: 40px;
    }
    #dnd-currency-converter select:focus {
      border-color: #663399;
    }
    .dnd-input-container {
      position: relative;
      margin-bottom: 12px;
    }
    #dnd-exchange {
      display: flex;
      justify-content: center;
      margin-bottom: 8px;
      padding-bottom: 5%;
    }
    #dnd-exchange-btn {
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
    #dnd-exchange-btn:hover {
      background: #f0f0f0;
    }
    #dnd-exchange-btn svg {
      width: 18px;
      height: 18px;
      fill: #663399;
    }
    #convert {
      width: 100%;
      padding: 10px;
      cursor: pointer;
      background: #663399;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      transition: background 0.2s;
    }
    #convert:hover {
      background: #4B0082;
    }
    #result {
      margin-top: 12px;
      padding: 10px;
      background: #FFFACD;
      border-radius: 6px;
      text-align: center;
      font-weight: 500;
      color: #333;
      border: 1px solid #FFD700;
    }
    .currency-breakdown {
      margin-top: 10px;
      font-size: 13px;
      color: #555;
      text-align: left;
      padding: 5px;
      border-top: 1px dashed #ccc;
    }
    #dnd-currency-converter label {
      display: block;
      margin-bottom: 5px;
      font-size: 13px;
      font-weight: 500;
      color: #555;
    }
  `;

  GM_addStyle(style);

  const toggleBtn = document.createElement("div");
  toggleBtn.id = "dnd-toggle-btn";
  toggleBtn.innerHTML = svgIcons.coins;
  document.body.appendChild(toggleBtn);

  const widget = document.createElement("div");
  widget.id = "dnd-currency-converter";
  widget.classList.add("hidden");

  widget.innerHTML = `
    <div id="dnd-header">
      <div id="dnd-title">D&D 5e Currency Converter</div>
      <div id="dnd-controls">
        <div id="dnd-close" class="dnd-icon-btn">${svgIcons.close}</div>
      </div>
    </div>
    <div id="dnd-formula">Formula: Amount × From Value / To Value</div>
    <div id="dnd-rates">1 pp = 10 gp = 20 ep = 100 sp = 1000 cp</div>
    <label for="amount">Amount</label>
    <input type="number" id="amount" min="0" step="any" />
    <label for="from-currency">From Currency</label>
    <select id="from-currency">
      <option value="pp">Platinum (pp)</option>
      <option value="gp" selected>Gold (gp)</option>
      <option value="ep">Electrum (ep)</option>
      <option value="sp">Silver (sp)</option>
      <option value="cp">Copper (cp)</option>
    </select>
    <div id="dnd-exchange">
      <button id="dnd-exchange-btn">${svgIcons.exchange}</button>
    </div>
    <label for="to-currency">To Currency</label>
    <select id="to-currency">
      <option value="pp">Platinum (pp)</option>
      <option value="gp">Gold (gp)</option>
      <option value="ep">Electrum (ep)</option>
      <option value="sp" selected>Silver (sp)</option>
      <option value="cp">Copper (cp)</option>
    </select>
    <button id="convert">Convert</button>
    <div id="result">Enter an amount and convert</div>
  `;

  document.body.appendChild(widget);

  toggleBtn.addEventListener("click", () => {
    widget.classList.toggle("hidden");
  });

  document.getElementById("dnd-close").addEventListener("click", () => {
    widget.classList.add("hidden");
  });

  document.getElementById("dnd-exchange-btn").addEventListener("click", () => {
    const fromSelect = document.getElementById("from-currency");
    const toSelect = document.getElementById("to-currency");
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
  });

  document.getElementById("convert").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("amount").value);
    const fromCurrency = document.getElementById("from-currency").value;
    const toCurrency = document.getElementById("to-currency").value;
    const resultEl = document.getElementById("result");

    if (isNaN(amount) || amount < 0) {
      resultEl.textContent = "Please enter a valid amount";
      return;
    }

    const valueInGold = amount * currencyRates[fromCurrency].value;
    const convertedValue = valueInGold / currencyRates[toCurrency].value;

    const formattedResult = convertedValue.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });

    resultEl.innerHTML = `${amount} ${currencyRates[fromCurrency].name} = <strong>${formattedResult} ${currencyRates[toCurrency].name}</strong>`;

    if (currencyRates[fromCurrency].value > currencyRates[toCurrency].value) {
      const breakdown = getOptimalCurrencyBreakdown(valueInGold);
      let breakdownHtml = '<div class="currency-breakdown">Optimal breakdown: ';

      const parts = [];
      if (breakdown.pp > 0) parts.push(`${breakdown.pp} pp`);
      if (breakdown.gp > 0) parts.push(`${breakdown.gp} gp`);
      if (breakdown.ep > 0) parts.push(`${breakdown.ep} ep`);
      if (breakdown.sp > 0) parts.push(`${breakdown.sp} sp`);
      if (breakdown.cp > 0) parts.push(`${breakdown.cp} cp`);

      breakdownHtml += parts.join(", ") + "</div>";
      resultEl.innerHTML += breakdownHtml;
    }
  });

  function getOptimalCurrencyBreakdown(valueInGold) {
    const breakdown = {
      pp: 0,
      gp: 0,
      ep: 0,
      sp: 0,
      cp: 0,
    };

    // Convert to copper first (smallest unit)
    let remainingValue = valueInGold * 100; // 1 gp = 100 cp

    // Extract platinum (1 pp = 10 gp = 1000 cp)
    breakdown.pp = Math.floor(remainingValue / 1000);
    remainingValue -= breakdown.pp * 1000;

    // Extract gold (1 gp = 100 cp)
    breakdown.gp = Math.floor(remainingValue / 100);
    remainingValue -= breakdown.gp * 100;

    // Extract electrum (1 ep = 0.5 gp = 50 cp)
    breakdown.ep = Math.floor(remainingValue / 50);
    remainingValue -= breakdown.ep * 50;

    // Extract silver (1 sp = 0.1 gp = 10 cp)
    breakdown.sp = Math.floor(remainingValue / 10);
    remainingValue -= breakdown.sp * 10;

    // Remaining copper
    breakdown.cp = Math.round(remainingValue);

    return breakdown;
  }
})();
