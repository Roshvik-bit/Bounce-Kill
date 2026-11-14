/**
 * ==============================================================================
 * Bounce Kill - Cyberpunk HUD & Interface Manager (HUD.js)
 * Manages Main Menu, Weapon Store, Level Progression Modals,
 * Economy Badges, and In-Game Vitals.
 * ==============================================================================
 */

export class HUD {
    constructor(economyManager) {
        this.economy = economyManager;

        // In-game HUD elements
        this.crosshair = document.getElementById('crosshair');
        this.predictionLabel = document.getElementById('prediction-label');
        this.healthFill = document.getElementById('health-fill');
        this.healthText = document.getElementById('health-text');
        this.ammoText = document.getElementById('ammo-text');
        this.ammoSubtext = document.getElementById('ammo-subtext');
        this.weaponNameLabel = document.getElementById('weapon-name-label');
        this.scoreText = document.getElementById('score-text');
        this.tokensText = document.getElementById('hud-tokens-text');
        this.sectorText = document.getElementById('hud-sector-text');
        this.targetsText = document.getElementById('hud-targets-text');

        this.comboContainer = document.getElementById('combo-container');
        this.comboText = document.getElementById('combo-text');
        this.comboFill = document.getElementById('combo-fill');
        this.bannerText = document.getElementById('banner-text');

        // Focus & Bullet Time UI
        this.focusFill = document.getElementById('focus-fill');
        this.focusText = document.getElementById('focus-text');
        this.focusOverlay = document.getElementById('focus-overlay');

        // Style Rank & Trick Chain UI
        this.stylePanel = document.getElementById('style-panel');
        this.styleRankBadge = document.getElementById('style-rank-badge');
        this.styleRankTitle = document.getElementById('style-rank-title');
        this.styleMultiplier = document.getElementById('style-multiplier');
        this.styleBarFill = document.getElementById('style-bar-fill');
        this.styleTricksFeed = document.getElementById('style-tricks-feed');
        this.lastStyleGrade = 'D';

        // Menus & Modals
        this.mainMenu = document.getElementById('main-menu');
        this.menuTokens = document.getElementById('menu-tokens');
        this.btnPlay = document.getElementById('btn-play');
        this.btnStore = document.getElementById('btn-store');
        this.btnHowToPlay = document.getElementById('btn-how-to-play');

        this.howToPlayModal = document.getElementById('how-to-play-modal');
        this.btnCloseHowToPlay = document.getElementById('btn-close-how-to');

        this.storeModal = document.getElementById('store-modal');
        this.storeTokens = document.getElementById('store-tokens');
        this.storeCardsContainer = document.getElementById('store-cards');
        this.btnCloseStore = document.getElementById('btn-close-store');

        this.levelCompleteModal = document.getElementById('level-complete-modal');
        this.levelCompleteTitle = document.getElementById('level-complete-title');
        this.levelCompleteSubtitle = document.getElementById('level-complete-subtitle');
        this.levelTokensEarned = document.getElementById('level-tokens-earned');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnLevelStore = document.getElementById('btn-level-store');

        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameOverScore = document.getElementById('game-over-score');
        this.btnRestartLevel = document.getElementById('btn-restart-level');
        this.btnGameOverMenu = document.getElementById('btn-game-over-menu');

        this.campaignVictoryModal = document.getElementById('campaign-victory-modal');
        this.campaignFinalScore = document.getElementById('campaign-final-score');
        this.btnPlayAgain = document.getElementById('btn-play-again');

        // Pause Menu Elements
        this.pauseModal = document.getElementById('pause-modal');
        this.btnResumeGame = document.getElementById('btn-resume-game');
        this.btnPauseStore = document.getElementById('btn-pause-store');
        this.btnPauseRestart = document.getElementById('btn-pause-restart');
        this.btnPauseMenu = document.getElementById('btn-pause-menu');

        // Arena Selection & Rotation Elements
        this.menuMapStatus = document.getElementById('menu-map-status');
        this.btnMapSelect = document.getElementById('btn-map-select');
        this.mapSelectModal = document.getElementById('map-select-modal');
        this.mapCardsContainer = document.getElementById('map-cards-container');
        this.themePillsContainer = document.getElementById('theme-pills-container');
        this.activeThemeDesc = document.getElementById('active-theme-desc');
        this.mapStatusText = document.getElementById('map-status-text');
        this.mapProgressBarFill = document.getElementById('map-progression-bar-fill');
        this.mapActiveLabel = document.getElementById('map-active-label');
        this.mapModalProgress = document.getElementById('map-modal-progress');
        this.btnCancelMapSelect = document.getElementById('btn-cancel-map-select');
        this.btnCloseMapSelect = document.getElementById('btn-close-map-select');
        this.btnToggleUnlockDev = document.getElementById('btn-toggle-unlock-dev');

        this.bannerTimer = 0;
    }

