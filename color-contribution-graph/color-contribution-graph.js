// ==UserScript==
// @name         Contribution Graph Colour with theme support
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Change the color scheme of GitHub's contribution graph
// @author       Mitul Patel
// @match        https://github.com/bittricky
// @grant        none
// ==/UserScript==

(function() {                                                                                                                                                                                                                                                                                                               
    'use strict';

    const colorThemes = {
        dark: {
            LEVEL4: hexToRgb('#ff5555'),
            LEVEL3: hexToRgb('#ff6e6e'),
            LEVEL2: hexToRgb('#ff8787'),
            LEVEL1: hexToRgb('#ffafaf'),
            LEVEL0: hexToRgb('#161b22')
        },
        light: {
            LEVEL4: hexToRgb('#db143c'),
            LEVEL3: hexToRgb('#e3305f'),
            LEVEL2: hexToRgb('#e95782'),
            LEVEL1: hexToRgb('#ef7ea5'),
            LEVEL0: hexToRgb('#ebedf0')
        }
    };

    function detectTheme() {
        const themeMeta = document.querySelector('meta[name="color-scheme"]');
        return themeMeta && themeMeta.content.includes('dark') ? 'dark' : 'light';
    }

    function hexToRgb(hex) {
        hex = hex.trim().replace(/^#/, '').toUpperCase();

        if (!/^[0-9A-F]{3}$|^[0-9A-F]{6}$/.test(hex)) {
            throw new Error('Invalid hex color format');
        }

        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        let r = parseInt(hex.substring(0, 2), 16); // Red
        let g = parseInt(hex.substring(2, 4), 16); // Green
        let b = parseInt(hex.substring(4, 6), 16); // Blue

        return `rgb(${r}, ${g}, ${b})`;
    }

    function updateGraphColors(colorLevels) {
        const elements = document.querySelectorAll('.ContributionCalendar-day');
        if (elements.length > 0) {
            elements.forEach(element => {

                element.style.setProperty("--color-calendar-graph-day-bg", colorLevels.LEVEL0);
                element.style.setProperty("--color-calendar-graph-day-L1-bg", colorLevels.LEVEL1);
                element.style.setProperty("--color-calendar-graph-day-L2-bg", colorLevels.LEVEL2);
                element.style.setProperty("--color-calendar-graph-day-L3-bg", colorLevels.LEVEL3);
                element.style.setProperty("--color-calendar-graph-day-L4-bg", colorLevels.LEVEL4);

            });
        } else {
            //Observe changes to the DOM nodes
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                        updateGraphColors(colorLevels);
                        observer.disconnect();
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    function init() {
        const currentTheme = detectTheme();
        const colorLevels = colorThemes[currentTheme];
        updateGraphColors(colorLevels);
    }

    init();
})();
