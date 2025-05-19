// ==UserScript==
// @name         Content Monetization Helper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Analyzes written content, extracts keywords, suggests related topics and structural tips to boost ad revenue or affiliate conversions.
// @author       Mitul Patel
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      api.datamuse.com
// ==/UserScript==

(function () {
  ("use strict");

  // Configuration options
  const CONFIG = {
    maxKeywords: 15,
    maxRelatedTopics: 5,
    minContentLength: 100
  };

  // Expanded list of stopwords for keyword extraction
  const STOPWORDS = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "are",
    "but",
    "not",
    "you",
    "your",
    "have",
    "has",
    "will",
    "more",
    "can",
    "all",
    "our",
    "about",
    "use",
    "using",
    "in",
    "on",
    "at",
    "of",
    "to",
    "a",
    "an",
    "is",
    "it",
    "its",
    "they",
    "them",
    "their",
    "there",
    "here",
    "where",
    "when",
    "how",
    "what",
    "who",
    "which",
    "why",
    "be",
    "been",
    "being",
    "was",
    "were",
    "would",
    "should",
    "could",
    "had",
    "has",
    "have",
    "do",
    "does",
    "did",
    "just",
    "very",
    "too",
    "also",
    "now",
    "then",
    "so",
    "some",
    "such",
    "like",
    "by",
    "my",
    "we",
    "us",
    "or",
    "if",
    "as",
    "than",
    "get",
    "got",
    "i",
  ]);

  // Create suggestion panel with improved UI
  const panel = document.createElement("div");
  panel.id = "cmh-panel";
  panel.style.position = "fixed";
  panel.style.top = "0";
  panel.style.right = "0";
  panel.style.width = "380px";
  panel.style.height = "100%";
  panel.style.backgroundColor = "#fff";
  panel.style.borderLeft = "1px solid #ccc";
  panel.style.boxShadow = "-2px 0 5px rgba(0,0,0,0.1)";
  panel.style.zIndex = "100000";
  panel.style.padding = "0";
  panel.style.overflowY = "auto";
  panel.style.display = "none";
  panel.style.fontFamily = "Arial, sans-serif";
  panel.style.transition = "transform 0.3s ease-in-out";
  panel.innerHTML = `
    <div id="cmh-header" style="background: linear-gradient(135deg, #4CAF50, #2196F3); color: white; padding: 15px; position: sticky; top: 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 18px;">Monetization Helper</h2>
        <button id="cmh-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">&times;</button>
      </div>
      <div id="cmh-tabs" style="margin-top: 15px; display: flex;">
        <button class="cmh-tab cmh-tab-active" data-tab="keywords">Keywords</button>
        <button class="cmh-tab" data-tab="seo">SEO</button>
        <button class="cmh-tab" data-tab="structure">Structure</button>
      </div>
    </div>
    <div id="cmh-loading" style="display:none; padding: 20px; text-align: center;">
      <div class="cmh-spinner"></div>
      <p>Analyzing your content...</p>
    </div>
    <div id="cmh-results" style="padding: 15px;"></div>
  `;
  document.body.appendChild(panel);

  // Create toggle button
  const toggleBtn = document.createElement("div");
  toggleBtn.id = "cmh-toggle";
  toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
  toggleBtn.style.position = "fixed";
  toggleBtn.style.bottom = "20px";
  toggleBtn.style.right = "20px";
  toggleBtn.style.width = "50px";
  toggleBtn.style.height = "50px";
  toggleBtn.style.borderRadius = "50%";
  toggleBtn.style.backgroundColor = "#4CAF50";
  toggleBtn.style.color = "white";
  toggleBtn.style.display = "flex";
  toggleBtn.style.alignItems = "center";
  toggleBtn.style.justifyContent = "center";
  toggleBtn.style.cursor = "pointer";
  toggleBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  toggleBtn.style.zIndex = "99999";
  toggleBtn.style.transition =
    "transform 0.3s ease, background-color 0.3s ease";
  document.body.appendChild(toggleBtn);

  GM_addStyle(`
    #cmh-panel h2, #cmh-panel h3 { font-weight: 600; }
    #cmh-panel h3 { margin: 15px 0 10px; font-size: 16px; color: #333; }
    #cmh-results section { margin-bottom: 1.5em; background: #f9f9f9; padding: 15px; border-radius: 5px; }
    #cmh-results ul { padding-left: 20px; margin: 10px 0; }
    #cmh-results li { margin-bottom: 8px; line-height: 1.4; }
    #cmh-results .highlight { background-color: #fffde7; padding: 2px 4px; border-radius: 3px; }
    #cmh-results .score { display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; margin-right: 8px; font-weight: bold; }
    #cmh-results .score-high { background-color: #4CAF50; color: white; }
    #cmh-results .score-medium { background-color: #FFC107; color: black; }
    #cmh-results .score-low { background-color: #F44336; color: white; }
    #cmh-toggle:hover { transform: scale(1.1); background-color: #2196F3; }
    .cmh-tab { background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 4px 4px 0 0; cursor: pointer; margin-right: 2px; }
    .cmh-tab-active { background: white; color: #2196F3; font-weight: bold; }
    .cmh-spinner { border: 3px solid rgba(0,0,0,0.1); border-radius: 50%; border-top: 3px solid #2196F3; width: 30px; height: 30px; animation: cmh-spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes cmh-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .cmh-tag { display: inline-block; background: #e0f7fa; color: #00838f; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; margin-bottom: 5px; }
    .cmh-progress-bar { height: 8px; background: #e0e0e0; border-radius: 4px; margin: 5px 0 15px; }
    .cmh-progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #4CAF50, #8BC34A); }
    .cmh-card { border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px; margin-bottom: 10px; }
    .cmh-card-title { font-weight: bold; margin-bottom: 5px; }
    .cmh-settings-row { margin-bottom: 15px; }
    .cmh-settings-row label { display: block; margin-bottom: 5px; font-weight: bold; }
    .cmh-settings-row input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
  `);

  // Register menu command
  GM_registerMenuCommand("Analyze Content for Monetization", analyzeContent);

  // Event listeners
  document.getElementById("cmh-close").addEventListener("click", () => {
    panel.style.display = "none";
  });

  toggleBtn.addEventListener("click", () => {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  // Tab navigation
  const tabButtons = document.querySelectorAll(".cmh-tab");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active tab
      tabButtons.forEach((btn) => btn.classList.remove("cmh-tab-active"));
      button.classList.add("cmh-tab-active");

      // Show relevant content section
      const tabName = button.getAttribute("data-tab");
      showTabContent(tabName);
    });
  });

  function showTabContent(tabName) {
    const allSections = document.querySelectorAll(".cmh-tab-content");
    allSections.forEach((section) => (section.style.display = "none"));

    const activeSection = document.getElementById(`cmh-${tabName}-content`);
    if (activeSection) {
      activeSection.style.display = "block";
    }

    // Special handling for settings tab
    if (tabName === "settings") {
      renderSettingsTab();
    }
  }

  function renderSettingsTab() {
    const settingsContent =
      document.getElementById("cmh-settings-content") ||
      createTabContent("settings");
    settingsContent.innerHTML = `
      <div class="cmh-settings-row">
        <h3>About Content Monetization Helper</h3>
        <p>This tool analyzes your content and provides suggestions to improve its monetization potential.</p>
        <p>It focuses on:</p>
        <ul>
          <li>Keyword optimization</li>
          <li>SEO improvements</li>
          <li>Content structure</li>
        </ul>
        <p>The tool uses the free Datamuse API to suggest related keywords and topics.</p>
      </div>
    `;
  }

  function createTabContent(tabName) {
    const contentDiv = document.createElement("div");
    contentDiv.id = `cmh-${tabName}-content`;
    contentDiv.className = "cmh-tab-content";
    contentDiv.style.display = "none";
    document.getElementById("cmh-results").appendChild(contentDiv);
    return contentDiv;
  }

  // Main analysis
  async function analyzeContent() {
    panel.style.display = "block";
    document.getElementById("cmh-loading").style.display = "block";
    document.getElementById("cmh-results").innerHTML = "";

    // Create tabs content containers
    createTabContent("keywords");
    createTabContent("seo");
    createTabContent("structure");

    // Show the first tab by default
    showTabContent("keywords");

    const content = getEditableContent();
    if (!content || content.trim().length < CONFIG.minContentLength) {
      document.getElementById("cmh-loading").style.display = "none";
      document.querySelectorAll(".cmh-tab-content").forEach((el) => {
        el.innerHTML =
          "<p>Please select or focus on a text area with sufficient content (at least " +
          CONFIG.minContentLength +
          " characters).</p>";
      });
      return;
    }

    try {
      // Extract keywords and calculate their monetization potential
      const keywordsWithScores = await analyzeKeywords(content);

      // Analyze SEO potential
      const seoSuggestions = analyzeSEO(content, keywordsWithScores);

      // Compute structural tips for better monetization
      const structureTips = computeStructure(content);

      // Render results in appropriate tabs
      document.getElementById("cmh-keywords-content").innerHTML =
        renderKeywordsTab(keywordsWithScores);
      document.getElementById("cmh-seo-content").innerHTML =
        renderSEOTab(seoSuggestions);
      document.getElementById("cmh-structure-content").innerHTML =
        renderStructureTab(structureTips);

      // Add event listeners for keyword suggestions
      document.querySelectorAll(".cmh-keyword-suggestion").forEach((btn) => {
        btn.addEventListener("click", function () {
          const keyword = this.getAttribute("data-keyword");
          insertTextAtCursor(keyword);
        });
      });
    } catch (error) {
      console.error("Error analyzing content:", error);
      document.getElementById(
        "cmh-results"
      ).innerHTML = `<p>Error analyzing content: ${
        error.message || "Unknown error"
      }</p>`;
    } finally {
      document.getElementById("cmh-loading").style.display = "none";
    }
  }

  // Insert text at cursor position (for keyword suggestions)
  function insertTextAtCursor(text) {
    const el = document.activeElement;
    if (!el || (el.tagName !== "TEXTAREA" && !el.isContentEditable)) return;

    if (el.tagName === "TEXTAREA") {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      el.value = el.value.substring(0, start) + text + el.value.substring(end);
      el.selectionStart = el.selectionEnd = start + text.length;
    } else {
      // For contentEditable elements
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  // Analyze keywords and calculate monetization potential
  async function analyzeKeywords(content) {
    // Extract basic keywords
    const basicKeywords = extractKeywords(content, CONFIG.maxKeywords);

    // Calculate monetization potential for each keyword
    const keywordsWithScores = [];

    for (const keyword of basicKeywords) {
      // Get related topics
      const related = await fetchRelated(keyword);

      // Calculate monetization score (0-100)
      let score = 0;

      // Check if keyword is a product or service
      if (/product|service|tool|app|software|course|book|guide/i.test(keyword))
        score += 25;

      // Check if keyword is related to high-value niches
      if (/finance|health|wealth|business|marketing|investment/i.test(keyword))
        score += 25;

      // Check if keyword is related to purchase intent
      if (
        /buy|purchase|price|cost|review|best|top|vs|versus|comparison/i.test(
          keyword
        )
      )
        score += 30;

      // Check if keyword is a long-tail keyword (3+ words)
      if (keyword.split(/\s+/).length >= 3) score += 20;

      // Cap at 100
      score = Math.min(100, score);

      keywordsWithScores.push({
        keyword,
        score,
        related: related.slice(0, CONFIG.maxRelatedTopics),
      });
    }

    // Sort by score (highest first)
    return keywordsWithScores.sort((a, b) => b.score - a.score);
  }

  function getEditableContent() {
    const el = document.activeElement;
    if (el && (el.tagName === "TEXTAREA" || el.isContentEditable)) {
      return el.value || el.innerText;
    }
    return document.body.innerText;
  }

  function extractKeywords(text, maxCount) {
    // Extract single words
    const wordFreq = {};
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .forEach((word) => {
        if (word.length > 3 && !STOPWORDS.has(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });

    // Extract phrases (2-3 words)
    const phraseFreq = {};
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word));

    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
    }

    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
    }

    // Combine single words and phrases, prioritizing phrases
    const combined = [
      ...Object.entries(phraseFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.floor(maxCount * 0.6))
        .map(([phrase]) => phrase),
      ...Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.floor(maxCount * 0.4))
        .map(([word]) => word),
    ];

    // Remove duplicates and limit to maxCount
    return [...new Set(combined)].slice(0, maxCount);
  }

  function fetchRelated(word) {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: `https://api.datamuse.com/words?ml=${encodeURIComponent(
          word
        )}&max=${CONFIG.maxRelatedTopics}`,
        onload: (res) => {
          try {
            const data = JSON.parse(res.responseText);
            resolve(data.map((item) => item.word));
          } catch {
            resolve([]);
          }
        },
        onerror: () => resolve([]),
      });
    });
  }

  // Analyze SEO potential of content
  function analyzeSEO(content, keywordsWithScores) {
    const seoSuggestions = {
      title: [],
      headings: [],
      density: [],
      structure: [],
    };

    // Check title suggestions
    const topKeywords = keywordsWithScores.slice(0, 3).map((k) => k.keyword);
    seoSuggestions.title.push(`Include your main keyword "${topKeywords[0]}" at the beginning of your title`);
    seoSuggestions.title.push(`Consider using a number in your title (e.g., "7 Ways to...", "5 Best...")`);
    seoSuggestions.title.push(`Add emotional words like "amazing", "essential", or "proven" to increase clicks`);

    // Check heading structure
    if (!/(#{1,6}\s|<h[1-6]>)/i.test(content)) {
      seoSuggestions.headings.push("Add H1, H2, and H3 headings to structure your content for better SEO");
    }
    seoSuggestions.headings.push(`Include your main keywords in headings: ${topKeywords.join(", ")}`);

    // Check keyword density
    const wordCount = content.split(/\s+/).length;
    seoSuggestions.density.push(`Aim for keyword density of 1-2% for main keywords (${Math.round(
      wordCount * 0.01
    )}-${Math.round(wordCount * 0.02)} occurrences in your text)`);

    // Check content structure
    if (wordCount < 300) {
      seoSuggestions.structure.push("Your content is too short. Aim for at least 300 words for better SEO ranking");
    } else if (wordCount < 1000) {
      seoSuggestions.structure.push("Consider expanding your content to 1000+ words for comprehensive coverage");
    } else {
      seoSuggestions.structure.push("Good content length. Long-form content tends to rank better in search results");
    }

    // Add meta description suggestion
    seoSuggestions.structure.push(`Create a compelling meta description (150-160 characters) that includes "${topKeywords[0]}"`);

    // Add LSI keywords suggestion
    seoSuggestions.structure.push("Include related keywords (LSI keywords) throughout your content to improve topical relevance");

    return seoSuggestions;
  }

  function computeStructure(text) {
    const structureSuggestions = {
      readability: [],
      formatting: [],
      engagement: [],
      monetization: [],
    };

    // Analyze paragraphs
    const paras = text.split(/\n{2,}/).filter((p) => p.trim().length);
    const avgWords =
      paras.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paras.length;

    // Readability suggestions
    if (avgWords > 60) {
      structureSuggestions.readability.push(
        `Paragraphs are on average ${Math.round(
          avgWords
        )} words long; break them into 2-3 sentences for better readability and ad placement opportunities.`
      );
    }

    // Check sentence length
    const sentences = text.split(/[.!?]\s+/);
    const longSentences = sentences.filter(
      (s) => s.split(/\s+/).length > 25
    ).length;
    if (longSentences > 3) {
      structureSuggestions.readability.push(
        `Found ${longSentences} long sentences. Break them down to improve readability and engagement.`
      );
    }

    // Formatting suggestions
    if (!/(#{1,6}\s|<h[2-6]>)/.test(text)) {
      structureSuggestions.formatting.push(
        "Add subheadings (H2/H3) every 300 words to structure content and create natural ad placement opportunities."
      );
    }

    if (!/(\\*\\*|__|<strong>|<b>)/i.test(text)) {
      structureSuggestions.formatting.push(
        "Use bold text to highlight key points and monetizable terms to draw reader attention."
      );
    }

    if (!/(\\-|\\*|\\d+\\.|<li>|<ul>|<ol>)/i.test(text)) {
      structureSuggestions.formatting.push(
        "Add bullet points or numbered lists to break up text and improve scannability."
      );
    }

    // Engagement suggestions
    if (
      !/(\\?|what do you think|share your|let me know|comment below)/i.test(
        text
      )
    ) {
      structureSuggestions.engagement.push(
        "Include questions or calls for comments to increase engagement and time on page."
      );
    }

    // Monetization structure suggestions
    if (!/(https?:\/\/)/i.test(text)) {
      structureSuggestions.monetization.push(
        "Add relevant external or affiliate links to increase click-through opportunities."
      );
    }

    if (
      !/(buy|subscribe|click here|shop now|check out|get|download)/i.test(text)
    ) {
      structureSuggestions.monetization.push(
        "Include clear call-to-action phrases like 'Buy now', 'Subscribe', or 'Check out' to drive conversions."
      );
    }

    if (!/(table|comparison|vs|versus|alternative)/i.test(text)) {
      structureSuggestions.monetization.push(
        "Add comparison tables or 'vs' sections to naturally incorporate affiliate products."
      );
    }

    // Ensure we have at least one item in each category
    if (structureSuggestions.readability.length === 0) {
      structureSuggestions.readability.push("Content readability looks good.");
    }
    if (structureSuggestions.formatting.length === 0) {
      structureSuggestions.formatting.push(
        "Content formatting is well-structured."
      );
    }
    if (structureSuggestions.engagement.length === 0) {
      structureSuggestions.engagement.push(
        "Content has good engagement elements."
      );
    }
    if (structureSuggestions.monetization.length === 0) {
      structureSuggestions.monetization.push(
        "Content structure is well-optimized for monetization."
      );
    }

    return structureSuggestions;
  }

  // Render keywords tab
  function renderKeywordsTab(keywordsWithScores) {
    let html = `
    <h3>High-Value Monetization Keywords</h3>
    <p>These keywords have the highest potential for monetization. Click to insert at cursor position.</p>
    <div style="display: flex; flex-wrap: wrap; margin-bottom: 15px;">
  `;

    // Add keyword tags with monetization scores
    keywordsWithScores.forEach(({ keyword, score }) => {
      const scoreClass =
        score >= 70 ? "score-high" : score >= 40 ? "score-medium" : "score-low";
      html += `
      <div class="cmh-card" style="margin: 5px; flex: 0 0 calc(50% - 15px);">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span class="score ${scoreClass}">${score}</span>
          <span class="cmh-card-title">${keyword}</span>
        </div>
        <button class="cmh-keyword-suggestion" data-keyword="${keyword}" 
                style="background: #e3f2fd; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
          Insert Keyword
        </button>
      </div>
    `;
    });

    html += "</div>";

    // Add related topics section
    html += "<h3>Related Topics by Keyword</h3>";

    keywordsWithScores.slice(0, 5).forEach(({ keyword, related }) => {
      if (related && related.length > 0) {
        html += `
        <div class="cmh-card">
          <div class="cmh-card-title">${keyword}</div>
          <div style="display: flex; flex-wrap: wrap;">
            ${related.map((r) => `<span class="cmh-tag">${r}</span>`).join("")}
          </div>
        </div>
      `;
      }
    });

    return html;
  }

  // Render SEO tab
  function renderSEOTab(seoSuggestions) {
    let html = "<h3>SEO Optimization Suggestions</h3>";

    // Title suggestions
    html += `
    <div class="cmh-card">
      <div class="cmh-card-title">Title Optimization</div>
      <ul>
        ${seoSuggestions.title.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `;

    // Headings suggestions
    html += `
    <div class="cmh-card">
      <div class="cmh-card-title">Heading Structure</div>
      <ul>
        ${seoSuggestions.headings.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `;

    // Keyword density
    html += `
    <div class="cmh-card">
      <div class="cmh-card-title">Keyword Density</div>
      <ul>
        ${seoSuggestions.density.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `;

    // Content structure
    html += `
    <div class="cmh-card">
      <div class="cmh-card-title">Content Structure</div>
      <ul>
        ${seoSuggestions.structure.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `;

    return html;
  }

  // Render structure tab
  function renderStructureTab(structureTips) {
    let html = "<h3>Content Structure Optimization</h3>";

    // Readability
    html += `
    <div class="cmh-card">
      <div class="cmh-card-title">Readability Improvements</div>
      <ul>
        ${structureTips.readability.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `;

    // Formatting
    html += `
    <div class="cmh-card">
      <div class="cmh-card-title">Formatting Suggestions</div>
      <ul>
        ${structureTips.formatting.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `;

    // Engagement
    html += `
    <div class="cmh-card">
      <div class="cmh-card-title">Engagement Boosters</div>
      <ul>
        ${structureTips.engagement.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `;

    // Monetization structure
    html += `
    <div class="cmh-card">
      <div class="cmh-card-title">Monetization Structure</div>
      <ul>
        ${structureTips.monetization.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `;

    return html;
  }
})();
