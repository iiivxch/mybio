/* ========================================
   Admin Dashboard Script
   - Settings Management
   - File Upload Handling
   - Live Config Updates
   - Save/Load Configuration
======================================== */

// Available Platforms
const PLATFORMS = [
    { id: 'custom', name: 'Custom / Other', icon: 'fas fa-plus-circle', color: '#ffffff' },
    { id: 'github', name: 'GitHub', icon: 'fab fa-github', color: '#333333' },
    { id: 'discord', name: 'Discord', icon: 'fab fa-discord', color: '#5865f2' },
    { id: 'twitter', name: 'Twitter/X', icon: 'fab fa-twitter', color: '#000000' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: '#e4405f' },
    { id: 'telegram', name: 'Telegram', icon: 'fab fa-telegram', color: '#0088cc' },
    { id: 'spotify', name: 'Spotify', icon: 'fab fa-spotify', color: '#1db954' },
    { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube', color: '#ff0000' },
    { id: 'twitch', name: 'Twitch', icon: 'fab fa-twitch', color: '#9146ff' },
    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' },
    { id: 'reddit', name: 'Reddit', icon: 'fab fa-reddit', color: '#ff4500' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0077b5' },
    { id: 'steam', name: 'Steam', icon: 'fab fa-steam', color: '#171a21' },
    { id: 'email', name: 'Email', icon: 'fas fa-envelope', color: '#4285f4' },
    { id: 'website', name: 'Website', icon: 'fas fa-globe', color: '#00ff88' },
    { id: 'bitcoin', name: 'Bitcoin', icon: 'fab fa-bitcoin', color: '#f7931a' },
    { id: 'ethereum', name: 'Ethereum', icon: 'fab fa-ethereum', color: '#627eea' },
    { id: 'litecoin', name: 'Litecoin', icon: 'fas fa-coins', color: '#345d9d' },
    { id: 'solana', name: 'Solana', icon: 'fas fa-sun', color: '#14f195' },
    { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal', color: '#00457c' },
    { id: 'cashapp', name: 'Cash App', icon: 'fas fa-dollar-sign', color: '#00d632' }
];

// ... (renderSocialLinks logic update below)

function renderSocialLinks() {
    elements.socialLinksManager.innerHTML = '';

    config.socialLinks.forEach((link, index) => {
        // Find platform definition or use generic if custom
        let platform = PLATFORMS.find(p => p.id === link.id);

        // Handle Custom Links
        const isCustom = link.id.startsWith('custom_');
        if (isCustom) {
            platform = {
                name: link.name || 'Custom Link',
                icon: link.icon || 'fas fa-link',
                color: link.color || '#ffffff'
            };
        } else if (!platform) {
            // Fallback for unknown IDs
            platform = { name: link.id, icon: 'fas fa-link', color: '#666' };
        }

        const div = document.createElement('div');
        div.className = 'social-link-item';

        // Conditionally render Inputs for Custom Links
        let infoHtml = '';
        if (isCustom) {
            infoHtml = `
                <input type="text" class="social-link-name-input" placeholder="Name (e.g. Portfolio)" value="${link.name}">
                <input type="text" class="social-link-icon-input" placeholder="Icon (e.g. fas fa-globe)" value="fas fa-${link.icon.replace('fas fa-', '')}">
            `;
        } else {
            infoHtml = `<div class="social-link-name">${platform.name}</div>`;
        }

        div.innerHTML = `
            <div class="social-link-icon" style="background: ${platform.color}">
                <i class="${platform.icon}"></i>
            </div>
            <div class="social-link-info">
                ${infoHtml}
                <input type="text" class="social-link-url" placeholder="Enter URL..." value="${link.url || ''}">
            </div>
            <div class="social-link-actions">
                <button class="toggle-btn ${link.enabled ? 'active' : ''}" title="Toggle visibility">
                    <i class="fas ${link.enabled ? 'fa-eye' : 'fa-eye-slash'}"></i>
                </button>
                <button class="delete" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Listeners

        // URL
        div.querySelector('.social-link-url').addEventListener('input', (e) => {
            config.socialLinks[index].url = e.target.value;
        });

        // Custom Inputs
        if (isCustom) {
            div.querySelector('.social-link-name-input').addEventListener('input', (e) => {
                config.socialLinks[index].name = e.target.value;
            });
            div.querySelector('.social-link-icon-input').addEventListener('input', (e) => {
                let val = e.target.value;
                // Add fa- prefix if missing for preview (user might type 'globe' or 'fa-globe')
                if (!val.startsWith('fas fa-') && !val.startsWith('fab fa-')) {
                    // simplistic assumption, but okay for manual input
                    // Actually better store raw entire string if they know font awesome
                    // Or force specific format. 
                    // Let's assume they type "fas fa-globe" or we prepend "fas fa-" if they type "globe"?
                    // Let's just store exactly what they type, and update preview live?
                }
                config.socialLinks[index].icon = val;
                // Update preview icon
                div.querySelector('.social-link-icon i').className = val;
            });
        }

        // Toggle
        div.querySelector('.toggle-btn').addEventListener('click', () => {
            config.socialLinks[index].enabled = !config.socialLinks[index].enabled;
            renderSocialLinks();
        });

        // Delete
        div.querySelector('.delete').addEventListener('click', () => {
            config.socialLinks.splice(index, 1);
            renderSocialLinks();
        });

        elements.socialLinksManager.appendChild(div);
    });
}

// ... (initSocialLinks update below)

function initSocialLinks() {
    renderSocialLinks();
    renderPlatformGrid();

    // ... container helper ...

    if (elements.platformGrid) {
        // ... replace logic ...

        elements.platformGrid.addEventListener('click', (e) => {
            // ... strict check ...
            const item = e.target.closest('.platform-item');
            if (!item) return;
            e.stopPropagation();
            const platformId = item.dataset.id;

            // CUSTOM LOGIC
            if (platformId === 'custom') {
                const uniqueId = `custom_${Date.now()}`;
                config.socialLinks.push({
                    id: uniqueId,
                    name: 'My Link',
                    url: '',
                    icon: 'fas fa-link',
                    color: '#ffffff',
                    enabled: true
                });
                renderSocialLinks();
                elements.socialModal.classList.remove('show');
                showToast('Added Custom Link');
                return;
            }

            // EXISTING LOGIC
            const platformData = PLATFORMS.find(p => p.id === platformId);
            if (!platformData) return;
            // ... duplicate check ...
            // ... push ...
        });
    }
}


// Available Badges
const BADGES = [
    { id: 'premium', name: 'Premium', icon: 'fas fa-crown', color: '#ffd700', description: 'Premium member badge' },
    { id: 'verified', name: 'Verified', icon: 'fas fa-check-circle', color: '#00ff88', description: 'Verified account' },
    { id: 'dollar', name: 'Supporter', icon: 'fas fa-dollar-sign', color: '#00ff88', description: 'Financial supporter' },
    { id: 'star', name: 'Star', icon: 'fas fa-star', color: '#00ff88', description: 'Star member' },
    { id: 'partner', name: 'Partner', icon: 'fas fa-handshake', color: '#5865f2', description: 'Official partner' },
    { id: 'developer', name: 'Developer', icon: 'fas fa-code', color: '#9b59b6', description: 'Developer status' },
    { id: 'early', name: 'Early Adopter', icon: 'fas fa-bolt', color: '#e74c3c', description: 'Early adopter badge' },
    { id: 'bug', name: 'Bug Hunter', icon: 'fas fa-bug', color: '#2ecc71', description: 'Found bugs' }
];

// Configuration State
let config = {
    profile: {
        username: 'VXCH',
        displayName: 'vxch',
        bio: '',
        avatar: '',
        avatarBorder: '#00ff88',
        ornament: '🐌'
    },
    discord: {
        userId: '986665260750622780',
        serverId: '1259127565440778311',
        showPresence: true,
        showServer: true
    },
    badges: [],
    socialLinks: [],
    theme: {
        accentColor: '#00ff88',
        cardBackground: 'rgba(0, 0, 0, 0.78)',
        cardBlur: 20,
        cardTransparency: 55,
        cardTextMode: 'auto',
        cardBorderRadius: 20,
        textColor: '#ffffff',
        secondaryText: '#a0a0a0'
    },
    background: {
        type: 'video',
        url: 'assets/background.mp4',
        fallbackImage: 'assets/background.jpg'
    },
    audio: {
        enabled: true,
        url: 'assets/music.mp3',
        autoplay: true,
        volume: 0.5
    },
    splash: {
        enabled: true,
        text: 'CLICK TO ENTER',
        subtitle: '🔊 Audio will play'
    },
    stats: {
        showViews: true,
        location: 'ALONE',
        locationEmoji: '😔'
    }
};

// DOM Elements
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.settings-section'),

    // Buttons
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    addSocialBtn: document.getElementById('addSocialBtn'),

    // Profile
    avatarPreview: document.getElementById('avatarPreview'),
    avatarInput: document.getElementById('avatarInput'),
    avatarUrl: document.getElementById('avatarUrl'),
    username: document.getElementById('username'),
    displayName: document.getElementById('displayName'),
    bio: document.getElementById('bio'),
    avatarOrnament: document.getElementById('avatarOrnament'),

    // Background
    bgType: document.getElementById('bgType'),
    bgDropZone: document.getElementById('bgDropZone'),
    bgFileInput: document.getElementById('bgFileInput'),
    bgUrl: document.getElementById('bgUrl'),
    bgColorCard: document.getElementById('bgColorCard'),
    bgColor: document.getElementById('bgColor'),
    bgUploadCard: document.getElementById('bgUploadCard'),

    // Audio
    audioEnabled: document.getElementById('audioEnabled'),
    audioAutoplay: document.getElementById('audioAutoplay'),
    audioDropZone: document.getElementById('audioDropZone'),
    audioFileInput: document.getElementById('audioFileInput'),
    audioUrl: document.getElementById('audioUrl'),
    audioVolume: document.getElementById('audioVolume'),
    volumeValue: document.getElementById('volumeValue'),

    // Social
    addSocialBtn: document.getElementById('addSocialBtn'),
    socialLinksManager: document.getElementById('socialLinksManager'),
    socialModal: document.getElementById('socialModal'),
    closeSocialModal: document.getElementById('closeSocialModal'),
    platformGrid: document.getElementById('platformGrid'),

    // Discord
    showPresence: document.getElementById('showPresence'),
    showServer: document.getElementById('showServer'),
    discordUserId: document.getElementById('discordUserId'),
    discordServerId: document.getElementById('discordServerId'),

    // Badges
    badgesGrid: document.getElementById('badgesGrid'),

    // Theme
    accentColor: document.getElementById('accentColor'),
    accentColorText: document.getElementById('accentColorText'),
    cardBgColor: document.getElementById('cardBgColor'),
    cardBgOpacity: document.getElementById('cardBgOpacity'),
    cardBlur: document.getElementById('cardBlur'),
    blurValue: document.getElementById('blurValue'),
    borderRadius: document.getElementById('borderRadius'),
    radiusValue: document.getElementById('radiusValue'),
    textColor: document.getElementById('textColor'),
    secondaryTextColor: document.getElementById('secondaryTextColor'),

    // Splash
    splashEnabled: document.getElementById('splashEnabled'),
    splashText: document.getElementById('splashText'),
    splashSubtitle: document.getElementById('splashSubtitle'),

    // Stats
    showViews: document.getElementById('showViews'),
    locationText: document.getElementById('locationText'),
    locationEmoji: document.getElementById('locationEmoji'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ========================================
// Navigation
// ========================================
function initNavigation() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            // Update active nav
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show section
            elements.sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(section).classList.add('active');
        });
    });
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.querySelector('i').className = type === 'success'
        ? 'fas fa-check-circle'
        : 'fas fa-exclamation-circle';
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ========================================
// Profile Settings
// ========================================
function initProfileSettings() {
    // Avatar upload
    elements.avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                elements.avatarPreview.src = e.target.result;
                config.profile.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    initCardAppearance();

    // Avatar URL
    elements.avatarUrl.addEventListener('input', (e) => {
        if (e.target.value) {
            elements.avatarPreview.src = e.target.value;
            config.profile.avatar = e.target.value;
        }
    });

    // Text inputs
    elements.username.addEventListener('input', (e) => config.profile.username = e.target.value);
    elements.displayName.addEventListener('input', (e) => config.profile.displayName = e.target.value);
    elements.bio.addEventListener('input', (e) => config.profile.bio = e.target.value);

    if (elements.avatarOrnament) {
        elements.avatarOrnament.addEventListener('input', (e) => config.profile.ornament = e.target.value);
    }

    // New Fields
    const locInput = document.getElementById('locationText');
    if (locInput) locInput.addEventListener('input', (e) => config.profile.location = e.target.value);

    // Font Grid Click Handler
    const fontGrid = document.getElementById('fontGrid');
    const fontInput = document.getElementById('fontStyle');
    if (fontGrid) {
        fontGrid.querySelectorAll('.font-item').forEach(item => {
            item.addEventListener('click', () => {
                // Remove active from all
                fontGrid.querySelectorAll('.font-item').forEach(i => i.classList.remove('active'));
                // Add active to clicked
                item.classList.add('active');
                // Update hidden input and config
                const fontValue = item.dataset.font;
                if (fontInput) fontInput.value = fontValue;
                config.profile.font = fontValue;
            });
        });

    }

    // Username Styling
    const effectSelect = document.getElementById('usernameEffect');
    if (effectSelect) {
        effectSelect.addEventListener('change', (e) => config.profile.usernameEffect = e.target.value);
    }
    const colorInput = document.getElementById('usernameColor');
    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            config.profile.usernameColor = e.target.value;
            const span = e.target.nextElementSibling;
            if (span && span.classList.contains('color-value')) span.textContent = e.target.value;
        });
    }

    // Cursor Effects
    const cursorSelect = document.getElementById('cursorEffect');
    if (cursorSelect) {
        cursorSelect.addEventListener('change', (e) => config.profile.cursorEffect = e.target.value);
    }
}

// ========================================
// Background Settings
// ========================================
function initBackgroundSettings() {
    // Background type toggle
    elements.bgType.addEventListener('change', (e) => {
        config.background.type = e.target.value;

        if (e.target.value === 'color') {
            elements.bgUploadCard.style.display = 'none';
            elements.bgColorCard.style.display = 'block';
        } else {
            elements.bgUploadCard.style.display = 'block';
            elements.bgColorCard.style.display = 'none';
        }
    });

    // File upload
    initFileUpload(elements.bgDropZone, elements.bgFileInput, (result) => {
        config.background.url = result;
    });

    // URL input
    elements.bgUrl.addEventListener('input', (e) => {
        config.background.url = e.target.value;
    });

    elements.bgColor.addEventListener('input', (e) => {
        config.background.url = e.target.value;
    });
}

// ========================================
// Card Appearance Settings
// ========================================
function initCardAppearance() {
    const transparencySlider = document.getElementById('cardTransparency');
    const transparencyValue = document.getElementById('cardTransparencyValue');
    const textMode = document.getElementById('cardTextMode');
    const blurSlider = document.getElementById('cardBlur');
    const blurValue = document.getElementById('cardBlurValue');

    if (transparencySlider) {
        transparencySlider.addEventListener('input', (e) => {
            config.theme.cardTransparency = parseInt(e.target.value);
            transparencyValue.textContent = `${e.target.value}%`;
        });
    }

    if (textMode) {
        textMode.addEventListener('change', (e) => {
            config.theme.cardTextMode = e.target.value;
        });
    }

    if (blurSlider) {
        blurSlider.addEventListener('input', (e) => {
            config.theme.cardBlur = parseInt(e.target.value);
            blurValue.textContent = `${e.target.value}px`;
        });
    }
}

// ========================================
// Audio Settings
// ========================================
function initAudioSettings() {
    elements.audioEnabled.addEventListener('change', (e) => config.audio.enabled = e.target.checked);
    elements.audioAutoplay.addEventListener('change', (e) => config.audio.autoplay = e.target.checked);

    // File upload
    initFileUpload(elements.audioDropZone, elements.audioFileInput, (result) => {
        config.audio.url = result;
        // VISUAL FEEDBACK: Update duplicate input
        if (elements.audioUrl) elements.audioUrl.value = result;
        showToast('Audio uploaded successfully!');
    });

    // URL input
    elements.audioUrl.addEventListener('input', (e) => {
        config.audio.url = e.target.value;
    });

    // Volume slider
    elements.audioVolume.addEventListener('input', (e) => {
        config.audio.volume = e.target.value / 100;
        elements.volumeValue.textContent = `${e.target.value}%`;
    });
}

// ========================================
// File Upload Helper
// ========================================
function initFileUpload(dropZone, fileInput, callback) {
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file, callback);
        }
    });

    // Click upload
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file, callback);
        }
    });
}

function handleFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        callback(e.target.result);
        showToast(`File uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
}

// ========================================
// Social Links
// ========================================




function renderPlatformGrid() {
    const grid = elements.platformGrid;
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = '';

    PLATFORMS.forEach(platform => {
        const div = document.createElement('div');
        div.className = 'platform-item';
        div.dataset.id = platform.id; // Store ID on element

        // Remove 'fab fa-' etc for cleaner display if needed, but keeping full icon class for preview
        div.innerHTML = `
            <i class="${platform.icon}" style="color: ${platform.color}"></i>
            <span>${platform.name}</span>
        `;

        grid.appendChild(div);
    });
}

// ========================================
// Interaction Logic
// ========================================
function initSocialLinks() {
    renderSocialLinks();
    renderPlatformGrid();

    // 1. Event Delegation for Platform Grid
    if (elements.platformGrid) {
        // Remove old listeners (cloning)
        const newGrid = elements.platformGrid.cloneNode(false);
        elements.platformGrid.parentNode.replaceChild(newGrid, elements.platformGrid);
        elements.platformGrid = newGrid;

        renderPlatformGrid();

        elements.platformGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.platform-item');
            if (!item) return;
            e.stopPropagation();

            const platformId = item.dataset.id;

            // Custom Link Logic
            if (platformId === 'custom') {
                const uniqueId = `custom_${Date.now()}`;
                config.socialLinks.push({
                    id: uniqueId,
                    name: 'My Link',
                    url: '',
                    icon: 'fas fa-link',
                    color: '#ffffff',
                    enabled: true
                });
                renderSocialLinks();
                elements.socialModal.classList.remove('show');
                showToast('Added Custom Link');
                return;
            }

            // Standard Platform Logic
            const platformData = PLATFORMS.find(p => p.id === platformId);
            if (!platformData) return;

            // Check for duplicates
            if (config.socialLinks.some(l => l.id === platformId)) {
                showToast('Link already added!', 'error');
                return;
            }

            // Add ONE link
            config.socialLinks.push({
                id: platformData.id,
                name: platformData.name,
                url: '',
                // Strip class prefix for storage if needed, but keeping simple
                icon: platformData.icon,
                color: platformData.color,
                enabled: true
            });

            renderSocialLinks();
            elements.socialModal.classList.remove('show');
            showToast(`Added ${platformData.name}`);
        });
    }

    // 2. Modal Controls
    if (elements.addSocialBtn) {
        const newBtn = elements.addSocialBtn.cloneNode(true);
        elements.addSocialBtn.parentNode.replaceChild(newBtn, elements.addSocialBtn);
        elements.addSocialBtn = newBtn;

        elements.addSocialBtn.addEventListener('click', () => {
            elements.socialModal.classList.add('show');
        });
    }

    if (elements.closeSocialModal) {
        elements.closeSocialModal.addEventListener('click', () => {
            elements.socialModal.classList.remove('show');
        });
    }

    if (elements.socialModal) {
        elements.socialModal.addEventListener('click', (e) => {
            if (e.target === elements.socialModal) {
                elements.socialModal.classList.remove('show');
            }
        });
    }
}




// ========================================
// Discord Settings
// ========================================
function initDiscordSettings() {
    elements.showPresence.addEventListener('change', (e) => config.discord.showPresence = e.target.checked);
    elements.showServer.addEventListener('change', (e) => config.discord.showServer = e.target.checked);
    elements.discordUserId.addEventListener('input', (e) => config.discord.userId = e.target.value);
    elements.discordServerId.addEventListener('input', (e) => config.discord.serverId = e.target.value);

    // Invite URL
    const inviteInput = document.getElementById('discordInviteUrl');
    if (inviteInput) {
        inviteInput.addEventListener('input', (e) => config.discord.inviteUrl = e.target.value);
    }

    // Overrides
    const nameInput = document.getElementById('discordServerName');
    const countInput = document.getElementById('discordMemberCount');
    const iconInput = document.getElementById('discordIconUrl');

    if (nameInput) nameInput.addEventListener('input', (e) => config.discord.serverNameOverride = e.target.value);
    if (countInput) countInput.addEventListener('input', (e) => config.discord.memberCountOverride = e.target.value);
    if (iconInput) iconInput.addEventListener('input', (e) => config.discord.iconUrlOverride = e.target.value);
}

// ========================================
// Badges - Preset and Custom
// ========================================
function initBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    const customBadgeInput = document.getElementById('customBadgeInput');

    if (!badgesGrid) {
        console.log('Badges grid not found');
        return;
    }

    renderBadgesGrid();
    renderCustomBadges();

    // Custom badge upload handler
    if (customBadgeInput) {
        customBadgeInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                const badgeId = 'custom-' + Date.now();

                // Add to config
                config.badges.push({
                    id: badgeId,
                    enabled: true,
                    isCustom: true,
                    imageUrl: imageData,
                    name: file.name.replace(/\.[^/.]+$/, '') // Remove extension
                });

                renderCustomBadges();
            };
            reader.readAsDataURL(file);

            // Reset input
            e.target.value = '';
        });
    }
}