    updateHealth(current, max) {
        const pct = Math.max(0, Math.min(100, (current / max) * 100));
        this.healthFill.style.width = `${pct}%`;
        this.healthText.textContent = `HP: ${current} / ${max}`;
    }

    flashDamage() {
        this.healthFill.classList.add('flash-crimson');
        setTimeout(() => this.healthFill.classList.remove('flash-crimson'), 250);
    }

    updateFocus(current, max, isActive) {
        const pct = Math.max(0, Math.min(100, (current / max) * 100));
        if (this.focusFill) {
            this.focusFill.style.width = `${pct}%`;
            if (isActive) {
                this.focusFill.classList.add('focus-active');
            } else {
                this.focusFill.classList.remove('focus-active');
            }
        }
        if (this.focusText) {
            if (isActive) {
                this.focusText.textContent = `FOCUS ACTIVE // ${Math.round(pct)}%`;
                this.focusText.style.color = '#00F0FF';
            } else {
                this.focusText.textContent = `FOCUS // BULLET TIME: ${Math.round(pct)}% [RMB]`;
                this.focusText.style.color = (pct < 15) ? '#556677' : '#88ccee';
            }
        }
    }

    setFocusOverlay(isActive) {
        if (this.focusOverlay) {
            if (isActive) {
                this.focusOverlay.classList.add('active');
            } else {
                this.focusOverlay.classList.remove('active');
            }
        }
    }

    updateAmmo(current, max, isReloading, weaponConfig = null) {
        this.ammoText.textContent = `${current} / ${max}`;
        if (weaponConfig) {
            this.weaponNameLabel.textContent = weaponConfig.name;
            this.weaponNameLabel.style.color = weaponConfig.railColorCss || '#00F0FF';
        }

        if (isReloading || current === 0) {
            this.ammoText.style.color = '#FF0D47';
            this.ammoSubtext.textContent = 'RELOADING...';
            this.ammoSubtext.style.color = '#FF0D47';
        } else {
            const col = weaponConfig ? weaponConfig.railColorCss : '#00F0FF';
            this.ammoText.style.color = col;
            this.ammoSubtext.textContent = 'RICOCHET ROUNDS';
            this.ammoSubtext.style.color = 'rgba(100, 150, 180, 0.8)';
        }
    }

    updateScore(score) {
        this.scoreText.textContent = `SCORE: ${score.toLocaleString()}`;
    }

    updateTokens(tokens) {
        if (this.tokensText) this.tokensText.textContent = `TOKENS: ${tokens}`;
        if (this.menuTokens) this.menuTokens.textContent = `TOKENS: ${tokens}`;
        if (this.storeTokens) this.storeTokens.textContent = `BALANCE: ${tokens} TOKENS`;
    }

    updateLevelInfo(levelConfig, remainingTargets) {
        if (this.sectorText) this.sectorText.textContent = levelConfig.title;
        if (this.targetsText) this.targetsText.textContent = `TARGETS: ${remainingTargets} REMAINING`;
    }

    updateArenaInfo(mapConfig, remainingTargets) {
        if (this.sectorText) {
            this.sectorText.textContent = mapConfig.codename || mapConfig.name || mapConfig.title;
        }
        if (this.targetsText) {
            this.targetsText.textContent = `TARGETS: ${remainingTargets} REMAINING`;
        }
    }

