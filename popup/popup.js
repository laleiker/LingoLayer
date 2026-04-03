/**
 * LingoLayer — Popup Controller
 * Handles UI state, gamification display, module toggles, and settings.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─── DOM Elements ───────────────────────────────────────
    const toggle = document.getElementById('toggle-translation');
    const modeSelect = document.getElementById('mode-select');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    // Gamification
    const levelName = document.getElementById('level-name');
    const levelBadge = document.getElementById('level-badge');
    const wordCount = document.getElementById('word-count');
    const progressBar = document.getElementById('progress-bar');
    const progressLabel = document.getElementById('progress-label');

    // Module cards
    const titlesCard = document.getElementById('titles-card');
    const titlesLock = document.getElementById('titles-lock');
    const titlesSwitch = document.getElementById('titles-switch');
    const toggleTitles = document.getElementById('toggle-titles');
    const titlesStatus = document.getElementById('titles-status');

    const ocrCard = document.getElementById('ocr-card');
    const ocrLock = document.getElementById('ocr-lock');
    const ocrSwitch = document.getElementById('ocr-switch');
    const toggleOCR = document.getElementById('toggle-ocr');
    const ocrStatus = document.getElementById('ocr-status');

    const openOptions = document.getElementById('open-options');

    // Level emojis
    const LEVEL_EMOJIS = ['📖', '📚', '🗺️', '🎯', '⚡', '🏆'];

    // ─── Load Settings ──────────────────────────────────────
    chrome.storage.sync.get(['enabled', 'mode'], (data) => {
        toggle.checked = data.enabled || false;
        modeSelect.value = data.mode || 'paragraph';
        updateStatusUI(data.enabled || false);
    });

    // ─── Load Gamification State ────────────────────────────
    loadGamificationState();

    function loadGamificationState() {
        chrome.runtime.sendMessage({ action: 'getGamificationState' }, (state) => {
            if (!state) return;

            // Update level display
            levelName.textContent = `Nivel ${state.level}: ${state.levelName}`;
            levelBadge.textContent = LEVEL_EMOJIS[state.level] || '📖';

            // Update word count
            wordCount.textContent = state.totalWords.toLocaleString('es-ES');

            // Update progress bar
            progressBar.style.width = `${state.progress}%`;

            if (state.nextLevel) {
                progressLabel.textContent = `${state.totalWords.toLocaleString('es-ES')} / ${state.nextLevelWords.toLocaleString('es-ES')} para ${state.nextLevel}`;
            } else {
                progressLabel.textContent = '¡Nivel máximo alcanzado! 🏆';
            }

            // Update Titles module card
            updateModuleCard(
                state.unlockedModes.includes('titles'),
                state.titlesEnabled,
                titlesCard, titlesLock, titlesSwitch, toggleTitles, titlesStatus,
                'Traducción dinámica de títulos',
                'Desbloquea a las 1,000 palabras'
            );

            // Update OCR module card
            updateModuleCard(
                state.unlockedModes.includes('ocr'),
                state.ocrEnabled,
                ocrCard, ocrLock, ocrSwitch, toggleOCR, ocrStatus,
                'Extrae y traduce texto de imágenes',
                'Desbloquea a las 5,000 palabras'
            );
        });
    }

    function updateModuleCard(isUnlocked, isActive, card, lock, switchEl, toggleEl, statusEl, activeText, lockedText) {
        if (isUnlocked) {
            card.classList.remove('locked');
            card.classList.add('unlocked');
            lock.style.display = 'none';
            switchEl.style.display = 'block';
            toggleEl.checked = isActive;
            statusEl.textContent = isActive ? '✅ Activo' : activeText;
        } else {
            card.classList.add('locked');
            card.classList.remove('unlocked');
            lock.style.display = 'inline';
            switchEl.style.display = 'none';
            statusEl.textContent = lockedText;
        }
    }

    // ─── Main Toggle ────────────────────────────────────────
    toggle.addEventListener('change', () => {
        const isEnabled = toggle.checked;
        chrome.storage.sync.set({ enabled: isEnabled }, () => {
            updateStatusUI(isEnabled);
            sendMessageToActiveTab({ action: 'toggle', enabled: isEnabled });
        });
    });

    // ─── Mode Change ────────────────────────────────────────
    modeSelect.addEventListener('change', () => {
        const newMode = modeSelect.value;
        chrome.storage.sync.set({ mode: newMode }, () => {
            if (toggle.checked) {
                sendMessageToActiveTab({ action: 'setMode', mode: newMode });
            }
        });
    });

    // ─── Titles Toggle ──────────────────────────────────────
    toggleTitles.addEventListener('change', () => {
        const enabled = toggleTitles.checked;
        getActiveTabId((tabId) => {
            chrome.runtime.sendMessage({
                action: 'enableTitles',
                tabId: tabId,
                enabled: enabled
            });
            titlesStatus.textContent = enabled ? '✅ Activo' : 'Traducción dinámica de títulos';
        });
    });

    // ─── OCR Toggle ─────────────────────────────────────────
    toggleOCR.addEventListener('change', () => {
        const enabled = toggleOCR.checked;
        getActiveTabId((tabId) => {
            chrome.runtime.sendMessage({
                action: 'enableOCR',
                tabId: tabId,
                enabled: enabled
            });
            ocrStatus.textContent = enabled ? '✅ Activo' : 'Extrae y traduce texto de imágenes';
        });
    });

    // ─── Options Page ───────────────────────────────────────
    openOptions.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });

    // ─── Helpers ────────────────────────────────────────────
    function updateStatusUI(enabled) {
        statusDot.classList.toggle('active', enabled);
        statusText.textContent = enabled ? 'Activa — traduciendo página' : 'Desactivada';
    }

    function sendMessageToActiveTab(message) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
                    statusText.textContent = 'Refresca la página para activar';
                });
            }
        });
    }

    function getActiveTabId(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            callback(tabs[0]?.id || null);
        });
    }

    // ─── Periodic Refresh (while popup is open) ─────────────
    setInterval(loadGamificationState, 3000);
});