function renderBadgesGrid() {
    const badgesGrid = document.getElementById('badgesGrid');
    if (!badgesGrid) return;

    badgesGrid.innerHTML = '';

    BADGES.forEach(badge => {
        // Check if badge is enabled in config
        const configBadge = config.badges.find(b => b.id === badge.id);
        const isEnabled = configBadge ? configBadge.enabled : false;

        const div = document.createElement('div');
        div.className = `badge-item ${isEnabled ? 'active' : ''}`;
        div.innerHTML = `
            <i class="${badge.icon}" style="color: ${badge.color}"></i>
            <span class="badge-name">${badge.name}</span>
        `;

        div.addEventListener('click', () => {
            // Toggle badge in config
            const existingIndex = config.badges.findIndex(b => b.id === badge.id);

            if (existingIndex >= 0) {
                // Toggle enabled state
                config.badges[existingIndex].enabled = !config.badges[existingIndex].enabled;
            } else {
                // Add new badge as enabled
                config.badges.push({ id: badge.id, enabled: true });
            }

            // Re-render
            renderBadgesGrid();
        });

        badgesGrid.appendChild(div);
    });
}

function renderCustomBadges() {
    const container = document.getElementById('customBadgesContainer');
    if (!container) return;

    container.innerHTML = '';

    // Get custom badges from config
    const customBadges = config.badges.filter(b => b.isCustom);

    if (customBadges.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No custom badges yet. Click "Add Custom Badge" to upload one.</p>';
        return;
    }

    customBadges.forEach((badge, index) => {
        const div = document.createElement('div');
        div.className = `badge-item custom-badge ${badge.enabled ? 'active' : ''}`;
        div.innerHTML = `
            <img src="${badge.imageUrl}" alt="${badge.name}" style="width: 24px; height: 24px; object-fit: contain;">
            <span class="badge-name">${badge.name || 'Custom'}</span>
            <button class="delete-custom-badge" title="Delete">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Toggle on click (except delete button)
        div.addEventListener('click', (e) => {
            if (e.target.closest('.delete-custom-badge')) return;
            badge.enabled = !badge.enabled;
            renderCustomBadges();
        });

        // Delete button
        div.querySelector('.delete-custom-badge').addEventListener('click', () => {
            const badgeIndex = config.badges.findIndex(b => b.id === badge.id);
            if (badgeIndex >= 0) {
                config.badges.splice(badgeIndex, 1);
                renderCustomBadges();
            }
        });

        container.appendChild(div);
    });
}

// ========================================
// Theme Settings
// ========================================
function initThemeSettings() {
    // Accent color
    elements.accentColor.addEventListener('input', (e) => {
        config.theme.accentColor = e.target.value;
        elements.accentColorText.value = e.target.value;
    });

    elements.accentColorText.addEventListener('input', (e) => {
        config.theme.accentColor = e.target.value;
        elements.accentColor.value = e.target.value;
    });

    // Card background
    elements.cardBgColor.addEventListener('input', (e) => {
        updateCardBackground();
    });

    elements.cardBgOpacity.addEventListener('input', (e) => {
        updateCardBackground();
    });

    // Blur
    elements.cardBlur.addEventListener('input', (e) => {
        config.theme.cardBlur = parseInt(e.target.value);
        elements.blurValue.textContent = `${e.target.value}px`;
    });

    // Border radius
    elements.borderRadius.addEventListener('input', (e) => {
        config.theme.cardBorderRadius = parseInt(e.target.value);
        elements.radiusValue.textContent = `${e.target.value}px`;
    });

    // Text colors
    elements.textColor.addEventListener('input', (e) => config.theme.textColor = e.target.value);
    elements.secondaryTextColor.addEventListener('input', (e) => config.theme.secondaryText = e.target.value);
}

function updateCardBackground() {
    const color = elements.cardBgColor.value;
    const opacity = parseFloat(elements.cardBgOpacity.value) || 0.78;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    config.theme.cardBackground = `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ========================================
// Splash Settings
// ========================================
function initSplashSettings() {
    elements.splashEnabled.addEventListener('change', (e) => config.splash.enabled = e.target.checked);
    elements.splashText.addEventListener('input', (e) => config.splash.text = e.target.value);
    elements.splashSubtitle.addEventListener('input', (e) => config.splash.subtitle = e.target.value);
}

// ========================================
// Stats Settings
// ========================================
function initStatsSettings() {
    if (elements.showViews) {
        elements.showViews.addEventListener('change', (e) => config.stats.showViews = e.target.checked);
    }
    elements.locationText.addEventListener('input', (e) => config.stats.location = e.target.value);
    elements.locationEmoji.addEventListener('input', (e) => config.stats.locationEmoji = e.target.value);
}

// ========================================
// Save & Load Configuration
// ========================================
async function saveConfig() {
    // Force read overrides from inputs to ensure they are saved
    const nameInput = document.getElementById('discordServerName');
    const countInput = document.getElementById('discordMemberCount');
    const iconInput = document.getElementById('discordIconUrl');

    if (config.discord) {
        if (nameInput) config.discord.serverNameOverride = nameInput.value;
        if (countInput) config.discord.memberCountOverride = countInput.value;
        if (iconInput) config.discord.iconUrlOverride = iconInput.value;
    }

    try {
        // 1. Try to Save to Server API (Live Node.js App)
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            // Server save successful
            showToast('Changes saved to server!', 'success');
            console.log('Configuration saved to server.');

            // Still save to localStorage as backup
            localStorage.setItem('profileConfig', JSON.stringify(config));
        } else {
            throw new Error('Server API not available');
        }
    } catch (error) {
        // 2. Fallback: Browser-only mode (Static Hosting)
        console.warn('Server save failed, falling back to browser storage:', error);

        localStorage.setItem('profileConfig', JSON.stringify(config));
        showToast('Saved to Browser (Export required for perm save)', 'success');
    }
}

function exportConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Config file exported!');
}

async function loadConfig() {
    try {
        // ALWAYS try server API first for fresh data
        const response = await fetch('/api/config');
        if (response.ok) {
            config = await response.json();
            // Ensure arrays exist
            if (!config.badges) config.badges = [];
            if (!config.socialLinks) config.socialLinks = [];
            applyConfigToUI();
            console.log('Loaded config from server');
            return;
        }
    } catch (error) {
        console.log('Server config failed, trying localStorage');
    }

    try {
        // Fallback to localStorage
        const saved = localStorage.getItem('profileConfig');
        if (saved) {
            config = JSON.parse(saved);
            if (!config.badges) config.badges = [];
            if (!config.socialLinks) config.socialLinks = [];
            applyConfigToUI();
            return;
        }
    } catch (error) {
        console.log('Using default config');
    }
}

function applyConfigToUI() {
    // Profile
    if (config.profile) {
        document.getElementById('avatarUrl').value = config.profile.avatar || '';
        document.getElementById('username').value = config.profile.username || '';
        document.getElementById('displayName').value = config.profile.displayName || '';
        document.getElementById('bio').value = config.profile.bio || '';
        document.getElementById('statusText').value = config.profile.status || '';

        // New Fields
        if (document.getElementById('locationText')) {
            document.getElementById('locationText').value = config.profile.location || 'ALONE';
        }
        if (document.getElementById('fontStyle')) {
            document.getElementById('fontStyle').value = config.profile.font || "'Inter', sans-serif";
        }
        if (document.getElementById('usernameEffect')) {
            document.getElementById('usernameEffect').value = config.profile.usernameEffect || 'none';
        }
        if (document.getElementById('usernameColor')) {
            document.getElementById('usernameColor').value = config.profile.usernameColor || '#ffffff';
            // Update text span?
            const colorInput = document.getElementById('usernameColor');
            if (colorInput && colorInput.nextElementSibling) {
                colorInput.nextElementSibling.textContent = config.profile.usernameColor || '#ffffff';
            }
        }
        if (document.getElementById('cursorEffect')) {
            document.getElementById('cursorEffect').value = config.profile.cursorEffect || 'none';
        }

        // Avatar preview
        const preview = document.getElementById('avatarPreview');
        if (preview && config.profile.avatar) {
            preview.src = config.profile.avatar;
        }
    }

    // Discord
    if (config.discord) {
        elements.discordUserId.value = config.discord.userId || '';
        elements.discordServerId.value = config.discord.serverId || '';
        elements.showPresence.checked = config.discord.showPresence !== false;
        elements.showServer.checked = config.discord.showServer !== false;

        const inviteInput = document.getElementById('discordInviteUrl');
        if (inviteInput) {
            inviteInput.value = config.discord.inviteUrl || '';
        }

        const nameInput = document.getElementById('discordServerName');
        const countInput = document.getElementById('discordMemberCount');
        const iconInput = document.getElementById('discordIconUrl');

        if (nameInput) nameInput.value = config.discord.serverNameOverride || '';
        if (countInput) countInput.value = config.discord.memberCountOverride || '';
        if (iconInput) iconInput.value = config.discord.iconUrlOverride || '';
    }

    // Audio
    if (config.audio) {
        elements.audioEnabled.checked = config.audio.enabled !== false;
        elements.audioAutoplay.checked = config.audio.autoplay !== false;
        elements.audioUrl.value = config.audio.url || '';
        elements.audioVolume.value = (config.audio.volume || 0.5) * 100;
        elements.volumeValue.textContent = `${Math.round((config.audio.volume || 0.5) * 100)}%`;
    }

    // Theme
    if (config.theme) {
        if (elements.accentColor) elements.accentColor.value = config.theme.accentColor || '#00ff88';
        if (elements.accentColorText) elements.accentColorText.value = config.theme.accentColor || '#00ff88';

        // Card Appearance
        const transparencySlider = document.getElementById('cardTransparency');
        const transparencyValue = document.getElementById('cardTransparencyValue');
        const textMode = document.getElementById('cardTextMode');
        const blurSlider = document.getElementById('cardBlur');
        const blurValue = document.getElementById('cardBlurValue');

        if (transparencySlider && config.theme.cardTransparency !== undefined) {
            transparencySlider.value = config.theme.cardTransparency;
            transparencyValue.textContent = `${config.theme.cardTransparency}%`;
        }

        if (textMode && config.theme.cardTextMode) {
            textMode.value = config.theme.cardTextMode;
        }

        if (blurSlider && config.theme.cardBlur !== undefined) {
            blurSlider.value = config.theme.cardBlur;
            blurValue.textContent = `${config.theme.cardBlur}px`;
        }

        elements.borderRadius.value = config.theme.cardBorderRadius || 20;
        elements.radiusValue.textContent = `${config.theme.cardBorderRadius || 20}px`;
        elements.textColor.value = config.theme.textColor || '#ffffff';
        elements.secondaryTextColor.value = config.theme.secondaryText || '#a0a0a0';
    }

    // Splash
    if (config.splash) {
        elements.splashEnabled.checked = config.splash.enabled !== false;
        elements.splashText.value = config.splash.text || 'CLICK TO ENTER';
        elements.splashSubtitle.value = config.splash.subtitle || '🔊 Audio will play';
    }

    // Stats
    if (config.stats) {
        elements.locationText.value = config.stats.location || 'ALONE';
        elements.locationEmoji.value = config.stats.locationEmoji || '😔';
    }

    // Background
    if (config.background) {
        elements.bgType.value = config.background.type || 'video';
        elements.bgUrl.value = config.background.url || '';
    }

    // Render dynamic elements
    renderSocialLinks();
    renderBadgesGrid();
    renderCustomBadges();
}

async function hardResetConfig() {
    if (confirm('⚠️ HARD RESET: This will wipe ALL settings, badges, and social links permanently.\n\nAre you sure you want to start fresh?')) {
        // 1. Reset config object to absolute empty state for arrays
        config.badges = [];
        config.socialLinks = [];

        // 2. Clear localStorage
        localStorage.removeItem('profileConfig');

        // 3. Force save to server
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                showToast('Factory Reset Complete', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                throw new Error('Server returned error');
            }
        } catch (e) {
            console.error(e);
            alert('Server reset failed. Browser cache cleared. Please check console.');
            location.reload();
        }
    }
}

function resetConfig() {
    if (confirm('Are you sure you want to reset all settings?')) {
        localStorage.removeItem('profileConfig');
        location.reload();
    }
}

// ========================================
// Initialize
// ========================================
function init() {
    initNavigation();
    initProfileSettings();
    initBackgroundSettings();
    initAudioSettings();
    initSocialLinks();
    initDiscordSettings();
    initBadges();
    initThemeSettings();
    initSplashSettings();
    initStatsSettings();

    // Save button
    elements.saveBtn.addEventListener('click', saveConfig);

    // Hard Reset button
    const hardResetBtn = document.getElementById('hardResetBtn');
    if (hardResetBtn) {
        hardResetBtn.addEventListener('click', hardResetConfig);
    }

    // Export button (New)
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportConfig);
    }

    // Reset button
    elements.resetBtn.addEventListener('click', resetConfig);

    // Load existing config
    loadConfig();
}

document.addEventListener('DOMContentLoaded', init);