    updateMapStatus(arenaManager) {
        if (!arenaManager) return;

        if (this.mapStatusText) {
            this.mapStatusText.textContent = 'TARGET COMBAT SECTOR // UNRESTRICTED ACCESS';
        }

        if (this.mapActiveLabel) {
            const selectedId = arenaManager.getSelectedMapId();
            const themeId = arenaManager.getSelectedThemeId();
            const themeObj = arenaManager.getThemeById(themeId);
            const themeTag = (themeId && themeId !== 'default') ? ` [${themeObj.name.toUpperCase()}]` : '';

            if (selectedId === 'auto' || selectedId === 'random') {
                this.mapActiveLabel.textContent = `DEPLOYMENT: AUTOMATED ROTATION${themeTag}`;
                this.mapActiveLabel.style.color = '#00FF88';
            } else {
                const map = arenaManager.getMapById(selectedId);
                const effTheme = arenaManager.getEffectiveThemeObject(map);
                this.mapActiveLabel.textContent = `DEPLOYMENT: ${map.name.toUpperCase()} [${effTheme.name.toUpperCase()}]`;
                this.mapActiveLabel.style.color = effTheme.badgeColor || map.badgeColor || '#00F0FF';
            }
        }

        if (this.btnMapSelect) {
            this.btnMapSelect.textContent = 'ARENA & THEME PRESETS';
            this.btnMapSelect.style.borderColor = '#00FF88';
            this.btnMapSelect.style.color = '#00FF88';
            this.btnMapSelect.style.boxShadow = '0 0 16px rgba(0, 255, 136, 0.3)';
            this.btnMapSelect.style.cursor = 'pointer';
        }

        if (this.mapModalProgress) {
            this.mapModalProgress.textContent = 'ALL SECTORS & THEMES UNLOCKED';
            this.mapModalProgress.style.color = '#00FF88';
        }
    }

