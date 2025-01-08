// ==UserScript==
// @name         Safety Protocol
// @namespace    safety-protocol
// @version      1.0
// @description  Intelligently redirect HTTP URLs to HTTPS with additional security features
// @author       Mitul Patel
// @match        http://*/*
// @match        https://*/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==
(function () {
  "use strict";

  const CONFIG = {
    enableWhitelist: true,
    whitelistedDomains: ["localhost", "127.0.0.1"],
    logRedirects: true,
    handleMixedContent: true,
    retryFailedHttps: true,
    maxRetries: 3,
  };

  const failedAttempts = new Map();

  const isWhiteListed = (domain) => {
    return CONFIG.whitelistedDomains.some(
      (whiteDomain) =>
        domain === whiteDomain || domain.endsWith("." + whiteDomain)
    );
  };

  const handleMixedContent = () => {
    if (!CONFIG.handleMixedContent) return;

    const elem = document.querySelectorAll(
      'img[src^="http:"], script[src^="http:"], link[href^="http:"]'
    );

    elem.forEach((el) => {
      const attribute = el.hasAttribute("src") ? "src" : "href";
      const newUrl = el.getAttribute(attribute).replace(/^http:/, "https:");
      el.setAttribute(attribute, newUrl);
    });
  };

  const logRedirect = (from, to) => {
    if (!CONFIG.logRedirects) return;
    console.log(
      `🙈 [Safety Protocol] is Redirecting you from ${from} to ${to}`
    );
  };

  const redirectToHttps = () => {
    const currentUrl = window.location.href;
    const domain = window.location.hostname;

    if (window.location.protocol === "https:") {
      handleMixedContent();
      return;
    }

    if (CONFIG.enableWhitelist && isWhiteListed(domain)) {
      console.log(`🙊 [Safety Protocol] Skipping whitelisted domain ${domain}`);
    }

    const attempts = failedAttempts.get(currentUrl) || 0;

    if (attempts >= CONFIG.maxRetries) {
      console.warn(
        `🙉 [Safety Protocol] Max retries reached for ${currentUrl}`
      );
      return;
    }

    const httpsUrl = currentUrl.replace(/^http:/, "https:");

    fetch(httpsUrl, { method: "HEAD", mode: "no-cors" })
      .then(() => {
        logRedirect(currentUrl, httpsUrl);
        window.location.replace(httpsUrl);
      })
      .catch((error) => {
        console.warn(
          `🍌 [Safety Protocol] HTTPS not available for ${domain}:`,
          error
        );

        failedAttempts.set(currentUrl, attempts + 1);

        if (CONFIG.retryFailedHttps && attempts < CONFIG.maxRetries) {
          setTimeout(redirectToHttps, 1000 * (attempts + 1));
        }
      });
  };

  /**
   * Registers a menu command in Tampermonkey's dropdown menu for this userscript.
   * GM_registerMenuCommand is a Tampermonkey API function that adds a clickable menu item
   * to the userscript's context menu, accessible from the Tampermonkey icon.
   * 
   * This specific command toggles the whitelist feature on/off:
   * - Updates CONFIG.enableWhitelist state
   * - Persists the setting using GM_setValue
   * - Logs the new state to console
   */
  GM_registerMenuCommand("Enable Safety Protocol", () => {
    CONFIG.enableWhitelist = !CONFIG.enableWhitelist;
    GM_setValue("enableWhitelist", CONFIG.enableWhitelist);
    console.log(
      `🐵 [Safety Protocol] Whitelist ${
        CONFIG.enableWhitelist ? "enabled" : "disabled"
      }`
    );
  });

  const initialize = () => {
    const storedWhitelist = GM_getValue("enableWhitelist");
    if (storedWhitelist !== undefined) {
      CONFIG.enableWhitelist = storedWhitelist;
    }
  };

  initialize();
  redirectToHttps();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handleMixedContent);
  } else {
    handleMixedContent();
  }
})();
