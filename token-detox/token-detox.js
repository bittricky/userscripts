// ==UserScript==
// @name         Token Detox
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Monitors AI usage patterns and intervenes when your perception/attention is being hijacked.
// @author       Mitul Patel
// @match        https://claude.ai/*
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://gemini.google.com/*
// @match        https://copilot.microsoft.com/*
// @match        https://www.perplexity.ai/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  const CONFIG = {
    // Daily thresholds (minutes)
    softThreshold: 60,       // First gentle nudge
    hardThreshold: 120,      // Stronger intervention
    // Message rate (msgs per minute to flag as compulsive loop)
    msgRateThreshold: 4,
    msgRateWindow: 60,       // seconds
    // Tab switching (returns per hour to flag)
    tabSwitchThreshold: 15,
    // Cooldown gate after dismissal (seconds) — 0 = disabled
    cooldownSeconds: 0,
    // Sprint mode duration (minutes)
    sprintDuration: 60,
    // Late-night flag (24hr)
    lateNightStart: 23,
    lateNightEnd: 5,
    // Storage keys
    keys: {
      dailyTime:    'apg_daily_time',
      dailyDate:    'apg_daily_date',
      weeklyLog:    'apg_weekly_log',
      sprintUntil:  'apg_sprint_until',
      lastDismiss:  'apg_last_dismiss',
      msgLog:       'apg_msg_log',
      tabLog:       'apg_tab_log',
    },
  };

  // ─── STATE ─────────────────────────────────────────────────────────────────
  const state = {
    sessionStart: Date.now(),
    sessionActive: true,
    lastActivityAt: Date.now(),
    bannerShown: false,
    bannerLevel: 0,   // 0=none 1=soft 2=hard
    msgTimestamps: [],
    tabTimestamps: [],
    tickInterval: null,
    msgObserver: null,
    inCooldown: false,
  };

  // ─── STORAGE HELPERS ───────────────────────────────────────────────────────
  function storageGet(key, fallback = null) {
    try { return GM_getValue(key, fallback); } catch { return fallback; }
  }
  function storageSet(key, val) {
    try { GM_setValue(key, val); } catch {}
  }

  // ─── DAILY TIME TRACKING ───────────────────────────────────────────────────
  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getDailyMinutes() {
    const storedDate = storageGet(CONFIG.keys.dailyDate, '');
    if (storedDate !== todayKey()) {
      // New day — archive yesterday then reset
      archiveDay(storedDate, storageGet(CONFIG.keys.dailyTime, 0));
      storageSet(CONFIG.keys.dailyDate, todayKey());
      storageSet(CONFIG.keys.dailyTime, 0);
      return 0;
    }
    return storageGet(CONFIG.keys.dailyTime, 0);
  }

  function addMinutes(mins) {
    getDailyMinutes(); // ensure date is current
    const current = storageGet(CONFIG.keys.dailyTime, 0);
    storageSet(CONFIG.keys.dailyTime, current + mins);
  }

  function archiveDay(date, minutes) {
    if (!date || !minutes) return;
    const log = storageGet(CONFIG.keys.weeklyLog, []);
    log.push({ date, minutes });
    // Keep last 28 days
    if (log.length > 28) log.splice(0, log.length - 28);
    storageSet(CONFIG.keys.weeklyLog, log);
  }

  // ─── MESSAGE RATE DETECTION ────────────────────────────────────────────────
  function observeMessages() {
    // Different selectors per platform
    const selectors = {
      'claude.ai':           'button[aria-label="Send message"]',
      'chatgpt.com':         'button[data-testid="send-button"]',
      'chat.openai.com':     'button[data-testid="send-button"]',
      'gemini.google.com':   'button.send-button, mat-icon[data-mat-icon-name="send"]',
      'copilot.microsoft.com': 'button[aria-label="Submit"]',
      'perplexity.ai':       'button[aria-label="Submit"]',
    };

    const host = location.hostname.replace('www.', '');
    const selector = Object.entries(selectors).find(([k]) => host.includes(k))?.[1];
    if (!selector) return;

    // Click listener on document (covers dynamic button re-renders)
    document.addEventListener('click', (e) => {
      if (e.target.closest(selector)) {
        state.msgTimestamps.push(Date.now());
        state.lastActivityAt = Date.now();
        checkMsgRate();
      }
    }, true);

    // Also watch for Enter key sends
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const active = document.activeElement;
        if (active && (active.tagName === 'TEXTAREA' || active.getAttribute('contenteditable'))) {
          state.msgTimestamps.push(Date.now());
          state.lastActivityAt = Date.now();
        }
      }
    }, true);
  }

  function checkMsgRate() {
    const windowMs = CONFIG.msgRateWindow * 1000;
    const cutoff = Date.now() - windowMs;
    state.msgTimestamps = state.msgTimestamps.filter(t => t > cutoff);
    return state.msgTimestamps.length;
  }

  // ─── TAB FOCUS TRACKING ────────────────────────────────────────────────────
  function initTabTracking() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        state.tabTimestamps.push(Date.now());
        state.lastActivityAt = Date.now();
      } else {
        // Tab hidden — pause session timer
        state.sessionActive = false;
      }
    });

    document.addEventListener('focus', () => {
      state.sessionActive = true;
      state.lastActivityAt = Date.now();
    });

    document.addEventListener('blur', () => {
      state.sessionActive = false;
    });
  }

  function getTabSwitchesPerHour() {
    const hourAgo = Date.now() - 3600000;
    state.tabTimestamps = state.tabTimestamps.filter(t => t > hourAgo);
    return state.tabTimestamps.length;
  }

  // ─── SIGNAL SCORER ─────────────────────────────────────────────────────────
  // Returns 0–100 concern score
  function computeScore(dailyMins) {
    let score = 0;

    // Time component (0–50)
    if (dailyMins >= CONFIG.hardThreshold) {
      score += 50;
    } else if (dailyMins >= CONFIG.softThreshold) {
      score += 25 + 25 * ((dailyMins - CONFIG.softThreshold) / (CONFIG.hardThreshold - CONFIG.softThreshold));
    }

    // Message rate component (0–25)
    const msgsPerMin = checkMsgRate() / (CONFIG.msgRateWindow / 60);
    if (msgsPerMin >= CONFIG.msgRateThreshold) score += 25;
    else if (msgsPerMin >= CONFIG.msgRateThreshold / 2) score += 12;

    // Tab switching component (0–15)
    const tabRate = getTabSwitchesPerHour();
    if (tabRate >= CONFIG.tabSwitchThreshold) score += 15;
    else if (tabRate >= CONFIG.tabSwitchThreshold / 2) score += 7;

    // Late night bonus (0–10)
    const h = new Date().getHours();
    if (h >= CONFIG.lateNightStart || h < CONFIG.lateNightEnd) score += 10;

    return Math.min(100, Math.round(score));
  }

  // ─── SPRINT MODE ───────────────────────────────────────────────────────────
  function isSprintActive() {
    const until = storageGet(CONFIG.keys.sprintUntil, 0);
    return Date.now() < until;
  }

  function activateSprint() {
    const until = Date.now() + CONFIG.sprintDuration * 60 * 1000;
    storageSet(CONFIG.keys.sprintUntil, until);
    removeBanner();
    showToast(`Sprint mode active for ${CONFIG.sprintDuration} min. Interventions paused.`);
  }

  // ─── COOLDOWN GATE ─────────────────────────────────────────────────────────
  function startCooldown() {
    if (!CONFIG.cooldownSeconds || state.inCooldown) return;
    state.inCooldown = true;

    const inputSelectors = [
      'textarea', '[contenteditable="true"]', 'input[type="text"]'
    ];

    let overlayShown = false;
    inputSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.offsetParent === null) return; // hidden
        el.setAttribute('data-apg-disabled', '1');
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.4';
        overlayShown = true;
      });
    });

    if (overlayShown) {
      showToast(`Input paused for ${CONFIG.cooldownSeconds}s. Breathe.`, CONFIG.cooldownSeconds * 1000);
    }

    setTimeout(() => {
      inputSelectors.forEach(sel => {
        document.querySelectorAll('[data-apg-disabled]').forEach(el => {
          el.removeAttribute('data-apg-disabled');
          el.style.pointerEvents = '';
          el.style.opacity = '';
        });
      });
      state.inCooldown = false;
    }, CONFIG.cooldownSeconds * 1000);
  }

  // ─── STYLES ────────────────────────────────────────────────────────────────
  GM_addStyle(`
    #apg-banner {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      width: 340px;
      background: #0f0f0f;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 20px 20px 16px;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 12px;
      color: #c8c8c8;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      animation: apg-slide-in 0.25s cubic-bezier(0.16,1,0.3,1) forwards;
      line-height: 1.5;
    }
    #apg-banner.apg-level-2 {
      border-color: #4a2a2a;
      background: #110d0d;
    }
    @keyframes apg-slide-in {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes apg-slide-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to   { opacity: 0; transform: translateY(8px) scale(0.97); }
    }
    #apg-banner .apg-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    #apg-banner .apg-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #e5c07b;
      flex-shrink: 0;
    }
    #apg-banner.apg-level-2 .apg-dot {
      background: #e06c75;
    }
    #apg-banner .apg-title {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #555;
      font-weight: 500;
    }
    #apg-banner .apg-close {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      color: #444;
      font-size: 14px;
      padding: 0;
      line-height: 1;
      transition: color 0.15s;
    }
    #apg-banner .apg-close:hover { color: #888; }
    #apg-banner .apg-message {
      font-size: 13px;
      color: #c8c8c8;
      margin-bottom: 14px;
      line-height: 1.6;
    }
    #apg-banner .apg-stats {
      display: flex;
      gap: 12px;
      margin-bottom: 14px;
    }
    #apg-banner .apg-stat {
      flex: 1;
      background: #1a1a1a;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11px;
    }
    #apg-banner .apg-stat-val {
      font-size: 18px;
      font-weight: 600;
      color: #e5c07b;
      display: block;
      line-height: 1.2;
    }
    #apg-banner.apg-level-2 .apg-stat-val {
      color: #e06c75;
    }
    #apg-banner .apg-stat-label {
      color: #555;
      font-size: 10px;
      letter-spacing: 0.05em;
    }
    #apg-banner .apg-actions {
      display: flex;
      gap: 8px;
    }
    #apg-banner .apg-btn {
      flex: 1;
      padding: 7px 10px;
      border-radius: 6px;
      border: 1px solid #2a2a2a;
      cursor: pointer;
      font-family: inherit;
      font-size: 11px;
      letter-spacing: 0.05em;
      transition: all 0.15s;
      text-align: center;
    }
    #apg-banner .apg-btn-dismiss {
      background: transparent;
      color: #555;
    }
    #apg-banner .apg-btn-dismiss:hover {
      background: #1a1a1a;
      color: #888;
    }
    #apg-banner .apg-btn-sprint {
      background: #1a1a1a;
      color: #c8c8c8;
      border-color: #333;
    }
    #apg-banner .apg-btn-sprint:hover {
      background: #252525;
    }
    #apg-banner .apg-btn-summary {
      background: #1a1a1a;
      color: #c8c8c8;
      border-color: #333;
    }
    #apg-banner .apg-btn-summary:hover {
      background: #252525;
    }
    #apg-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      background: #0f0f0f;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 10px 18px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
      color: #888;
      animation: apg-slide-in 0.2s ease forwards;
      pointer-events: none;
    }
    #apg-summary-modal {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: apg-fade-in 0.2s ease forwards;
    }
    @keyframes apg-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    #apg-summary-inner {
      background: #0f0f0f;
      border: 1px solid #2a2a2a;
      border-radius: 14px;
      padding: 28px;
      width: 420px;
      max-width: 90vw;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
      color: #c8c8c8;
    }
    #apg-summary-inner h2 {
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #555;
      margin: 0 0 20px;
    }
    .apg-week-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .apg-week-label {
      width: 80px;
      color: #555;
      font-size: 11px;
      flex-shrink: 0;
    }
    .apg-week-bar-wrap {
      flex: 1;
      background: #1a1a1a;
      border-radius: 4px;
      height: 8px;
      overflow: hidden;
    }
    .apg-week-bar {
      height: 100%;
      border-radius: 4px;
      background: #e5c07b;
      transition: width 0.4s ease;
    }
    .apg-week-bar.over { background: #e06c75; }
    .apg-week-mins {
      width: 52px;
      text-align: right;
      color: #666;
      font-size: 11px;
    }
    .apg-summary-close {
      margin-top: 22px;
      display: block;
      width: 100%;
      padding: 9px;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      color: #888;
      font-family: inherit;
      font-size: 11px;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.15s;
    }
    .apg-summary-close:hover { background: #222; }
  `);

  // ─── BANNER ────────────────────────────────────────────────────────────────
  const MESSAGES = {
    soft: [
      "You've been here a while. The answer you need might not be in here.",
      "Running at depth for a while now. Consider a deliberate break.",
      "Consistent use detected. Is this session still intentional?",
    ],
    hard: [
      "Significant AI time today. This is a signal, not a judgment.",
      "Your attention has been in here most of the day. Might be worth stepping out.",
      "High usage pattern flagged. External context tends to solve things faster than more prompting.",
    ],
  };

  function randomMsg(level) {
    const pool = level >= 2 ? MESSAGES.hard : MESSAGES.soft;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function showBanner(score, dailyMins) {
    if (document.getElementById('apg-banner')) return;
    const level = score >= 70 ? 2 : 1;
    state.bannerShown = true;
    state.bannerLevel = level;

    const msgRate = checkMsgRate();
    const tabRate = getTabSwitchesPerHour();

    const banner = document.createElement('div');
    banner.id = 'apg-banner';
    if (level === 2) banner.classList.add('apg-level-2');

    banner.innerHTML = `
      <div class="apg-header">
        <span class="apg-dot"></span>
        <span class="apg-title">AI Psychosis Guard</span>
        <button class="apg-close" title="Dismiss">✕</button>
      </div>
      <div class="apg-message">${randomMsg(level)}</div>
      <div class="apg-stats">
        <div class="apg-stat">
          <span class="apg-stat-val">${Math.round(dailyMins)}m</span>
          <span class="apg-stat-label">today</span>
        </div>
        <div class="apg-stat">
          <span class="apg-stat-val">${msgRate}</span>
          <span class="apg-stat-label">msgs/min window</span>
        </div>
        <div class="apg-stat">
          <span class="apg-stat-val">${tabRate}</span>
          <span class="apg-stat-label">tab returns/hr</span>
        </div>
      </div>
      <div class="apg-actions">
        <button class="apg-btn apg-btn-dismiss">Dismiss</button>
        <button class="apg-btn apg-btn-sprint">Sprint ${CONFIG.sprintDuration}m</button>
        <button class="apg-btn apg-btn-summary">History</button>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector('.apg-close').addEventListener('click', () => removeBanner(true));
    banner.querySelector('.apg-btn-dismiss').addEventListener('click', () => removeBanner(true));
    banner.querySelector('.apg-btn-sprint').addEventListener('click', () => activateSprint());
    banner.querySelector('.apg-btn-summary').addEventListener('click', () => showSummary());
  }

  function removeBanner(withCooldown = false) {
    const banner = document.getElementById('apg-banner');
    if (!banner) return;
    banner.style.animation = 'apg-slide-out 0.2s ease forwards';
    setTimeout(() => banner.remove(), 200);
    state.bannerShown = false;
    storageSet(CONFIG.keys.lastDismiss, Date.now());
    if (withCooldown && CONFIG.cooldownSeconds > 0) startCooldown();
  }

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  function showToast(msg, duration = 3500) {
    const existing = document.getElementById('apg-toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'apg-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }

  // ─── WEEKLY SUMMARY ────────────────────────────────────────────────────────
  function showSummary() {
    const log = storageGet(CONFIG.keys.weeklyLog, []);
    const today = { date: todayKey(), minutes: getDailyMinutes() };
    const recent = [...log.slice(-6), today];
    const maxMins = Math.max(...recent.map(d => d.minutes), CONFIG.hardThreshold);

    const modal = document.createElement('div');
    modal.id = 'apg-summary-modal';

    const rows = recent.reverse().map(({ date, minutes }) => {
      const label = formatDate(date);
      const pct = Math.min(100, (minutes / maxMins) * 100);
      const over = minutes >= CONFIG.hardThreshold;
      return `
        <div class="apg-week-row">
          <span class="apg-week-label">${label}</span>
          <div class="apg-week-bar-wrap">
            <div class="apg-week-bar${over ? ' over' : ''}" style="width:${pct}%"></div>
          </div>
          <span class="apg-week-mins">${Math.round(minutes)}m</span>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div id="apg-summary-inner">
        <h2>Usage — last 7 days</h2>
        ${rows}
        <button class="apg-summary-close">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.apg-summary-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    const today = new Date();
    const diff = Math.round((today - d) / 86400000);
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // ─── MAIN TICK ─────────────────────────────────────────────────────────────
  function tick() {
    if (!document.hidden && state.sessionActive) {
      addMinutes(1 / 60); // called every second
    }

    const dailyMins = getDailyMinutes();

    // Skip if sprint active
    if (isSprintActive()) return;

    // Cooldown: suppress re-showing banner within 5 mins of dismissal
    const lastDismiss = storageGet(CONFIG.keys.lastDismiss, 0);
    const minsSinceDismiss = (Date.now() - lastDismiss) / 60000;
    if (minsSinceDismiss < 5) return;

    const score = computeScore(dailyMins);

    if (score >= 40 && !state.bannerShown) {
      showBanner(score, dailyMins);
    } else if (score < 30 && state.bannerShown) {
      removeBanner();
    }
  }

  // ─── INIT ──────────────────────────────────────────────────────────────────
  function init() {
    getDailyMinutes(); // ensure date reset on load
    initTabTracking();
    observeMessages();
    state.tickInterval = setInterval(tick, 1000);

    // Expose debug helper in console
    window.__apg = {
      status: () => ({
        dailyMins: Math.round(getDailyMinutes()),
        score: computeScore(getDailyMinutes()),
        msgRate: checkMsgRate(),
        tabRate: getTabSwitchesPerHour(),
        sprintActive: isSprintActive(),
      }),
      showSummary,
      reset: () => {
        storageSet(CONFIG.keys.dailyTime, 0);
        storageSet(CONFIG.keys.dailyDate, todayKey());
        storageSet(CONFIG.keys.weeklyLog, []);
        storageSet(CONFIG.keys.lastDismiss, 0);
        console.log('[APG] Storage reset.');
      },
    };

    console.log('[APG] AI Psychosis Guard active. __apg.status() for diagnostics.');
  }

  // Wait for page to stabilize before starting
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();
