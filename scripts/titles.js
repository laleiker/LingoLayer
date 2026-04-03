/**
 * LingoLayer — Titles Module
 * Translates document.title dynamically using MutationObserver.
 * Injected on-demand only when unlocked and activated by the user.
 */

(() => {
    // Guard against double-injection
    if (window.__lingoLayerTitlesActive) return;
    window.__lingoLayerTitlesActive = true;

    let titleObserver = null;
    let originalTitle = document.title;
    let isTranslating = false;

    // ─── Initialize ─────────────────────────────────────────
    async function init() {
        await translateCurrentTitle();
        observeTitleChanges();
    }

    // ─── Translate Title ────────────────────────────────────
    async function translateCurrentTitle() {
        if (isTranslating) return;
        isTranslating = true;

        const title = document.title;
        if (!title || title.includes(' — ')) {
            isTranslating = false;
            return;
        }

        originalTitle = title;

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'translate',
                text: title
            });

            if (response && response.success && response.data !== title) {
                document.title = `${originalTitle} — ${response.data}`;
            }
        } catch (err) {
            // Extension context may be invalidated, silently fail
        }

        isTranslating = false;
    }

    // ─── Observe Title Changes ──────────────────────────────
    function observeTitleChanges() {
        const titleElement = document.querySelector('title');
        if (!titleElement) return;

        titleObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const newTitle = document.title;
                // Only translate if it's a genuinely new title (not our modification)
                if (newTitle && !newTitle.includes(' — ') && newTitle !== originalTitle) {
                    translateCurrentTitle();
                }
            }
        });

        titleObserver.observe(titleElement, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    // ─── Disable ────────────────────────────────────────────
    function disable() {
        if (titleObserver) {
            titleObserver.disconnect();
            titleObserver = null;
        }
        // Restore original title
        if (originalTitle) {
            document.title = originalTitle;
        }
        window.__lingoLayerTitlesActive = false;
    }

    // ─── Listen for disable message ─────────────────────────
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'disableTitles') {
            disable();
        }
    });

    // Start
    init();
})();
