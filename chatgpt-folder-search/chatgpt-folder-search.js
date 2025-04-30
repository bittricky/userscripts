// ==UserScript==
// @name         ChatGPT Folder Search
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Enhanced search for ChatGPT conversations with project folder support
// @author       BitTricky
// @match        https://chat.openai.com/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  // Configuration
  const config = {
    // Selectors for finding elements in the ChatGPT interface
    projectHeaderSelector: 'h3.p4.overflow-hidden', // The "Chats in this project" header
    conversationListSelector: 'ol', // The list of conversations
    conversationItemSelector: 'li', // Individual conversation items
    conversationLinkSelector: 'a', // Links within conversation items
    projectTitleSelector: 'button.text-4xl', // Project title element
    
    // Search configuration
    searchDelay: 300, // Milliseconds to wait before searching after typing
    highlightColor: 'rgba(16, 163, 127, 0.15)', // Highlight color with transparency (ChatGPT green)
    searchBoxId: 'chatgpt-folder-search-box',
    searchContainerId: 'chatgpt-folder-search-container',
    activeClass: 'chatgpt-folder-search-active'
  };

  // CSS Styles
  const styles = `
    #${config.searchContainerId} {
      display: flex;
      align-items: center;
      margin: 8px 0;
      padding: 0 8px;
      position: relative;
      width: calc(100% - 16px);
      font-family: var(--font-family-sans);
    }
    
    #${config.searchBoxId} {
      width: 100%;
      padding: 8px 30px 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--token-border-light, rgba(0, 0, 0, 0.1));
      background-color: var(--token-main-surface-primary, #ffffff);
      color: var(--token-text-primary, #000000);
      font-size: 14px;
      transition: all 0.2s ease;
    }
    
    #${config.searchBoxId}:focus {
      outline: none;
      border-color: var(--token-text-secondary, #10a37f);
      box-shadow: 0 0 0 1px rgba(16, 163, 127, 0.2);
    }
    
    .${config.activeClass} {
      background-color: ${config.highlightColor} !important;
    }
    
    .search-clear-btn {
      position: absolute;
      right: 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--token-text-tertiary, #6e6e80);
      font-size: 16px;
      display: none;
    }
    
    .search-clear-btn:hover {
      color: var(--token-text-secondary, #10a37f);
    }
    
    .search-count {
      position: absolute;
      right: 16px;
      color: var(--token-text-tertiary, #6e6e80);
      font-size: 12px;
    }
    
    .search-project-indicator {
      font-size: 12px;
      color: var(--token-text-tertiary, #6e6e80);
      margin: 4px 0 8px 8px;
      font-style: italic;
    }
    
    .search-no-results {
      padding: 8px;
      text-align: center;
      color: var(--token-text-tertiary, #6e6e80);
      font-style: italic;
      display: none;
    }
  `;

  // Add styles to document
  function addStyles() {
    if (document.getElementById('chatgpt-folder-search-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'chatgpt-folder-search-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Create and add search interface
  function createSearchInterface() {
    if (document.getElementById(config.searchContainerId)) return;
    
    // Find the project header element
    const projectHeader = document.querySelector(config.projectHeaderSelector);
    if (!projectHeader) return;
    
    // Create container
    const container = document.createElement('div');
    container.id = config.searchContainerId;
    
    // Create search input
    const input = document.createElement('input');
    input.id = config.searchBoxId;
    input.type = 'text';
    input.placeholder = 'Search conversations in this project...';
    input.autocomplete = 'off';
    
    // Create clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'search-clear-btn';
    clearBtn.innerHTML = '\u2715'; // × symbol
    clearBtn.title = 'Clear search';
    clearBtn.style.display = 'none';
    
    // Create search count indicator
    const countIndicator = document.createElement('span');
    countIndicator.className = 'search-count';
    countIndicator.style.display = 'none';
    
    // Create project indicator
    const projectIndicator = document.createElement('div');
    projectIndicator.className = 'search-project-indicator';
    
    // Create no results message
    const noResults = document.createElement('div');
    noResults.className = 'search-no-results';
    noResults.textContent = 'No matching conversations found';
    
    // Append elements
    container.appendChild(input);
    container.appendChild(clearBtn);
    container.appendChild(countIndicator);
    
    // Insert after the project header
    projectHeader.insertAdjacentElement('afterend', container);
    container.insertAdjacentElement('afterend', projectIndicator);
    container.insertAdjacentElement('afterend', noResults);
    
    // Setup event listeners
    setupEventListeners(input, clearBtn, countIndicator, projectIndicator, noResults);
    
    // Update project name
    updateProjectName(projectIndicator);
  }

  // Setup event listeners for search functionality
  function setupEventListeners(input, clearBtn, countIndicator, projectIndicator, noResults) {
    let searchTimeout;
    
    // Input event with debounce
    input.addEventListener('input', () => {
      const query = input.value.trim();
      
      // Show/hide clear button
      clearBtn.style.display = query.length > 0 ? 'block' : 'none';
      
      // Clear previous timeout
      clearTimeout(searchTimeout);
      
      // Set new timeout for search
      searchTimeout = setTimeout(() => {
        if (query.length > 0) {
          const results = performSearch(query);
          updateCountIndicator(countIndicator, results.count, query);
          noResults.style.display = results.count === 0 ? 'block' : 'none';
        } else {
          resetSearch();
          countIndicator.style.display = 'none';
          noResults.style.display = 'none';
        }
      }, config.searchDelay);
    });
    
    // Clear button click
    clearBtn.addEventListener('click', () => {
      input.value = '';
      resetSearch();
      clearBtn.style.display = 'none';
      countIndicator.style.display = 'none';
      noResults.style.display = 'none';
      input.focus();
    });
    
    // Monitor project title changes
    const titleObserver = new MutationObserver(() => {
      updateProjectName(projectIndicator);
    });
    
    const projectTitle = document.querySelector(config.projectTitleSelector);
    if (projectTitle) {
      titleObserver.observe(projectTitle, { childList: true, subtree: true, characterData: true });
    }
    
    // Monitor for conversation list changes (new conversations added)
    const conversationListObserver = new MutationObserver(() => {
      // If there's an active search, reapply it
      const query = input.value.trim();
      if (query.length > 0) {
        const results = performSearch(query);
        updateCountIndicator(countIndicator, results.count, query);
        noResults.style.display = results.count === 0 ? 'block' : 'none';
      }
    });
    
    const conversationList = document.querySelector(config.conversationListSelector);
    if (conversationList) {
      conversationListObserver.observe(conversationList, { childList: true, subtree: false });
    }
  }

  // Get the current project name
  function updateProjectName(indicator) {
    const projectTitle = document.querySelector(config.projectTitleSelector);
    if (projectTitle) {
      const projectName = projectTitle.textContent.trim();
      indicator.textContent = `Project: ${projectName}`;
    } else {
      indicator.textContent = '';
    }
  }

  // Update the count indicator
  function updateCountIndicator(indicator, count, query) {
    indicator.textContent = `${count} result${count !== 1 ? 's' : ''}`;
    indicator.style.display = 'block';
  }

  // Perform the search and highlight matches
  function performSearch(query) {
    // Reset previous search
    resetSearch();
    
    query = query.toLowerCase();
    let matchCount = 0;
    
    // Get all conversation items
    const conversationList = document.querySelector(config.conversationListSelector);
    if (!conversationList) return { count: 0 };
    
    const conversations = conversationList.querySelectorAll(config.conversationItemSelector);
    
    conversations.forEach(conversation => {
      // Get the conversation text from the title and description
      const link = conversation.querySelector(config.conversationLinkSelector);
      if (!link) return;
      
      const text = link.textContent.toLowerCase();
      const isMatch = text.includes(query);
      
      if (isMatch) {
        // Show and highlight the match
        conversation.style.display = '';
        highlightConversation(conversation, query);
        matchCount++;
      } else {
        // Hide non-matches
        conversation.style.display = 'none';
      }
    });
    
    return { count: matchCount };
  }

  // Highlight matching conversation
  function highlightConversation(conversation, query) {
    conversation.classList.add(config.activeClass);
    
    // Optional: You could also highlight the specific matching text
    // This would require more complex DOM manipulation
  }

  // Reset search highlights and display
  function resetSearch() {
    const conversationList = document.querySelector(config.conversationListSelector);
    if (!conversationList) return;
    
    const conversations = conversationList.querySelectorAll(config.conversationItemSelector);
    conversations.forEach(conversation => {
      conversation.style.display = '';
      conversation.classList.remove(config.activeClass);
    });
  }

  // Initialize the script
  function initialize() {
    addStyles();
    createSearchInterface();
  }

  // Check if we're on a project page
  function isProjectPage() {
    // Check for the project header
    return !!document.querySelector(config.projectHeaderSelector);
  }

  // Handle navigation changes and check if we're on a project page
  function checkForProjectPage() {
    if (isProjectPage()) {
      initialize();
    }
  }

  // Handle URL changes (for SPA navigation)
  function setupURLChangeDetection() {
    // Use MutationObserver to detect DOM changes that might indicate navigation
    const bodyObserver = new MutationObserver((mutations) => {
      checkForProjectPage();
    });
    
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    
    // Also check when the script first runs
    checkForProjectPage();
  }

  // Start the script
  setupURLChangeDetection();
})();
