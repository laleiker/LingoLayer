/**
 * LingoLayer — OCR Module (Tesseract.js)
 * Lazy loads Tesseract.js only when activated.
 * Provides image hover overlay for text extraction + translation.
 * Also responds to context menu triggers from background.js.
 */

(() => {
    // Guard against double-injection
    if (window.__lingoLayerOCRActive) return;
    window.__lingoLayerOCRActive = true;

    const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    let tesseractLoaded = false;
    let activeOverlay = null;

    // ─── Lazy Load Tesseract.js ─────────────────────────────
    function loadTesseract() {
        return new Promise((resolve, reject) => {
            if (tesseractLoaded || window.Tesseract) {
                tesseractLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = TESSERACT_CDN;
            script.onload = () => {
                tesseractLoaded = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Tesseract.js'));
            document.head.appendChild(script);
        });
    }

    // ─── Initialize Hover Listeners ─────────────────────────
    function init() {
        document.addEventListener('mouseenter', handleImageHover, true);
        document.addEventListener('mouseleave', handleImageLeave, true);
        injectStyles();
    }

    function handleImageHover(e) {
        const img = e.target;
        if (img.tagName !== 'IMG' || img.naturalWidth < 50 || img.naturalHeight < 50) return;
        if (img.closest('.ll-ocr-overlay')) return;

        showOCRButton(img);
    }

    function handleImageLeave(e) {
        const img = e.target;
        if (img.tagName !== 'IMG') return;

        // Delay removal to allow clicking the button
        setTimeout(() => {
            if (activeOverlay && !activeOverlay.matches(':hover')) {
                removeOverlay();
            }
        }, 300);
    }

    // ─── OCR Button Overlay ─────────────────────────────────
    function showOCRButton(img) {
        removeOverlay();

        const rect = img.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.className = 'll-ocr-overlay';
        overlay.innerHTML = `
            <button class="ll-ocr-btn" title="Extraer y traducir texto de esta imagen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                Traducir texto
            </button>
        `;

        overlay.style.cssText = `
            position: fixed;
            top: ${rect.top + 8}px;
            left: ${rect.left + 8}px;
            z-index: 2147483647;
            pointer-events: auto;
        `;

        const btn = overlay.querySelector('.ll-ocr-btn');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            processImage(img.src, overlay);
        });

        overlay.addEventListener('mouseleave', () => {
            setTimeout(removeOverlay, 200);
        });

        document.body.appendChild(overlay);
        activeOverlay = overlay;
    }

    function removeOverlay() {
        if (activeOverlay) {
            activeOverlay.remove();
            activeOverlay = null;
        }
    }

    // ─── Process Image with OCR ─────────────────────────────
    async function processImage(imageSrc, overlayElement) {
        const btn = overlayElement?.querySelector('.ll-ocr-btn');
        if (btn) {
            btn.textContent = 'Cargando OCR...';
            btn.disabled = true;
        }

        try {
            await loadTesseract();

            if (btn) btn.textContent = 'Leyendo imagen...';

            const result = await Tesseract.recognize(imageSrc, 'eng', {
                logger: () => {} // Silent logger
            });

            const extractedText = result.data.text.trim();

            if (!extractedText || extractedText.length < 2) {
                showResult(overlayElement || imageSrc, 'No se encontró texto en esta imagen.');
                return;
            }

            if (btn) btn.textContent = 'Traduciendo...';

            // Translate via background
            const response = await chrome.runtime.sendMessage({
                action: 'translate',
                text: extractedText
            });

            if (response && response.success) {
                showResult(overlayElement || imageSrc, response.data, extractedText);
            } else {
                showResult(overlayElement || imageSrc, `Texto encontrado: ${extractedText}`);
            }

        } catch (error) {
            showResult(overlayElement || imageSrc, 'Error al procesar la imagen.');
        }
    }

    // ─── Show Result Tooltip ────────────────────────────────
    function showResult(overlayOrSrc, translatedText, originalText) {
        removeOverlay();

        const tooltip = document.createElement('div');
        tooltip.className = 'll-ocr-result';

        let content = '';
        if (originalText) {
            content = `
                <div class="ll-ocr-result-section">
                    <strong>Original (EN):</strong>
                    <p>${escapeHtml(originalText)}</p>
                </div>
                <div class="ll-ocr-result-section">
                    <strong>Traducción (ES):</strong>
                    <p>${escapeHtml(translatedText)}</p>
                </div>
            `;
        } else {
            content = `<p>${escapeHtml(translatedText)}</p>`;
        }

        tooltip.innerHTML = `
            <div class="ll-ocr-result-inner">
                ${content}
                <button class="ll-ocr-close" title="Cerrar">✕</button>
            </div>
        `;

        tooltip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2147483647;
        `;

        tooltip.querySelector('.ll-ocr-close').addEventListener('click', () => tooltip.remove());

        // Auto-remove after 15 seconds
        setTimeout(() => tooltip.remove(), 15000);

        document.body.appendChild(tooltip);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ─── Inject Styles ──────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('ll-ocr-styles')) return;

        const style = document.createElement('style');
        style.id = 'll-ocr-styles';
        style.textContent = `
            .ll-ocr-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-family: 'Inter', system-ui, sans-serif;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .ll-ocr-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
            }
            .ll-ocr-btn:disabled {
                opacity: 0.8;
                cursor: wait;
            }
            .ll-ocr-result {
                animation: ll-fadeIn 0.3s ease;
            }
            .ll-ocr-result-inner {
                position: relative;
                background: linear-gradient(135deg, #1e1b4b, #312e81);
                color: #e0e7ff;
                padding: 20px;
                border-radius: 16px;
                max-width: 480px;
                min-width: 280px;
                font-family: 'Inter', system-ui, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(139, 92, 246, 0.3);
            }
            .ll-ocr-result-section {
                margin-bottom: 12px;
            }
            .ll-ocr-result-section strong {
                color: #a5b4fc;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .ll-ocr-result-section p {
                margin: 4px 0 0 0;
                color: #f1f5f9;
            }
            .ll-ocr-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(255,255,255,0.1);
                border: none;
                color: #a5b4fc;
                font-size: 14px;
                cursor: pointer;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            .ll-ocr-close:hover {
                background: rgba(255,255,255,0.2);
            }
            @keyframes ll-fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // ─── Disable ────────────────────────────────────────────
    function disable() {
        document.removeEventListener('mouseenter', handleImageHover, true);
        document.removeEventListener('mouseleave', handleImageLeave, true);
        removeOverlay();
        const style = document.getElementById('ll-ocr-styles');
        if (style) style.remove();
        window.__lingoLayerOCRActive = false;
    }

    // ─── Message Listener ───────────────────────────────────
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'disableOCR') {
            disable();
        } else if (request.action === 'ocrImage' && request.src) {
            processImage(request.src, null);
        }
    });

    // Start
    init();
})();
