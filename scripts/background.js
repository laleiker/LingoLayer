/**
 * LingoLayer — Background Service Worker
 * Handles: Translation API, Word Counting, Gamification, Dynamic Module Injection
 * Designed to be event-driven and memory-efficient (no persistent state).
 */

// ─── Gamification Config ───────────────────────────────────────
const LEVELS = [
    { level: 0, words: 0,     name: 'Novato',     unlock: null },
    { level: 1, words: 500,   name: 'Aprendiz',   unlock: null },
    { level: 2, words: 1000,  name: 'Explorador', unlock: 'titles' },
    { level: 3, words: 2500,  name: 'Traductor',  unlock: null },
    { level: 4, words: 5000,  name: 'Experto',    unlock: 'ocr' },
    { level: 5, words: 10000, name: 'Maestro',    unlock: null }
];

// ─── Installation / Update ─────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
    // Initialize default gamification data
    chrome.storage.local.get(['totalWordsTranslated'], (data) => {
        if (data.totalWordsTranslated === undefined) {
            chrome.storage.local.set({
                totalWordsTranslated: 0,
                currentLevel: 0,
                unlockedModes: [],
                titlesEnabled: false,
                ocrEnabled: false
            });
        }
    });

    // Initialize default settings
    chrome.storage.sync.get(['enabled', 'mode'], (data) => {
        if (data.enabled === undefined) {
            chrome.storage.sync.set({ enabled: false, mode: 'paragraph' });
        }
    });

    // Create context menu for OCR
    chrome.contextMenus.create({
        id: 'lingolayer-ocr',
        title: 'LingoLayer: Traducir texto de esta imagen',
        contexts: ['image']
    });
});

// ─── Context Menu Handler (OCR) ────────────────────────────────
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'lingolayer-ocr' && tab?.id) {
        chrome.storage.local.get(['unlockedModes', 'ocrEnabled'], (data) => {
            const unlocked = data.unlockedModes || [];
            if (!unlocked.includes('ocr')) {
                chrome.action.setBadgeText({ text: '🔒', tabId: tab.id });
                chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
                setTimeout(() => chrome.action.setBadgeText({ text: '', tabId: tab.id }), 2000);
                return;
            }
            // Inject OCR module and trigger on the clicked image
            injectOCRModule(tab.id, info.srcUrl);
        });
    }
});

// ─── Message Handler ────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'translate':
            handleTranslation(request.text, sendResponse);
            return true; // Keep channel open for async

        case 'getGamificationState':
            getGamificationState(sendResponse);
            return true;

        case 'enableTitles':
            toggleTitlesModule(request.tabId, request.enabled);
            sendResponse({ success: true });
            break;

        case 'enableOCR':
            toggleOCRModule(request.tabId, request.enabled);
            sendResponse({ success: true });
            break;

        case 'getLevelsConfig':
            sendResponse({ levels: LEVELS });
            break;
    }
});

// ─── Translation with Word Counting ────────────────────────────
async function handleTranslation(text, sendResponse) {
    try {
        const translatedText = await translateText(text);
        // Count words and update gamification (non-blocking)
        updateWordCount(text);
        sendResponse({ success: true, data: translatedText });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

async function translateText(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data[0]) {
        return data[0].map(segment => segment[0]).join('');
    }
    return text;
}

// ─── Gamification: Word Counter ─────────────────────────────────
function updateWordCount(text) {
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount === 0) return;

    chrome.storage.local.get(['totalWordsTranslated', 'currentLevel', 'unlockedModes'], (data) => {
        const total = (data.totalWordsTranslated || 0) + wordCount;
        const currentUnlocked = data.unlockedModes || [];
        const oldLevel = data.currentLevel || 0;

        // Calculate new level
        let newLevel = 0;
        const newUnlocks = [...currentUnlocked];

        for (const lvl of LEVELS) {
            if (total >= lvl.words) {
                newLevel = lvl.level;
                if (lvl.unlock && !newUnlocks.includes(lvl.unlock)) {
                    newUnlocks.push(lvl.unlock);
                }
            }
        }

        const updates = {
            totalWordsTranslated: total,
            currentLevel: newLevel,
            unlockedModes: newUnlocks
        };

        chrome.storage.local.set(updates);

        // Show badge notification on level up
        if (newLevel > oldLevel) {
            const levelInfo = LEVELS.find(l => l.level === newLevel);
            chrome.action.setBadgeText({ text: '🆙' });
            chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' });
            setTimeout(() => chrome.action.setBadgeText({ text: '' }), 5000);
        }
    });
}

// ─── Dynamic Module Injection ───────────────────────────────────
function toggleTitlesModule(tabId, enabled) {
    chrome.storage.local.set({ titlesEnabled: enabled });
    if (enabled && tabId) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['scripts/titles.js']
        }).catch(err => console.warn('Titles injection failed:', err));
    } else if (!enabled && tabId) {
        // Send disable message to already-injected titles script
        chrome.tabs.sendMessage(tabId, { action: 'disableTitles' }).catch(() => {});
    }
}

function toggleOCRModule(tabId, enabled) {
    chrome.storage.local.set({ ocrEnabled: enabled });
    if (enabled && tabId) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['scripts/ocr.js']
        }).catch(err => console.warn('OCR injection failed:', err));
    } else if (!enabled && tabId) {
        chrome.tabs.sendMessage(tabId, { action: 'disableOCR' }).catch(() => {});
    }
}

function injectOCRModule(tabId, imageSrc) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['scripts/ocr.js']
    }).then(() => {
        chrome.tabs.sendMessage(tabId, { action: 'ocrImage', src: imageSrc }).catch(() => {});
    }).catch(err => console.warn('OCR injection failed:', err));
}

// ─── Gamification State Helper ──────────────────────────────────
function getGamificationState(sendResponse) {
    chrome.storage.local.get([
        'totalWordsTranslated', 'currentLevel', 'unlockedModes',
        'titlesEnabled', 'ocrEnabled'
    ], (data) => {
        const total = data.totalWordsTranslated || 0;
        const level = data.currentLevel || 0;
        const unlocked = data.unlockedModes || [];
        const currentLevelInfo = LEVELS.find(l => l.level === level) || LEVELS[0];
        const nextLevelInfo = LEVELS.find(l => l.level === level + 1);

        let progress = 100;
        if (nextLevelInfo) {
            const prevWords = currentLevelInfo.words;
            const nextWords = nextLevelInfo.words;
            progress = Math.min(100, Math.floor(((total - prevWords) / (nextWords - prevWords)) * 100));
        }

        sendResponse({
            totalWords: total,
            level: level,
            levelName: currentLevelInfo.name,
            nextLevel: nextLevelInfo ? nextLevelInfo.name : null,
            nextLevelWords: nextLevelInfo ? nextLevelInfo.words : null,
            progress: progress,
            unlockedModes: unlocked,
            titlesEnabled: data.titlesEnabled || false,
            ocrEnabled: data.ocrEnabled || false,
            levels: LEVELS
        });
    });
}