    showMapSelect(arenaManager, onSelectCallback) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        if (this.mapSelectModal) {
            this.mapSelectModal.style.display = 'flex';
            this.updateMapStatus(arenaManager);
            this._populateMapCards(arenaManager, onSelectCallback);
        }
    }

    hideMapSelect() {
        if (this.mapSelectModal) {
            this.mapSelectModal.style.display = 'none';
        }
    }

    _populateThemePills(arenaManager, onSelectCallback) {
        if (!this.themePillsContainer) return;
        this.themePillsContainer.innerHTML = '';

        const themes = arenaManager.getAllThemes();
        const currentThemeId = arenaManager.getSelectedThemeId();

        // 1. "Default (Signature)" pill
        const defaultPill = document.createElement('button');
        defaultPill.className = `theme-pill ${currentThemeId === 'default' ? 'active' : ''}`;
        defaultPill.textContent = 'MAP SIGNATURE (DEFAULT)';
        defaultPill.title = 'Render each map in its signature native aesthetic';
        defaultPill.addEventListener('click', () => {
            arenaManager.setSelectedTheme('default');
            this._populateThemePills(arenaManager, onSelectCallback);
            this._populateMapCards(arenaManager, onSelectCallback);
            this.updateMapStatus(arenaManager);
            if (onSelectCallback) onSelectCallback(arenaManager.getSelectedMapId());
        });
        this.themePillsContainer.appendChild(defaultPill);

        // 2. Individual Theme Preset pills
        themes.forEach(theme => {
            const isActive = (currentThemeId === theme.id);
            const pill = document.createElement('button');
            pill.className = `theme-pill ${isActive ? 'active' : ''}`;
            pill.textContent = theme.name.toUpperCase();
            pill.title = theme.tagline;
            if (isActive) {
                pill.style.borderColor = theme.badgeColor;
            }

            pill.addEventListener('click', () => {
                arenaManager.setSelectedTheme(theme.id);
                this._populateThemePills(arenaManager, onSelectCallback);
                this._populateMapCards(arenaManager, onSelectCallback);
                this.updateMapStatus(arenaManager);
                if (onSelectCallback) onSelectCallback(arenaManager.getSelectedMapId());
            });

            this.themePillsContainer.appendChild(pill);
        });

        if (this.activeThemeDesc) {
            if (currentThemeId === 'default') {
                this.activeThemeDesc.textContent = 'MAP DEFAULT // EACH MAP USES ITS SIGNATURE NATIVE AESTHETIC';
            } else {
                const t = arenaManager.getThemeById(currentThemeId);
                this.activeThemeDesc.textContent = `${t.name.toUpperCase()} // ${t.tagline}`;
            }
        }
    }

    _populateMapCards(arenaManager, onSelectCallback) {
        if (!this.mapCardsContainer) return;
        this.mapCardsContainer.innerHTML = '';

        this._populateThemePills(arenaManager, onSelectCallback);

        const maps = arenaManager.getAllMaps();
        const selectedId = arenaManager.getSelectedMapId();

        // 1. Render Specific Arena Maps (Always Unlocked)
        maps.forEach(map => {
            const isSelected = (selectedId === map.id);
            const effTheme = arenaManager.getEffectiveThemeObject(map);
            const card = document.createElement('div');
            card.className = `map-card ${isSelected ? 'selected' : ''}`;

            card.innerHTML = `
                <div class="map-card-thumb">
                    ${this._getMapThumbnailSvg(map.id, effTheme.id)}
                </div>
                <div class="map-card-body">
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                        <span class="map-badge-surface" style="color: ${map.badgeColor}; background: ${map.badgeBg}; border: 1px solid ${map.badgeColor};">
                            ${map.primarySurface.toUpperCase()} // ${map.stats.reflectivity}
                        </span>
                        <span class="map-badge-surface" style="color: ${effTheme.badgeColor}; background: ${effTheme.badgeBg}; border: 1px solid ${effTheme.badgeColor};">
                            THEME: ${effTheme.name.toUpperCase()}
                        </span>
                    </div>
                    <h3 class="map-card-name" style="color: ${map.badgeColor};">${map.name}</h3>
                    <div class="map-card-subtitle">${map.subtitle}</div>
                    <p class="map-card-desc">${map.description}</p>
                    <div class="map-stats-list">
                        <div class="map-stat-item"><span>COMPLEXITY:</span> <strong style="color:#fff;">${map.stats.complexity}</strong></div>
                        <div class="map-stat-item"><span>COVER:</span> <strong style="color:#fff;">${map.stats.coverDensity}</strong></div>
                        <div class="map-stat-item"><span>HOSTILES:</span> <strong style="color:#FF0D47;">${map.enemySpawns.length} COMBAT MECHS</strong></div>
                    </div>
                </div>
                <button class="map-select-btn ${isSelected ? 'btn-active' : ''}">
                    ${isSelected ? 'ACTIVE ARENA' : 'SELECT ARENA'}
                </button>
            `;

            card.addEventListener('click', () => {
                arenaManager.setSelectedMap(map.id);
                this.updateMapStatus(arenaManager);
                this._populateMapCards(arenaManager, onSelectCallback);
                if (onSelectCallback) onSelectCallback(map.id);
            });

            this.mapCardsContainer.appendChild(card);
        });

        // 2. Render Automated Rotation Protocol Card
        const isAutoSelected = (selectedId === 'auto' || selectedId === 'random' || !selectedId);
        const autoCard = document.createElement('div');
        autoCard.className = `map-card ${isAutoSelected ? 'selected' : ''}`;

        autoCard.innerHTML = `
            <div class="map-card-thumb">
                ${this._getMapThumbnailSvg('auto')}
            </div>
            <div class="map-card-body">
                <span class="map-badge-surface" style="color: #00FF88; background: rgba(0,255,136,0.15); border: 1px solid #00FF88; margin-bottom: 6px;">
                    DYNAMIC // AUTO ROTATION
                </span>
                <h3 class="map-card-name" style="color: #00FF88;">Automated Rotation</h3>
                <div class="map-card-subtitle">Randomized Sector & Aesthetic Deployment</div>
                <p class="map-card-desc">Automatically cycles through all 3 arenas and visual presets at random on each mission start for complete tactical variety.</p>
                <div class="map-stats-list">
                    <div class="map-stat-item"><span>PROTOCOL:</span> <strong style="color:#00FF88;">RANDOMIZED</strong></div>
                    <div class="map-stat-item"><span>POOL:</span> <strong style="color:#fff;">ALL 3 ARENAS + THEMES</strong></div>
                    <div class="map-stat-item"><span>STATUS:</span> <strong style="color:#00F0FF;">READY FOR DEPLOYMENT</strong></div>
                </div>
            </div>
            <button class="map-select-btn ${isAutoSelected ? 'btn-active' : ''}">
                ${isAutoSelected ? 'ACTIVE PROTOCOL' : 'SELECT ROTATION'}
            </button>
        `;

        autoCard.addEventListener('click', () => {
            arenaManager.setSelectedMap('auto');
            this.updateMapStatus(arenaManager);
            this._populateMapCards(arenaManager, onSelectCallback);
            if (onSelectCallback) onSelectCallback('auto');
        });

        this.mapCardsContainer.appendChild(autoCard);
    }

    _getMapThumbnailSvg(mapId, themeId = null) {
        if (mapId === 'brutalist_grid' || themeId === 'cyber_brutalism') {
            return `
            <svg width="100%" height="100%" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="100" fill="#060c14"/>
                <path d="M 0 25 L 160 25 M 0 50 L 160 50 M 0 75 L 160 75 M 40 0 L 40 100 M 80 0 L 80 100 M 120 0 L 120 100" stroke="#0e2236" stroke-width="1"/>
                <rect x="8" y="6" width="144" height="88" fill="none" stroke="#00F0FF" stroke-width="1.5" stroke-opacity="0.45"/>
                <rect x="22" y="16" width="18" height="18" fill="#1b2a3a" stroke="#00F0FF" stroke-width="1.5"/>
                <rect x="120" y="16" width="18" height="18" fill="#1b2a3a" stroke="#00F0FF" stroke-width="1.5"/>
                <rect x="22" y="66" width="18" height="18" fill="#1b2a3a" stroke="#00F0FF" stroke-width="1.5"/>
                <rect x="120" y="66" width="18" height="18" fill="#1b2a3a" stroke="#00F0FF" stroke-width="1.5"/>
                <rect x="66" y="38" width="28" height="24" fill="#24384d" stroke="#00F0FF" stroke-width="2"/>
                <line x1="80" y1="38" x2="80" y2="62" stroke="#00F0FF" stroke-width="1.5" stroke-dasharray="2,2"/>
                <path d="M 80 88 L 120 40 L 40 40 L 80 20" fill="none" stroke="#FF0D47" stroke-width="1.2" stroke-dasharray="3,2"/>
                <circle cx="80" cy="88" r="4" fill="#00FF88"/>
                <circle cx="80" cy="20" r="3" fill="#FF0D47"/>
                <circle cx="31" cy="48" r="3" fill="#FF0D47"/>
                <circle cx="129" cy="48" r="3" fill="#FF0D47"/>
            </svg>`;
        } else if (mapId === 'neon_core' || themeId === 'neon_core' || mapId === 'solar_facility' || themeId === 'clean_solar') {
            return `
            <svg width="100%" height="100%" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="100" fill="#0d0a14"/>
                <path d="M 0 20 L 160 20 M 0 40 L 160 40 M 0 60 L 160 60 M 0 80 L 160 80 M 32 0 L 32 100 M 64 0 L 64 100 M 96 0 L 96 100 M 128 0 L 128 100" stroke="#251633" stroke-width="1"/>
                <rect x="8" y="6" width="144" height="88" fill="none" stroke="#FFAA00" stroke-width="1.5" stroke-opacity="0.6"/>
                <line x1="46" y1="14" x2="46" y2="86" stroke="#FFAA00" stroke-width="2.5" stroke-dasharray="4,2" stroke-opacity="0.8"/>
                <line x1="114" y1="14" x2="114" y2="86" stroke="#FFAA00" stroke-width="2.5" stroke-dasharray="4,2" stroke-opacity="0.8"/>
                <rect x="68" y="40" width="24" height="20" fill="#1b1226" stroke="#FFAA00" stroke-width="2"/>
                <rect x="60" y="24" width="40" height="4" fill="#FFAA00" opacity="0.9"/>
                <rect x="60" y="72" width="40" height="4" fill="#FFAA00" opacity="0.9"/>
                <rect x="18" y="36" width="16" height="28" fill="#1b1226" stroke="#FF5500" stroke-width="1.5"/>
                <rect x="126" y="36" width="16" height="28" fill="#1b1226" stroke="#FF5500" stroke-width="1.5"/>
                <circle cx="80" cy="88" r="4" fill="#00FF88"/>
                <circle cx="80" cy="18" r="3" fill="#FF0D47"/>
                <circle cx="30" cy="50" r="3" fill="#FF0D47"/>
                <circle cx="130" cy="50" r="3" fill="#FF0D47"/>
                <text x="148" y="16" fill="#FFAA00" font-family="monospace" font-size="8" font-weight="bold" text-anchor="end">NEON CORE</text>
            </svg>`;
        } else if (mapId === 'grid_matrix' || mapId === 'glass_vault' || themeId === 'grid_matrix') {
            return `
            <svg width="100%" height="100%" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="100" fill="#040d16"/>
                <path d="M 0 25 L 160 25 M 0 50 L 160 50 M 0 75 L 160 75 M 40 0 L 40 100 M 80 0 L 80 100 M 120 0 L 120 100" stroke="#0a2a40" stroke-width="1"/>
                <rect x="8" y="6" width="144" height="88" fill="none" stroke="#00FFFF" stroke-width="2" stroke-opacity="0.7"/>
                <line x1="22" y1="46" x2="58" y2="46" stroke="#00FFFF" stroke-width="3" stroke-dasharray="5,2"/>
                <line x1="66" y1="46" x2="94" y2="46" stroke="#00FFFF" stroke-width="3" stroke-dasharray="5,2"/>
                <line x1="102" y1="46" x2="138" y2="46" stroke="#00FFFF" stroke-width="3" stroke-dasharray="5,2"/>
                <line x1="48" y1="24" x2="112" y2="24" stroke="#00FFFF" stroke-width="2" stroke-dasharray="4,2"/>
                <rect x="42" y="26" width="14" height="14" fill="#082030" stroke="#00FFFF" stroke-width="1.5"/>
                <rect x="104" y="26" width="14" height="14" fill="#082030" stroke="#00FFFF" stroke-width="1.5"/>
                <circle cx="80" cy="88" r="4" fill="#00FF88"/>
                <circle cx="80" cy="16" r="3" fill="#FF0D47"/>
                <circle cx="80" cy="35" r="3" fill="#FF0D47"/>
                <circle cx="34" cy="35" r="3" fill="#FF0D47"/>
                <circle cx="126" cy="35" r="3" fill="#FF0D47"/>
                <text x="148" y="16" fill="#00FFFF" font-family="monospace" font-size="8" font-weight="bold" text-anchor="end">MATRIX</text>
            </svg>`;
        } else {
            return `
            <svg width="100%" height="100%" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="100" fill="#050a12"/>
                <circle cx="80" cy="50" r="34" fill="none" stroke="#00F0FF" stroke-width="1.5" stroke-dasharray="6,4"/>
                <circle cx="80" cy="50" r="22" fill="none" stroke="#FF6B00" stroke-width="1.5" stroke-dasharray="4,3"/>
                <circle cx="80" cy="50" r="10" fill="rgba(0,255,136,0.15)" stroke="#00FF88" stroke-width="1.5"/>
                <path d="M 66 40 L 80 28 L 94 40 M 94 60 L 80 72 L 66 60" fill="none" stroke="#00FF88" stroke-width="2.2"/>
                <text x="80" y="54" fill="#00F0FF" font-family="Courier New, monospace" font-size="11" font-weight="bold" text-anchor="middle">ROTATION</text>
            </svg>`;
        }
    }

    updateCombo(multiplier, timeLeft, totalTime) {
        if (multiplier > 1.0 && timeLeft > 0) {
            this.comboContainer.style.display = 'block';
            this.comboText.textContent = `COMBO: x${multiplier.toFixed(1)}`;
            const pct = (timeLeft / totalTime) * 100;
            this.comboFill.style.width = `${pct}%`;
        } else {
            this.comboContainer.style.display = 'none';
        }
    }

    updateStyleRank(rank, points, timer, maxDuration) {
        if (!this.styleRankBadge || !rank) return;

        this.styleRankBadge.textContent = rank.grade;
        this.styleRankBadge.className = `style-rank-badge rank-${rank.grade.toLowerCase()}`;
        if (this.styleRankTitle) {
            this.styleRankTitle.textContent = rank.title;
            this.styleRankTitle.style.color = rank.color;
        }
        if (this.styleMultiplier) {
            this.styleMultiplier.textContent = `x${rank.multiplier.toFixed(1)} MULTIPLIER`;
        }

        // Animated punch when player ranks up
        if (this.lastStyleGrade !== rank.grade) {
            this.styleRankBadge.classList.add('rank-up');
            setTimeout(() => {
                if (this.styleRankBadge) this.styleRankBadge.classList.remove('rank-up');
            }, 300);
            this.lastStyleGrade = rank.grade;
        }

        // Update style decay meter
        if (this.styleBarFill) {
            const pct = timer > 0 ? Math.min(100, Math.max(0, (timer / maxDuration) * 100)) : 0;
            this.styleBarFill.style.width = `${pct}%`;
            this.styleBarFill.style.backgroundColor = rank.color;
            this.styleBarFill.style.boxShadow = `0 0 8px ${rank.color}`;
        }
    }

    setAimStatus(status) {
        if (status === 'DOUBLE_BANK_LOCKED') {
            this.crosshair.className = 'crosshair double-locked';
            this.predictionLabel.textContent = '⚡⚡ DOUBLE BANK LOCKED [x2.5]';
            this.predictionLabel.style.color = '#FFAA00';
            this.predictionLabel.style.display = 'block';
        } else if (status === 'LETHAL_LOCKED') {
            this.crosshair.className = 'crosshair lethal';
            this.predictionLabel.textContent = '⚡ RICOCHET LETHAL LOCKED [x1.0]';
            this.predictionLabel.style.color = '#FF0D47';
            this.predictionLabel.style.display = 'block';
        } else if (status === 'DIRECT_DUD') {
            this.crosshair.className = 'crosshair dud';
            this.predictionLabel.textContent = '🚫 DIRECT HIT (0 DMG - RICOCHET REQUIRED)';
            this.predictionLabel.style.color = 'rgba(255, 120, 120, 0.95)';
            this.predictionLabel.style.display = 'block';
        } else {
            this.crosshair.className = 'crosshair normal';
            this.predictionLabel.style.display = 'none';
        }
    }

    showStyleEvent({ bounces, score, rank, tricks, tokens = 0, multiplier = 1.0 }) {
        let title = '';
        let color = rank ? rank.color : '#00F0FF';

        if (bounces === 1) {
            title = `⚡ BANK SHOT! +${score}`;
        } else if (bounces === 2) {
            title = `🔥 DOUBLE BANK! +${score} (x${multiplier.toFixed(1)})`;
            color = '#FFAA00';
        } else {
            title = `👑 ${bounces}x SINGULARITY BANK! +${score} (x${multiplier.toFixed(1)})`;
            color = '#D000FF';
        }

        if (tokens > 0) {
            title += ` | +${tokens} 🪙`;
        }

        this.bannerText.textContent = title;
        this.bannerText.style.color = color;
        this.bannerText.style.opacity = '1';
        this.bannerText.style.transform = 'translate(-50%, 0) scale(1.25)';

        // Display trick pills beneath banner
        if (this.styleTricksFeed && tricks && tricks.length > 0) {
            const pillHtml = tricks.map(t => `<span class="trick-pill">${t.label} (+${t.bonus})</span>`).join(' ');
            this.styleTricksFeed.innerHTML = pillHtml;
            this.styleTricksFeed.style.opacity = '1';
            clearTimeout(this.trickFeedTimeout);
            this.trickFeedTimeout = setTimeout(() => {
                if (this.styleTricksFeed) this.styleTricksFeed.style.opacity = '0';
            }, 2400);
        }

        clearTimeout(this.bannerTimer);
        this.bannerTimer = setTimeout(() => {
            this.bannerText.style.opacity = '0';
            this.bannerText.style.transform = 'translate(-50%, -15px) scale(0.95)';
        }, 2200);
    }

    showBanner(bounces, points, multiplier, tokensAwarded = 0) {
        this.showStyleEvent({
            bounces,
            score: points,
            rank: { color: bounces >= 2 ? '#FFAA00' : '#00F0FF' },
            tricks: [],
            tokens: tokensAwarded,
            multiplier
        });
    }

    // -------------------------------------------------------------------------
    // Menu & Modal Navigation
    // -------------------------------------------------------------------------
    showMainMenu() {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.mainMenu.style.display = 'flex';
        if (this.pauseModal) this.pauseModal.style.display = 'none';
        this.howToPlayModal.style.display = 'none';
        this.storeModal.style.display = 'none';
        this.levelCompleteModal.style.display = 'none';
        this.gameOverModal.style.display = 'none';
        this.campaignVictoryModal.style.display = 'none';
        this.updateTokens(this.economy.getTokens());
    }

    hideMainMenu() {
        this.mainMenu.style.display = 'none';
    }

    showPauseMenu() {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        if (this.pauseModal) this.pauseModal.style.display = 'flex';
    }

    hidePauseMenu() {
        if (this.pauseModal) this.pauseModal.style.display = 'none';
    }

    isAnyMenuOpen() {
        const modals = [
            this.mainMenu,
            this.pauseModal,
            this.howToPlayModal,
            this.storeModal,
            this.mapSelectModal,
            this.levelCompleteModal,
            this.gameOverModal,
            this.campaignVictoryModal
        ];
        return modals.some(m => m && m.style.display !== 'none');
    }

    showStore(onEquipCallback) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.storeModal.style.display = 'flex';
        this.updateTokens(this.economy.getTokens());
        this._populateStoreCards(onEquipCallback);
    }

    hideStore() {
        this.storeModal.style.display = 'none';
    }

    showHowToPlay() {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.howToPlayModal.style.display = 'flex';
    }

    hideHowToPlay() {
        this.howToPlayModal.style.display = 'none';
    }

    showLevelComplete(levelConfig, tokensEarnedThisLevel, isLastLevel) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.levelCompleteModal.style.display = 'flex';
        this.levelCompleteTitle.textContent = `${levelConfig.title} CLEARED`;
        this.levelCompleteSubtitle.textContent = levelConfig.subtitle;
        this.levelTokensEarned.textContent = `TOKENS HARVESTED: +${tokensEarnedThisLevel} 🪙`;
        this.btnNextLevel.textContent = isLastLevel ? 'COMPLETE CAMPAIGN' : 'PROCEED TO NEXT SECTOR';
        this.updateTokens(this.economy.getTokens());
    }

    hideLevelComplete() {
        this.levelCompleteModal.style.display = 'none';
    }

    showGameOver(finalScore) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.gameOverModal.style.display = 'flex';
        this.gameOverScore.textContent = `FINAL SCORE: ${finalScore.toLocaleString()}`;
    }

    hideGameOver() {
        this.gameOverModal.style.display = 'none';
    }

    showCampaignVictory(finalScore, totalTokens) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.campaignVictoryModal.style.display = 'flex';
        this.campaignFinalScore.textContent = `CAMPAIGN SCORE: ${finalScore.toLocaleString()} | TOKENS: ${totalTokens}`;
    }

    hideCampaignVictory() {
        this.campaignVictoryModal.style.display = 'none';
    }

    _populateStoreCards(onEquipCallback) {
        import('../weapons/WeaponConfig.js').then(({ WEAPON_CATALOG }) => {
            this.storeCardsContainer.innerHTML = '';
            const equippedId = this.economy.equippedWeaponId;

            WEAPON_CATALOG.forEach(weapon => {
                const isUnlocked = this.economy.isUnlocked(weapon.id);
                const isEquipped = (weapon.id === equippedId);
                const canAfford = this.economy.canAfford(weapon.cost);

                const card = document.createElement('div');
                card.className = `store-card ${isEquipped ? 'equipped' : ''}`;

                card.innerHTML = `
                    <div class="store-card-header">
                        <div class="store-weapon-category">${weapon.category}</div>
                        <h3 class="store-weapon-name" style="color: ${weapon.railColorCss}">${weapon.name}</h3>
                    </div>
                    <p class="store-weapon-desc">${weapon.description}</p>
                    <div class="store-stats-grid">
                        <div class="stat-row">
                            <span>VELOCITY:</span>
                            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${(weapon.speed / 80) * 100}%; background: ${weapon.railColorCss}"></div></div>
                        </div>
                        <div class="stat-row">
                            <span>BOUNCE LIMIT:</span>
                            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${(weapon.maxBounces / 8) * 100}%; background: ${weapon.railColorCss}"></div></div>
                        </div>
                        <div class="stat-row">
                            <span>MAGAZINE:</span>
                            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${(weapon.maxAmmo / 14) * 100}%; background: ${weapon.railColorCss}"></div></div>
                        </div>
                        <div class="stat-row">
                            <span>FIRE RATE:</span>
                            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${((0.4 - weapon.fireCooldown) / 0.3) * 100}%; background: ${weapon.railColorCss}"></div></div>
                        </div>
                    </div>
                    <div class="store-card-footer">
                        <div class="store-price-tag">${isUnlocked ? 'UNLOCKED' : `${weapon.cost} TOKENS`}</div>
                        <button class="store-action-btn ${isEquipped ? 'btn-equipped' : isUnlocked ? 'btn-equip' : canAfford ? 'btn-buy' : 'btn-disabled'}">
                            ${isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : canAfford ? 'PURCHASE' : 'LOCKED'}
                        </button>
                    </div>
                `;

                const actionBtn = card.querySelector('.store-action-btn');
                actionBtn.addEventListener('click', () => {
                    if (isEquipped) return;
                    if (isUnlocked) {
                        this.economy.equipWeapon(weapon.id);
                        if (onEquipCallback) onEquipCallback(this.economy.getEquippedWeapon());
                        this._populateStoreCards(onEquipCallback);
                    } else if (canAfford) {
                        const res = this.economy.buyWeapon(weapon.id);
                        if (res.success) {
                            if (onEquipCallback) onEquipCallback(this.economy.getEquippedWeapon());
                            this.updateTokens(this.economy.getTokens());
                            this._populateStoreCards(onEquipCallback);
                        }
                    }
                });

                this.storeCardsContainer.appendChild(card);
            });
        });
    }
}
