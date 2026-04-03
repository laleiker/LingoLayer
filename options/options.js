/**
 * LingoLayer — Options Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    const LEVEL_EMOJIS = ['📖', '📚', '🗺️', '🎯', '⚡', '🏆'];

    const statWords = document.getElementById('stat-words');
    const statLevel = document.getElementById('stat-level');
    const statModes = document.getElementById('stat-modes');
    const levelsList = document.getElementById('levels-list');
    const resetBtn = document.getElementById('reset-progress');

    // ─── Load State ─────────────────────────────────────────
    loadState();

    function loadState() {
        chrome.runtime.sendMessage({ action: 'getGamificationState' }, (state) => {
            if (!state) return;

            // Stats
            statWords.textContent = state.totalWords.toLocaleString('es-ES');
            statLevel.textContent = state.level;
            statModes.textContent = 2 + state.unlockedModes.length; // base modes + unlocked

            // Levels list
            renderLevels(state);
        });
    }

    function renderLevels(state) {
        levelsList.innerHTML = '';
        const levels = state.levels || [];

        levels.forEach((lvl, index) => {
            const li = document.createElement('li');
            const isAchieved = state.level >= lvl.level;
            if (isAchieved) li.classList.add('achieved');

            let unlockBadge = '';
            if (lvl.unlock === 'titles') {
                unlockBadge = '<span class="lvl-unlock">🔓 Modo Títulos</span>';
            } else if (lvl.unlock === 'ocr') {
                unlockBadge = '<span class="lvl-unlock">🔓 Modo OCR</span>';
            }

            li.innerHTML = `
                <span class="lvl-emoji">${isAchieved ? LEVEL_EMOJIS[index] : '🔒'}</span>
                <span class="lvl-name">${lvl.name}</span>
                <span class="lvl-words">${lvl.words.toLocaleString('es-ES')} palabras</span>
                ${unlockBadge}
            `;

            levelsList.appendChild(li);
        });
    }

    // ─── Reset Progress ─────────────────────────────────────
    resetBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.')) {
            chrome.storage.local.set({
                totalWordsTranslated: 0,
                currentLevel: 0,
                unlockedModes: [],
                titlesEnabled: false,
                ocrEnabled: false
            }, () => {
                loadState();
                alert('Progreso reiniciado correctamente.');
            });
        }
    });
});
