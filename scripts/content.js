/**
 * LingoLayer — Content Script
 * Handles text extraction, translation injection, and interlinear display.
 * Word counting is handled by background.js on each translation request.
 */

let isEnabled = false;
let currentMode = 'paragraph';
let observer = null;
const TRANSLATION_CLASS = 'lingolayer-translation';
const PROCESSED_ATTR = 'data-ll-translated';

// ─── Translation Cache & Queue ──────────────────────────────────
const translationCache = new Map();
const translationQueue = [];
let isTranslating = false;

// ─── Initialize ─────────────────────────────────────────────────
chrome.storage.sync.get(['enabled', 'mode'], (data) => {
    isEnabled = data.enabled || false;
    currentMode = data.mode || 'paragraph';
    if (isEnabled) {
        initTranslation();
    }
});

// ─── Message Listener ───────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'toggle':
            isEnabled = request.enabled;
            if (isEnabled) {
                initTranslation();
            } else {
                disableTranslation();
            }
            break;

        case 'setMode':
            currentMode = request.mode;
            if (isEnabled) {
                disableTranslation();
                isEnabled = true;
                setTimeout(initTranslation, 100);
            }
            break;
    }
});

// ─── Core Functions ─────────────────────────────────────────────
function initTranslation() {
    processPage();
    setupObserver();
}

function disableTranslation() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    removeTranslations();
    isEnabled = false;
}

function removeTranslations() {
    document.querySelectorAll(`.${TRANSLATION_CLASS}`).forEach(el => el.remove());
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => el.removeAttribute(PROCESSED_ATTR));
}

// ─── MutationObserver for Dynamic Content ───────────────────────
function setupObserver() {
    if (observer) return;

    let debounceTimer = null;
    observer = new MutationObserver((mutations) => {
        if (!isEnabled) return;

        let shouldProcess = false;
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE && !node.classList?.contains(TRANSLATION_CLASS)) {
                    shouldProcess = true;
                    break;
                }
            }
            if (shouldProcess) break;
        }

        if (shouldProcess) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(processPage, 500);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// ─── Page Processing ────────────────────────────────────────────
function processPage() {
    if (!isEnabled) return;

    const targetTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'DD', 'TD', 'TH', 'BLOCKQUOTE', 'FIGCAPTION'];

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node) => {
                if (targetTags.includes(node.tagName) && !node.hasAttribute(PROCESSED_ATTR) && shouldTranslate(node)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
        }
    );

    const nodesToProcess = [];
    while (walker.nextNode()) {
        nodesToProcess.push(walker.currentNode);
    }

    for (const node of nodesToProcess) {
        node.setAttribute(PROCESSED_ATTR, 'true');
        queueTranslation(node);
    }
}

function shouldTranslate(element) {
    if (element.hasAttribute(PROCESSED_ATTR)) return false;
    if (element.offsetParent === null) return false;
    if (element.isContentEditable) return false;

    const skipTags = ['INPUT', 'TEXTAREA', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'];
    if (skipTags.includes(element.tagName)) return false;
    if (element.closest(`.${TRANSLATION_CLASS}`)) return false;

    const text = element.textContent.trim();
    if (text.length < 3) return false;

    // Check if text is primarily English (Latin characters)
    const englishCharCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (englishCharCount / text.length < 0.3) return false;

    return true;
}

// ─── Translation Queue ──────────────────────────────────────────
function queueTranslation(element) {
    translationQueue.push({ element, mode: currentMode });
    processQueue();
}

async function processQueue() {
    if (isTranslating || translationQueue.length === 0) return;

    isTranslating = true;
    const { element, mode } = translationQueue.shift();

    try {
        if (mode === 'paragraph') {
            await translateBlock(element);
        } else {
            await translateSentences(element);
        }
    } catch (err) {
        // Silently continue on errors
    } finally {
        isTranslating = false;
        if (translationQueue.length > 0) {
            setTimeout(processQueue, 80);
        }
    }
}

// ─── Translation Modes ──────────────────────────────────────────
async function translateBlock(element) {
    const originalText = element.textContent.trim();
    if (!originalText) return;

    const translation = await getTranslation(originalText);
    if (translation && translation !== originalText) {
        injectTranslationBlock(element, translation);
    }
}

async function translateSentences(element) {
    const text = element.textContent;
    let sentences = [];

    if (window.Intl && Intl.Segmenter) {
        try {
            const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
            sentences = Array.from(segmenter.segment(text)).map(s => s.segment);
        } catch {
            sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
        }
    } else {
        sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    }

    // Fallback to block mode if element has complex children
    if (element.children.length > 0) {
        return translateBlock(element);
    }

    element.innerHTML = '';

    for (const sentence of sentences) {
        const span = document.createElement('span');
        span.textContent = sentence;
        element.appendChild(span);

        if (sentence.trim().length > 2) {
            const transText = await getTranslation(sentence.trim());
            if (transText && transText !== sentence.trim()) {
                const transDiv = document.createElement('div');
                transDiv.className = TRANSLATION_CLASS;
                transDiv.textContent = transText;
                element.appendChild(transDiv);
            }
        }
    }
}

// ─── Translation API (via Background) ───────────────────────────
async function getTranslation(text) {
    if (translationCache.has(text)) {
        return translationCache.get(text);
    }

    try {
        const response = await chrome.runtime.sendMessage({ action: 'translate', text: text });
        if (response && response.success) {
            translationCache.set(text, response.data);
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

// ─── DOM Injection ──────────────────────────────────────────────
function injectTranslationBlock(element, translatedText) {
    if (!translatedText) return;

    const translationDiv = document.createElement('div');
    translationDiv.className = TRANSLATION_CLASS;
    translationDiv.textContent = translatedText;
    translationDiv.setAttribute('aria-hidden', 'true');

    element.appendChild(translationDiv);
}
