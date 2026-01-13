/* ========================================
   Profile Page Script
   - Splash screen handling
   - Audio player controls
   - Discord Lanyard API integration
   - Discord Server Widget
   - Dynamic config loading
======================================== */

// Configuration
const CONFIG = {
    discord: {
        userId: '986665260750622780',
        serverId: '1259127565440778311'
    },
    lanyardApi: 'https://api.lanyard.rest/v1/users/',
    discordWidgetApi: 'https://discord.com/api/guilds/',
    updateInterval: 30000 // 30 seconds
};

// Badge Definitions
const BADGE_DEFS = {
    'premium': { icon: 'fas fa-crown', color: '#ffd700' },
    'verified': { icon: 'fas fa-check-circle', color: '#00ff88' },
    'dollar': { icon: 'fas fa-dollar-sign', color: '#00ff88' },
    'star': { icon: 'fas fa-star', color: '#00ff88' },
    'partner': { icon: 'fas fa-handshake', color: '#5865f2' },
    'developer': { icon: 'fas fa-code', color: '#9b59b6' },
    'early': { icon: 'fas fa-bolt', color: '#e74c3c' },
    'bug': { icon: 'fas fa-bug', color: '#2ecc71' }
};

// DOM Elements
const elements = {
    splash: document.getElementById('splash'),
    audio: document.getElementById('bgAudio'),
    audioToggle: document.getElementById('audioToggle'),
    audioIcon: document.getElementById('audioIcon'),
    volumeSlider: document.getElementById('volumeSlider'),

    // Profile
    avatar: document.getElementById('avatar'),
    username: document.getElementById('username'),
    displayName: document.getElementById('displayName'),
    bio: document.getElementById('bio'),
    badges: document.getElementById('badges'),

    // Discord Presence
    discordPresence: document.getElementById('discordPresence'),
    discordAvatar: document.getElementById('discordAvatar'),
    discordUsername: document.getElementById('discordUsername'),
    discordStatus: document.getElementById('discordStatus'),
    statusIndicator: document.getElementById('statusIndicator'),

    // Discord Server
    discordServer: document.getElementById('discordServer'),
    serverName: document.getElementById('serverName'),
    onlineCount: document.getElementById('onlineCount'),
    memberCount: document.getElementById('memberCount'),
    joinBtn: document.getElementById('joinBtn'),

    // Stats
    viewCount: document.getElementById('viewCount'),
    locationText: document.getElementById('locationText'),
    locationEmoji: document.getElementById('locationEmoji'),

    // Social Links
    socialLinks: document.getElementById('socialLinks')
};

// ========================================
// Splash Screen
// ========================================
function initSplash() {
    if (!elements.splash) return;

    elements.splash.addEventListener('click', () => {
        elements.splash.classList.add('hidden');

        // Start audio using config URL
        // Start audio from config
        if (elements.audio && window.loadedConfig && window.loadedConfig.audio) {
            const audioConfig = window.loadedConfig.audio;

            if (audioConfig.enabled && audioConfig.url && audioConfig.url.trim() !== '') {
                // Check if file actually exists via HEAD request or just try/catch play
                elements.audio.src = audioConfig.url;
                elements.audio.volume = audioConfig.volume || 0.5;
                elements.audio.muted = false;

                const playPromise = elements.audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Audio playing');
                        if (elements.audioIcon) {
                            elements.audioIcon.className = elements.audio.volume < 0.5 ? 'fas fa-volume-low' : 'fas fa-volume-high';
                        }
                    }).catch(error => {
                        console.warn('Audio play failed (user interaction needed or file missing):', error);
                        // Don't log full error stack to avoid console spam
                    });
                }
            }
        }
    });
}


// ========================================
// Audio Controls - Mute/Unmute Toggle
// ========================================
let isMuted = false;

function initAudio() {
    if (!elements.audioToggle) {
        console.log('Audio toggle button not found');
        return;
    }

    elements.audioToggle.addEventListener('click', toggleMute);

    // Volume slider control
    if (elements.volumeSlider) {
        elements.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            if (elements.audio) {
                elements.audio.volume = volume;
                // If adjusting volume, unmute
                if (isMuted && volume > 0) {
                    isMuted = false;
                    elements.audio.muted = false;
                }
            }
            updateVolumeIcon(volume);
        });
    }

    // Set initial icon based on audio state
    if (elements.audio) {
        elements.audio.addEventListener('volumechange', () => {
            updateVolumeIcon(elements.audio.muted ? 0 : elements.audio.volume);
        });
    }
}

