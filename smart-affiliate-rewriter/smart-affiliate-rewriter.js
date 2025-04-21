// ==UserScript==
// @name         Smart Affiliate Rewriter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically adds your affiliate IDs to product links you share via the web
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";

  // Font Awesome SVG icons
  const SVG_AFFILIATE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18"><path d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5L0 80C0 53.5 21.5 32 48 32l149.5 0c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>`;
  const SVG_CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20"><path fill="#888" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;
  const SVG_DELETE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18"><path fill="#b00" d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>`;

  // Default affiliate configurations
  const DEFAULT_AFFILIATE_MAP = {
    // Shopping sites
    "amazon.": { tag: "myaffiliate-20", param: "tag" },
    "walmart.com": { tag: "12345", param: "affiliateid" },
    "target.com": { tag: "targetid", param: "afid" },
    "bestbuy.com": { tag: "bestbuyid", param: "aid" },
    "ebay.com": { tag: "ebayid", param: "campid" },
    "etsy.com": { tag: "etsyid", param: "ref" },
    "newegg.com": { tag: "neweggid", param: "cm_mmc" },

    // Travel sites
    "booking.com": { tag: "bookingid", param: "aid" },
    "hotels.com": { tag: "hotelsid", param: "rffrid" },
    "expedia.com": { tag: "expediaid", param: "affcid" },

    // Others
    "aliexpress.com": { tag: "aliid", param: "aff_id" },
    "wayfair.com": { tag: "wayfairid", param: "refid" },
  };

  // Get stored settings or use defaults
  let AFFILIATE_MAP = GM_getValue("affiliateMap", DEFAULT_AFFILIATE_MAP);
  let ENABLED = GM_getValue("enabled", true);

  /**
   * Find matching rule for a given hostname
   * @param {string} host - The hostname to check
   * @returns {string|undefined} The matching rule key or undefined
   */
  const findRule = (host) => {
    return Object.keys(AFFILIATE_MAP).find((key) =>
      key.endsWith(".") ? host.includes(key) : host.endsWith(key)
    );
  };

  /**
   * Rewrite a URL with affiliate parameters
   * @param {string} raw - The URL to rewrite
   * @returns {string|null} The rewritten URL or null if no change
   */
  const rewrite = (raw) => {
    if (!raw || typeof raw !== "string" || !raw.startsWith("http")) return null;

    let url;
    try {
      url = new URL(raw);
    } catch {
      return null;
    }

    const ruleKey = findRule(url.hostname);
    if (!ruleKey || !ENABLED) return null;

    const rule = AFFILIATE_MAP[ruleKey];

    // Skip if the URL already has our tag or another affiliate tag
    if (url.searchParams.has(rule.param)) {
      const currentValue = url.searchParams.get(rule.param);
      // If it's already our tag, no need to modify
      if (currentValue === rule.tag || currentValue.includes(rule.tag)) {
        return null;
      }
    }

    // Add our affiliate tag
    url.searchParams.set(rule.param, rule.tag);
    const newUrl = url.toString();
    return newUrl !== raw ? newUrl : null;
  };

  /**
   * Handle copy events to modify clipboard text if it's a URL
   */
  document.addEventListener(
    "copy",
    (e) => {
      if (!ENABLED) return;

      const cb = e.clipboardData || window.clipboardData;
      const text = cb.getData("text");

      // Check if text looks like a URL
      if (!text || !text.match(/^https?:\/\//i)) return;

      const mod = rewrite(text);
      if (mod) {
        e.preventDefault();
        cb.setData("text/plain", mod);
        console.info("[AffiliateHelper] Link optimized:", mod);
      }
    },
    true
  );

  /**
   * Process a single anchor element
   * @param {HTMLAnchorElement} a - The anchor element to process
   */
  const patchAnchor = (a) => {
    if (!ENABLED || !a || !a.href || a.dataset.affiliateRewritten === "1")
      return;

    // Early bail-out: check if domain is in map before URL parsing
    let host;
    try {
      host = new URL(a.href).hostname;
    } catch {
      return;
    }

    if (!findRule(host)) return;

    const mod = rewrite(a.href);
    if (mod) {
      a.href = mod;
      a.dataset.affiliateRewritten = "1";
    }
  };

  /**
   * Scan page for links to rewrite
   */
  const scanPage = () => {
    if (!ENABLED) return;
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(patchAnchor);
  };

  // Initial page scan
  scanPage();

  // Batch process DOM mutations for better performance
  let mutationTimeout = null;
  let pendingNodes = new Set();

  const processPendingNodes = () => {
    pendingNodes.forEach((node) => {
      if (node.nodeType === 1) {
        if (node.matches?.('a[href^="http"]')) patchAnchor(node);
        node.querySelectorAll?.('a[href^="http"]').forEach(patchAnchor);
      }
    });
    pendingNodes.clear();
    mutationTimeout = null;
  };

  new MutationObserver((mutations) => {
    if (!ENABLED) return;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        pendingNodes.add(node);
      });
    });

    if (!mutationTimeout) {
      mutationTimeout = setTimeout(processPendingNodes, 100);
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Register menu commands
  GM_registerMenuCommand("Toggle Affiliate Helper", () => {
    ENABLED = !ENABLED;
    GM_setValue("enabled", ENABLED);
    alert(`Affiliate Helper is now ${ENABLED ? "enabled" : "disabled"}`);
  });

  GM_registerMenuCommand("Add/Edit Affiliate Link", () => {
    const domain = prompt("Enter domain (e.g., amazon.com or amazon.):", "");
    if (!domain) return;

    const paramName = prompt(
      "Enter parameter name (e.g., tag, ref, affiliateid):",
      ""
    );
    if (!paramName) return;

    const affiliateID = prompt("Enter your affiliate ID for this site:", "");
    if (!affiliateID) return;

    AFFILIATE_MAP[domain] = { param: paramName, tag: affiliateID };
    GM_setValue("affiliateMap", AFFILIATE_MAP);
    alert(`Affiliate rule added for ${domain}`);
  });

  GM_registerMenuCommand("Show Current Affiliate Settings", () => {
    let message = "Current Affiliate Settings:\n\n";

    Object.entries(AFFILIATE_MAP).forEach(([domain, config]) => {
      message += `${domain}: ${config.param}=${config.tag}\n`;
    });

    alert(message);
  });

  GM_registerMenuCommand("Reset to Default Settings", () => {
    if (confirm("Reset all affiliate settings to defaults?")) {
      AFFILIATE_MAP = DEFAULT_AFFILIATE_MAP;
      GM_setValue("affiliateMap", AFFILIATE_MAP);
      alert("Settings reset to defaults");
    }
  });

  /**
   * Add unobtrusive status indicator
   */
  const addStatusIndicator = () => {
    const indicator = document.createElement("div");
    indicator.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.1);
      color: #666;
      padding: 3px 6px;
      border-radius: 3px;
      font-size: 10px;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    `;
    indicator.textContent = "Affiliate Helper Active";
    indicator.id = "affiliate-helper-indicator";

    const hoverArea = document.createElement("div");
    hoverArea.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100px;
      height: 40px;
      z-index: 9998;
      background: transparent;
    `;

    hoverArea.addEventListener("mouseenter", () => {
      indicator.style.opacity = "1";
    });
    hoverArea.addEventListener("mouseleave", () => {
      indicator.style.opacity = "0";
    });

    document.body.appendChild(indicator);
    document.body.appendChild(hoverArea);
  };

  /**
   * Create floating UI for affiliate tag management
   */
  const createAffiliateManagerUI = () => {
    // Floating button with SVG icon ONLY (no emoji/text fallback)
    const btn = document.createElement("button");
    btn.innerHTML = `
      <span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;">${SVG_AFFILIATE}</span>
      <span style="vertical-align:middle;margin-left:6px;font-weight:600;letter-spacing:0.2px;">Affiliate</span>
    `;
    btn.style.cssText = `
      position: fixed;
      bottom: 60px;
      right: 20px;
      z-index: 10000;
      background: #fff;
      color: #333;
      border: 1px solid #bbb;
      border-radius: 20px;
      padding: 8px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      font-size: 14px;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: inherit;
    `;
    btn.addEventListener("mouseenter", () => (btn.style.opacity = "1"));
    btn.addEventListener("mouseleave", () => (btn.style.opacity = "0.8"));

    // Modal overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.25);
      z-index: 10001;
      display: none;
      align-items: center;
      justify-content: center;
    `;

    // Modal window (declare only once)
    const modal = document.createElement("div");
    modal.style.cssText = `
      background: #fff;
      border-radius: 8px;
      padding: 24px 20px 16px 20px;
      min-width: 320px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.16);
      position: relative;
      font-family: inherit;
    `;

    // Close button with SVG
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = SVG_CLOSE;
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px; right: 12px;
      background: none; border: none;
      padding: 0;
      font-size: 0;
      color: #888;
      cursor: pointer;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    `;
    closeBtn.onmouseenter = () => (closeBtn.style.background = "#eee");
    closeBtn.onmouseleave = () => (closeBtn.style.background = "none");
    closeBtn.onclick = () => (overlay.style.display = "none");
    modal.appendChild(closeBtn);

    // Title
    const title = document.createElement("h3");
    title.textContent = "Affiliate Tag Manager";
    title.style.margin = "0 0 14px 0";
    title.style.fontSize = "18px";
    modal.appendChild(title);

    // Rules list
    const rulesList = document.createElement("div");
    modal.appendChild(rulesList);

    // Add/Edit form
    const form = document.createElement("form");
    form.style.marginTop = "12px";
    form.innerHTML = `
      <input type="text" name="domain" placeholder="Domain (e.g. amazon.com)" required style="width:110px; margin-right:4px;">
      <input type="text" name="param" placeholder="Param (e.g. tag)" required style="width:70px; margin-right:4px;">
      <input type="text" name="tag" placeholder="Affiliate Tag" required style="width:90px; margin-right:4px;">
      <button type="submit" style="padding:4px 10px;">Add/Edit</button>
    `;
    modal.appendChild(form);

    // Helper
    const helper = document.createElement("div");
    helper.style.cssText = "font-size: 11px; color: #888; margin-top: 8px;";
    helper.textContent =
      "Add a new rule or edit an existing one by entering the same domain.";
    modal.appendChild(helper);

    /**
     * Render affiliate rules in the UI
     */
    function renderRules() {
      rulesList.innerHTML = "";
      const map = GM_getValue("affiliateMap", DEFAULT_AFFILIATE_MAP);

      if (!Object.keys(map).length) {
        rulesList.textContent = "No affiliate rules set.";
        return;
      }

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.fontSize = "13px";

      Object.entries(map).forEach(([domain, rule]) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${domain}</td>
          <td>${rule.param}</td>
          <td>${rule.tag}</td>
          <td><button data-domain="${domain}" title="Delete" style="background:none; border:none; cursor:pointer; padding:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center; transition: background 0.15s;">${SVG_DELETE}</button></td>
        `;

        row.querySelector("button").onclick = (e) => {
          e.preventDefault();
          if (confirm(`Delete rule for ${domain}?`)) {
            const newMap = GM_getValue("affiliateMap", DEFAULT_AFFILIATE_MAP);
            delete newMap[domain];
            GM_setValue("affiliateMap", newMap);
            renderRules();
          }
        };

        table.appendChild(row);
      });

      rulesList.appendChild(table);
    }

    // Form submit handler
    form.onsubmit = (e) => {
      e.preventDefault();
      const domain = form.domain.value.trim();
      const param = form.param.value.trim();
      const tag = form.tag.value.trim();

      if (!domain || !param || !tag) return;

      const map = GM_getValue("affiliateMap", DEFAULT_AFFILIATE_MAP);
      map[domain] = { param, tag };
      GM_setValue("affiliateMap", map);

      renderRules();
      form.reset();
    };

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.appendChild(btn);

    btn.onclick = () => {
      renderRules();
      overlay.style.display = "flex";
    };
  };

  // Initialize UI components with a slight delay
  setTimeout(addStatusIndicator, 2000);
  setTimeout(createAffiliateManagerUI, 1000);

  console.log("Smart Affiliate Rewriter initialized");
})();