function toggleMute() {
    if (!elements.audio) {
        console.log('Audio element not found');
        return;
    }

    isMuted = !isMuted;
    elements.audio.muted = isMuted;

    if (isMuted) {
        elements.audioIcon.className = 'fas fa-volume-xmark';
        elements.audioToggle.classList.add('muted');
    } else {
        updateVolumeIcon(elements.audio.volume);
        elements.audioToggle.classList.remove('muted');
    }
}

function updateVolumeIcon(volume) {
    if (!elements.audioIcon) return;

    if (isMuted || volume === 0) {
        elements.audioIcon.className = 'fas fa-volume-xmark';
    } else if (volume < 0.5) {
        elements.audioIcon.className = 'fas fa-volume-low';
    } else {
        elements.audioIcon.className = 'fas fa-volume-high';
    }
}

// ========================================
// Discord Lanyard Integration
// ========================================
async function fetchLanyardData() {
    try {
        const response = await fetch(`${CONFIG.lanyardApi}${CONFIG.discord.userId}`);
        const data = await response.json();

        if (data.success) {
            updateDiscordPresence(data.data);
        }
    } catch (error) {
        console.error('Lanyard API Error:', error);
    }
}

function updateDiscordPresence(data) {
    // Update avatar
    if (data.discord_user) {
        // Use manual config avatar if set, otherwise use Discord avatar
        let avatarUrl = window.loadedConfig?.profile?.avatar;

        if (!avatarUrl) {
            avatarUrl = data.discord_user.avatar
                ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`
                : ''; // No fallback to default-avatar.png
        }

        elements.discordAvatar.src = avatarUrl;
        elements.avatar.src = avatarUrl;

        // Avatar Decoration
        const decoration = data.discord_user.avatar_decoration_data;
        if (decoration) {
            const decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${decoration.asset}.png`; // Corrected URL structure
            let decorationEl = document.querySelector('.avatar-decoration-img');
            if (!decorationEl) {
                decorationEl = document.createElement('img');
                decorationEl.className = 'avatar-decoration-img';
                // Assuming .avatar-container is the parent of elements.avatar
                // If not, you might need to adjust this selector or structure
                const avatarContainer = elements.avatar.closest('.avatar-container');
                if (avatarContainer) {
                    avatarContainer.appendChild(decorationEl);
                } else {
                    console.warn("Could not find .avatar-container for avatar decoration.");
                }
            }
            decorationEl.src = decorationUrl;
            // Hide default ornament if a decoration is present
            const avatarOrnament = document.querySelector('.avatar-ornament');
            if (avatarOrnament) {
                avatarOrnament.style.display = 'none';
            }
        } else {
            // If no decoration, ensure ornament is visible and decoration is removed
            const avatarOrnament = document.querySelector('.avatar-ornament');
            if (avatarOrnament) {
                avatarOrnament.style.display = ''; // Reset to default
            }
            const decorationEl = document.querySelector('.avatar-decoration-img');
            if (decorationEl) {
                decorationEl.remove();
            }
        }

        // Update username
        elements.discordUsername.textContent = data.discord_user.username;

        // Only update display name from Discord if NOT set in manual config
        if (!window.loadedConfig?.profile?.displayName) {
            elements.displayName.textContent = data.discord_user.global_name || data.discord_user.username;
        }
    }

    // Update status
    updateStatusIndicator(data.discord_status);

    // Update activity & Custom Status with Emoji
    const customStatus = data.activities.find(a => a.type === 4);
    const otherActivity = data.activities.find(a => a.type !== 4);

    if (customStatus) {
        let statusText = customStatus.state || '';
        if (customStatus.emoji) {
            const emoji = customStatus.emoji;
            if (emoji.id) {
                // Custom emoji
                const emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
                statusText = `<img src="${emojiUrl}" class="status-emoji" alt="emoji"> ${statusText}`;
            } else if (emoji.name) {
                // Unicode emoji
                statusText = `${emoji.name} ${statusText}`;
            }
        }
        elements.discordStatus.innerHTML = statusText || 'currently doing nothing';
        // Don't update main profile bio - it's controlled by admin config only
    } else if (otherActivity) {
        if (otherActivity.type === 0) { // Playing
            elements.discordStatus.textContent = `Playing ${otherActivity.name}`;
        } else if (otherActivity.type === 2) { // Listening
            elements.discordStatus.textContent = `Listening to ${otherActivity.details}`;
            showSpotifyActivity(data.spotify);
        } else {
            elements.discordStatus.textContent = otherActivity.name;
        }
    } else {
        elements.discordStatus.textContent = 'currently doing nothing';
    }
}

function updateStatusIndicator(status) {
    elements.statusIndicator.className = 'status-indicator';

    switch (status) {
        case 'online':
            elements.statusIndicator.classList.add('online');
            break;
        case 'idle':
            elements.statusIndicator.classList.add('idle');
            break;
        case 'dnd':
            elements.statusIndicator.classList.add('dnd');
            break;
        default:
            elements.statusIndicator.classList.add('offline');
    }
}

function showSpotifyActivity(spotify) {
    if (!spotify) return;

    // Check if Spotify activity element exists
    let spotifyEl = document.querySelector('.spotify-activity');

    if (!spotifyEl) {
        spotifyEl = document.createElement('div');
        spotifyEl.className = 'spotify-activity';
        spotifyEl.innerHTML = `
            <img class="album-art" src="${spotify.album_art_url}" alt="Album Art">
            <div class="track-info">
                <div class="track-name">${spotify.song}</div>
                <div class="artist-name">${spotify.artist}</div>
            </div>
            <i class="fab fa-spotify spotify-logo"></i>
        `;
        elements.discordPresence.after(spotifyEl);
    } else {
        spotifyEl.querySelector('.album-art').src = spotify.album_art_url;
        spotifyEl.querySelector('.track-name').textContent = spotify.song;
        spotifyEl.querySelector('.artist-name').textContent = spotify.artist;
    }
}

// ========================================
// Discord Server Widget
// ========================================
async function fetchServerWidget() {
    // Check for overrides first
    if (CONFIG.discord.serverNameOverride || CONFIG.discord.memberCountOverride) {
        updateServerWidget({
            name: CONFIG.discord.serverNameOverride,
            presence_count: null, // Custom string handler
            instant_invite: CONFIG.discord.inviteUrl
        });
        return;
    }

    try {
        // Add timestamp to prevent caching
        const response = await fetch(`${CONFIG.discordWidgetApi}${CONFIG.discord.serverId}/widget.json?t=${Date.now()}`);

        if (!response.ok) {
            throw new Error('Widget not enabled');
        }

        const data = await response.json();
        updateServerWidget(data);
    } catch (error) {
        console.error('Discord Widget Error:', error);

        // If override is partially set or just failed
        if (CONFIG.discord.serverNameOverride) {
            updateServerWidget({ name: CONFIG.discord.serverNameOverride });
        } else {
            elements.serverName.textContent = 'Server Unavailable';
            elements.onlineCount.textContent = '• Widget Disabled';
            elements.memberCount.textContent = '';
        }
    }
}

function updateServerWidget(data) {
    if (CONFIG.discord.serverNameOverride) {
        elements.serverName.textContent = CONFIG.discord.serverNameOverride;
    } else {
        elements.serverName.textContent = data.name || 'Discord Server';
    }

    if (CONFIG.discord.memberCountOverride) {
        elements.onlineCount.textContent = CONFIG.discord.memberCountOverride;
        elements.memberCount.textContent = '';
    } else {
        elements.onlineCount.textContent = `• ${data.presence_count || 0} Online`;
        elements.memberCount.textContent = '';
    }

    // Icon Override
    if (CONFIG.discord.iconUrlOverride) {
        const iconContainer = elements.discordServer.querySelector('.server-icon');
        if (iconContainer) {
            iconContainer.innerHTML = `<img src="${CONFIG.discord.iconUrlOverride}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
    }

    // Update join button
    if (CONFIG.discord.inviteUrl) {
        elements.joinBtn.href = CONFIG.discord.inviteUrl;
    } else if (data.instant_invite) {
        elements.joinBtn.href = data.instant_invite;
    }
}

// ========================================
// View Counter (Local Storage)
// ========================================
function updateViewCounter() {
    let views = parseInt(localStorage.getItem('profileViews') || '0');
    views++;
    localStorage.setItem('profileViews', views.toString());
    elements.viewCount.textContent = views;
}

// ========================================
// Load Config
// ========================================
async function loadConfig() {
    try {
        // Always load from config.json for fresh data
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            console.log('Config loaded, audio:', config.audio);
            applyConfig(config);
        } else {
            // Fallback to static config.json
            const staticResponse = await fetch('config.json');
            const config = await staticResponse.json();
            console.log('Static config loaded, audio:', config.audio);
            applyConfig(config);
        }
    } catch (error) {
        console.error('Config loading failed:', error);
    }
}

function applyConfig(config) {
    window.loadedConfig = config;

    // Apply Discord IDs
    if (config.discord) {
        CONFIG.discord.userId = config.discord.userId;
        CONFIG.discord.serverId = config.discord.serverId;
        CONFIG.discord.inviteUrl = config.discord.inviteUrl;
        CONFIG.discord.serverNameOverride = config.discord.serverNameOverride;
        CONFIG.discord.memberCountOverride = config.discord.memberCountOverride;
        CONFIG.discord.iconUrlOverride = config.discord.iconUrlOverride;
    }

    // Apply profile info
    if (config.profile) {
        // Update Text Content
        elements.username.textContent = config.profile.username || 'Username';
        // elements.displayName.textContent = config.profile.displayName || 'Display Name'; // Replaced by Typewriter

        // Typewriter for Display Name
        const rawName = config.profile.displayName || 'fryx';
        startTypewriter(elements.displayName, rawName);

        // Font Application
        if (config.profile.font) {
            // Apply font to the profile card specifically
            const profileCard = document.querySelector('.profile-card');
            if (profileCard) {
                profileCard.style.fontFamily = config.profile.font;
            }
        }


        // Username Effects & Color
        if (elements.username) {
            elements.username.classList.remove('effect-neon', 'effect-pop');

            if (config.profile.usernameEffect && config.profile.usernameEffect !== 'none') {
                elements.username.classList.add(config.profile.usernameEffect);
            }

            if (config.profile.usernameColor) {
                elements.username.style.setProperty('--username-color', config.profile.usernameColor);
                // Only force color if not none? Or always? User said "color option".
                elements.username.style.color = config.profile.usernameColor;
                // Ensure !important logic in CSS doesn't override this?
                // Current CSS for username: `.username { color: var(--text-primary); ... }`
                // Inline style overrides class. So this works.
            } else {
                elements.username.style.removeProperty('--username-color');
                elements.username.style.removeProperty('color');
            }
        }

        // Status Text logic (Manual Override)
        // If not using Discord status, or if overrides are preferred
        // The user asked to "make status text working", likely meaning the manual one from Admin
        // Bio Logic
        if (config.profile.bio) {
            elements.bio.textContent = config.profile.bio;
        } else {
            elements.bio.textContent = '';
        }

        // Location (if element exists)
        const locElement = document.querySelector('.location-text');
        if (locElement) {
            locElement.textContent = config.profile.location || 'ALONE';
        }

        // Update Avatar
        if (config.profile.avatar) {
            elements.avatar.src = config.profile.avatar;
        }
    }

    // Render badges next to username
    if (config.badges && elements.badges) {
        elements.badges.innerHTML = '';

        // Badge definitions for preset badges
        const BADGE_DEFS = {
            'premium': { icon: 'fas fa-crown', color: '#ffd700' },
            'verified': { icon: 'fas fa-check-circle', color: '#00ff88' },
            'dollar': { icon: 'fas fa-dollar-sign', color: '#00ff88' },
            'star': { icon: 'fas fa-star', color: '#ffd700' },
            'partner': { icon: 'fas fa-handshake', color: '#5865f2' },
            'developer': { icon: 'fas fa-code', color: '#9b59b6' },
            'early': { icon: 'fas fa-bolt', color: '#e74c3c' },
            'bug': { icon: 'fas fa-bug', color: '#2ecc71' }
        };

        config.badges.filter(b => b.enabled).forEach(badge => {
            const span = document.createElement('span');
            span.className = 'badge';
            span.title = badge.name || badge.id.charAt(0).toUpperCase() + badge.id.slice(1);

            // Check if it's a custom badge with an image
            if (badge.isCustom && badge.imageUrl) {
                span.innerHTML = `<img src="${badge.imageUrl}" alt="${badge.name || 'Badge'}" style="width: 18px; height: 18px; object-fit: contain;">`;
            } else {
                // Preset badge with icon
                const def = BADGE_DEFS[badge.id];
                if (def) {
                    span.innerHTML = `<i class="${def.icon}" style="color: ${def.color}"></i>`;
                }
            }

            elements.badges.appendChild(span);
        });
    }

    // Apply theme
    // Apply theme
    if (config.theme) {
        const root = document.documentElement;
        if (config.theme.accentColor) {
            root.style.setProperty('--accent-primary', config.theme.accentColor);
        }

        // Handle Card Transparency & Appearance
        const card = document.querySelector('.profile-card');
        if (card) {
            // Transparency & Blur
            const transparency = config.theme.cardTransparency !== undefined ? config.theme.cardTransparency : 55;
            const blur = config.theme.cardBlur !== undefined ? config.theme.cardBlur : 20;
            const alpha = 1 - (transparency / 100);

            // Dark Glass Accent Theme ("Like That")

            // 1. Card Base: Black with Opacity (Smoked Glass)
            card.style.setProperty('--bg-card', `rgba(0, 0, 0, ${alpha.toFixed(2)})`);

            // 2. Text: Always White/Light
            card.style.setProperty('--text-primary', '#ffffff');
            card.style.setProperty('--text-secondary', '#cccccc');
            card.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.1)');
            card.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.15)');

            // 3. Widgets: Tinted with Accent Color
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            const accent = config.theme.accentColor || '#00ff88';
            const rgb = hexToRgb(accent);
            if (rgb) {
                // Tinted background (15% opacity)
                card.style.setProperty('--widget-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
            } else {
                // Fallback
                card.style.setProperty('--widget-bg', 'rgba(255, 255, 255, 0.1)');
            }
        }
    }

    // Apply audio settings
    if (config.audio) { // Removed `elements.audio` check here as we might create it
        if (config.audio.url) {
            // Create audio element if it doesn't exist or URL changes
            if (!elements.audio || elements.audio.src !== config.audio.url) {
                const audio = new Audio(config.audio.url);
                audio.loop = true;
                audio.volume = 0.3; // Default to 30% as requested
                elements.audio = audio;
            }
        }
        if (config.audio.volume && elements.audio) { // Ensure elements.audio exists before setting volume
            elements.audio.volume = config.audio.volume;
        }
    }

    // Cursor Effects
    if (window.cursorEffects && config.profile) {
        window.cursorEffects.setEffect(config.profile.cursorEffect || 'none');
    }

    // Apply background
    if (config.background) {
        const video = document.getElementById('bgVideo');
        if (video && config.background.url) {
            video.src = config.background.url;
        }
    }

    // Apply stats
    if (config.stats) {
        if (config.stats.location && elements.locationText) {
            elements.locationText.textContent = config.stats.location;
        }
        if (config.stats.locationEmoji && elements.locationEmoji) {
            elements.locationEmoji.textContent = config.stats.locationEmoji;
        }
    }

    // Apply splash settings
    if (config.splash && !config.splash.enabled) {
        elements.splash.classList.add('hidden');
    }

    // Update social links
    if (config.socialLinks) {
        updateSocialLinks(config.socialLinks);
    }

    // Update badges
    if (config.badges) {
        updateBadges(config.badges);
    }
}

function updateSocialLinks(links) {
    if (!elements.socialLinks) return;
    elements.socialLinks.innerHTML = '';

    const enabledLinks = links.filter(link => link.enabled);

    enabledLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url || '#';
        a.className = 'social-icon';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.platform = link.id;
        // Tooltip
        a.dataset.tooltip = link.name || link.id;

        const iconClass = getIconClass(link.id);
        a.innerHTML = `<i class="${iconClass}"></i>`;

        elements.socialLinks.appendChild(a);
    });
}

function updateBadges(badges) {
    if (!elements.badges) return;
    elements.badges.innerHTML = '';

    const enabledBadges = badges.filter(badge => badge.enabled);

    enabledBadges.forEach(badge => {
        const span = document.createElement('span');
        span.className = 'badge';
        // Tooltip
        span.dataset.tooltip = badge.name || badge.id || '';
        if (badge.id) span.dataset.badge = badge.id;

        // Check for custom image first
        if (badge.imageUrl) {
            const img = document.createElement('img');
            img.src = badge.imageUrl;
            img.alt = badge.name || badge.id;
            img.className = 'badge-img';
            span.appendChild(img);
        } else {
            // Look up icon from BADGE_DEFS using badge.id
            const def = BADGE_DEFS[badge.id];
            if (def && def.icon) {
                span.innerHTML = `<i class="${def.icon}" style="color: ${def.color || 'inherit'}"></i>`;
            } else if (badge.icon) {
                // Fallback to badge.icon if it exists
                span.innerHTML = `<i class="${badge.icon}"></i>`;
            }
        }

        elements.badges.appendChild(span);
    });
}

function getIconClass(icon) {
    const iconMap = {
        'github': 'fab fa-github',
        'discord': 'fab fa-discord',
        'telegram': 'fab fa-telegram',
        'spotify': 'fab fa-spotify',
        'envelope': 'fas fa-envelope',
        'email': 'fas fa-envelope',
        'twitter': 'fab fa-twitter',
        'instagram': 'fab fa-instagram',
        'youtube': 'fab fa-youtube',
        'twitch': 'fab fa-twitch',
        'bitcoin': 'fab fa-bitcoin',
        'ethereum': 'fab fa-ethereum',
        'litecoin': 'fas fa-coins',
        'solana': 'fas fa-sun',
        'tiktok': 'fab fa-tiktok',
        'reddit': 'fab fa-reddit',
        'linkedin': 'fab fa-linkedin',
        'steam': 'fab fa-steam',
        'paypal': 'fab fa-paypal'
    };

    return iconMap[icon] || 'fas fa-link';
}

// ========================================
// Navbar Tab Logic (Home / Portfolio / Contact)
// ========================================
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            // 1. Update Buttons
            navItems.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Update Sections
            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });

            // 3. Focus Mode Logic (Hide Background for Portfolio & Contact)
            if (targetId === 'portfolio' || targetId === 'contact') {
                document.body.classList.add('portfolio-mode'); // Using existing class that hides bg
            } else {
                document.body.classList.remove('portfolio-mode');
            }

            // 3. Optional: Play click sound if audio enabled
            // if (elements.audio && !elements.audio.paused) { ... }
        });
    });
}

// ========================================
// Initialize
// ========================================
async function init() {
    // Load configuration first
    await loadConfig();

    // Initialize components
    initSplash();
    initAudio();
    initTabs(); // New Navbar Logic

    // Fetch Discord data
    fetchLanyardData();
    fetchServerWidget();

    // Update view counter
    updateViewCounter();

    // Set up periodic updates
    setInterval(fetchLanyardData, CONFIG.updateInterval);
    setInterval(fetchServerWidget, CONFIG.updateInterval * 2);

    // Live Sync: Listen for config changes from admin panel
    initLiveSync();
}

// ========================================
// Live Sync - Instant Updates from Admin
// ========================================
function initLiveSync() {
    // Method 1: Listen for localStorage changes (works across tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'profileConfig' && e.newValue) {
            console.log('Live sync: Config changed, reloading...');
            try {
                const newConfig = JSON.parse(e.newValue);
                applyConfig(newConfig);
                showLiveSyncIndicator();
            } catch (err) {
                console.error('Live sync parse error:', err);
            }
        }
    });

    // Method 2: Poll for changes every 2 seconds (backup for same-tab)
    let lastConfigHash = '';
    setInterval(async () => {
        try {
            const response = await fetch('/api/config?t=' + Date.now());
            if (response.ok) {
                const text = await response.text();
                const hash = simpleHash(text);
                if (lastConfigHash && hash !== lastConfigHash) {
                    console.log('Live sync: Server config changed, reloading...');
                    const newConfig = JSON.parse(text);
                    applyConfig(newConfig);
                    showLiveSyncIndicator();
                }
                lastConfigHash = hash;
            }
        } catch (err) {
            // Silently fail
        }
    }, 2000);
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function showLiveSyncIndicator(message = '✓ Live Updated') {
    // Brief visual indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = 'position:fixed;top:20px;right:20px;background:#00ff88;color:#000;padding:10px 20px;border-radius:8px;font-weight:bold;z-index:9999;animation:fadeOut 2s forwards;';
    indicator.textContent = message;
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
}

// ------------------------------------------------------------
// View Counter (External API for Netlify Persistence)
// ------------------------------------------------------------
function initViewCounter() {
    const viewElement = document.getElementById('viewCount');
    if (!viewElement) return;

    // Use a unique namespace based on the project domain or username to avoid collisions
    const NAMESPACE = 'frshguns.lol-vxch';
    const KEY = 'visits';

    // 1. Hit the counter (Increment)
    fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`)
        .then(res => res.json())
        .then(data => {
            viewElement.textContent = data.value;
        })
        .catch(() => {
            // Fallback: Just get the value if hit fails (or rate limited)
            fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`)
                .then(res => res.json())
                .then(data => { viewElement.textContent = data.value; })
                .catch(err => console.error('View counter failed:', err));
        });
}

// ------------------------------------------------------------
// Crypto Address Copy Logic
// ------------------------------------------------------------
function _deprecated_initCryptoCopy() {
    const CRYPTO_PLATFORMS = ['bitcoin', 'ethereum', 'litecoin', 'solana', 'dogecoin', 'monero'];

    document.addEventListener('click', (e) => {
        const link = e.target.closest('.social-icon');
        if (!link) return;

        const platform = link.dataset.platform;
        if (!platform || !CRYPTO_PLATFORMS.includes(platform)) return;

        // Verify it has a value (the "href" is the address in this case)
        const address = link.getAttribute('href');
        if (!address || address === '#') return;

        e.preventDefault(); // Stop navigation

        navigator.clipboard.writeText(address).then(() => {
            // Visual Feedback
            // 1. Show Toast
            showLiveSyncIndicator(); // Reusing existing indicator logic, or create new?

            // 2. Or update tooltip temporarily
            const originalTooltip = link.dataset.tooltip;

            // Update smart tooltip if visible
            const smartTooltip = document.getElementById('smartTooltip');
            if (smartTooltip && smartTooltip.classList.contains('visible')) {
                smartTooltip.textContent = 'Copied!';
                setTimeout(() => {
                    smartTooltip.textContent = originalTooltip;
                }, 1500);
            }

            // Fallback indicator
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:#00ff88;padding:15px 25px;border-radius:12px;font-weight:bold;z-index:10000;pointer-events:none;backdrop-filter:blur(5px);border:1px solid #00ff88;box-shadow:0 0 20px rgba(0,255,136,0.3);';
            feedback.innerHTML = `<i class="fas fa-check-circle"></i> Address Copied!`;
            document.body.appendChild(feedback);

            // Animate out
            feedback.animate([
                { opacity: 0, transform: 'translate(-50%, -40%)' },
                { opacity: 1, transform: 'translate(-50%, -50%)', offset: 0.1 },
                { opacity: 1, transform: 'translate(-50%, -50%)', offset: 0.8 },
                { opacity: 0, transform: 'translate(-50%, -60%)' }
            ], {
                duration: 2000,
                easing: 'ease-out'
            }).onfinish = () => feedback.remove();

        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    init();
    initTiltEffect();
    initSmartTooltips();
    initViewCounter();
    initCryptoCopy();
});

// 3D Tilt Effect Logic
// 3D Tilt Effect Logic
// 3D Tilt Effect Logic (Smoother & Lockable)
function initTiltEffect() {
    const container = document.querySelector('.main-container');
    if (!container) return;

    let isLocked = false;

    // Double Tap/Click to Lock
    container.addEventListener('dblclick', () => {
        isLocked = !isLocked;
        // Popup Removed as requested

        if (isLocked) {
            // Reset transform when locked
            const cards = document.querySelectorAll('.profile-card, .port-card, .contact-card-full');
            cards.forEach(c => c.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)');
        }
    });

    // Moving Animation Event
    container.addEventListener('mousemove', (e) => {
        if (isLocked) return;

        // Target the main card in the active section
        const activeSection = document.querySelector('.page-section.active');
        // Only apply tilt to Home and Contact main cards (Portfolio grid is too complex/distracting to tilt)
        if (!activeSection || activeSection.id === 'portfolio') return;

        const card = activeSection.querySelector('.profile-card, .contact-card-full');
        if (!card) return;

        card.style.transition = 'transform 0.1s ease-out'; // Smooth follow

        const rect = card.getBoundingClientRect();
        // Mouse relative to card center
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);

        // Rotation Strength
        const rotateX = -(y / 25).toFixed(2);
        const rotateY = (x / 25).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // Reset on leave
    container.addEventListener('mouseleave', () => {
        const cards = document.querySelectorAll('.profile-card, .contact-card-full');
        cards.forEach(c => {
            c.style.transition = 'transform 0.5s ease';
            c.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
        });
    });
}


// ------------------------------------------------------------
// NEW Crypto Address Copy Logic (Mobile/HTTP Friendly)
// ------------------------------------------------------------
function initCryptoCopy() {
    const CRYPTO_PLATFORMS = ['bitcoin', 'ethereum', 'litecoin', 'solana', 'dogecoin', 'monero'];

    document.addEventListener('click', (e) => {
        const link = e.target.closest('.social-icon');
        if (!link) return;

        const platform = link.dataset.platform;
        if (!platform || !CRYPTO_PLATFORMS.includes(platform)) return;

        // Verify it has a value
        const address = link.getAttribute('href');
        if (!address || address === '#') return;

        e.preventDefault(); // Stop navigation

        // Fallback Copy Function
        const copyToClipboard = async (text) => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    textArea.style.top = '0';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return successful;
                }
            } catch (err) {
                console.error('Copy failed:', err);
                return false;
            }
        };

        copyToClipboard(address).then((success) => {
            if (!success) {
                alert(`Copy failed. Address: ${address}`);
                return;
            }

            // Visual Feedback: Toast
            const feedback = document.createElement('div');
            feedback.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.85);color:#00ff88;padding:20px 30px;border-radius:15px;font-weight:bold;font-size:1.2rem;z-index:99999;pointer-events:none;backdrop-filter:blur(5px);border:1px solid rgba(0,255,136,0.3);box-shadow:0 0 30px rgba(0,255,136,0.2);text-align:center;';
            feedback.innerHTML = `<i class="fas fa-check-circle" style="font-size:2rem;display:block;margin-bottom:10px;"></i>Address Copied!`;
            document.body.appendChild(feedback);

            feedback.animate([
                { opacity: 0, transform: 'translate(-50%, -40%) scale(0.9)' },
                { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.1 },
                { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.8 },
                { opacity: 0, transform: 'translate(-50%, -60%) scale(0.9)' }
            ], {
                duration: 1500,
                easing: 'ease-out'
            }).onfinish = () => feedback.remove();
        });
    });
}

// Typewriter Logic from Request
let typewriterInterval;
function startTypewriter(element, text) {
    if (typewriterInterval) clearInterval(typewriterInterval);

    let i = 0;
    let isDeleting = false;
    let currentText = '';

    function type() {
        if (isDeleting) {
            currentText = text.substring(0, currentText.length - 1);
        } else {
            currentText = text.substring(0, currentText.length + 1);
        }

        element.textContent = currentText;

        let typeSpeed = isDeleting ? 100 : 200;

        if (!isDeleting && currentText === text) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            typeSpeed = 500;
        }

        typewriterInterval = setTimeout(type, typeSpeed);
    }
    type();
}

// ------------------------------------------------------------
// SMART TOOLTIPS (JS-Based for Social Icons to prevent clipping)
// ------------------------------------------------------------
function initSmartTooltips() {
    // 1. Create the single global tooltip element if not exists
    let tooltip = document.getElementById('smartTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'smartTooltip';
        tooltip.className = 'smart-tooltip';
        document.body.appendChild(tooltip);
    }

    // 2. Global Event Delegation
    document.addEventListener('mouseover', (e) => {
        // Target: .social-icon with data-tooltip
        const target = e.target.closest('.social-icon[data-tooltip]');
        if (!target) return;

        const text = target.dataset.tooltip;
        if (!text) return;

        // Content
        tooltip.textContent = text;
        tooltip.classList.add('visible');

        // Position Logic
        const updatePosition = () => {
            const rect = target.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            // Center above the element
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 10; // 10px gap

            // Boundary checks (keep on screen)
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top < 10) {
                // If too close to top, show below instead
                top = rect.bottom + 10;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        };

        updatePosition();
        // Recalculate once to ensure width is correct after text set
        requestAnimationFrame(updatePosition);
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('.social-icon[data-tooltip]');
        if (target) {
            tooltip.classList.remove('visible');
        }
    });

    // Optional: Hide on scroll to prevent detached floating
    window.addEventListener('scroll', () => {
        tooltip.classList.remove('visible');
    }, { passive: true });
}


