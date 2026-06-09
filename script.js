const CONFIG = {
    birthDate: '2005-12-16',
    typewriterTexts: ['Jane Wirz', 'bl4zee'],
    terminalCommand: 'fastfetch',
    revealOffset: '20px',
    revealThreshold: 0.1,
    discordUserId: '502866937617973260'
};

document.addEventListener('DOMContentLoaded', function () {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Reveal Animations using IntersectionObserver
    const revealCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.delay || 0;

                setTimeout(() => {
                    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay);

                observer.unobserve(element);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: CONFIG.revealThreshold
    });

    const cards = document.querySelectorAll('.social-card, .project-card, .text-center, .terminal-window');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = `translateY(${CONFIG.revealOffset})`;
        // Add staggered delay based on index for elements near each other
        card.dataset.delay = (index % 4) * 100;
        revealObserver.observe(card);
    });

    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Typewriter
    class Typewriter {
        constructor(elementId, texts, waitTime = 3000) {
            this.element = document.getElementById(elementId);
            if (!this.element) return;
            this.texts = texts;
            this.waitTime = waitTime;
            this.txt = '';
            this.wordIndex = 0;
            this.isDeleting = false;
            this.type();
            this.element.classList.add('cursor');
        }

        type() {
            const currentHook = this.wordIndex % this.texts.length;
            const fullTxt = this.texts[currentHook];

            if (this.isDeleting) {
                this.txt = fullTxt.substring(0, this.txt.length - 1);
            } else {
                this.txt = fullTxt.substring(0, this.txt.length + 1);
            }

            this.element.textContent = this.txt;

            let typeSpeed = 100;
            if (this.isDeleting) typeSpeed /= 2;

            if (!this.isDeleting && this.txt === fullTxt) {
                typeSpeed = this.waitTime;
                this.isDeleting = true;
            } else if (this.isDeleting && this.txt === '') {
                this.isDeleting = false;
                this.wordIndex++;
                typeSpeed = 500;
            }

            setTimeout(() => this.type(), typeSpeed);
        }
    }
    new Typewriter('typewriter-text', CONFIG.typewriterTexts);

    // Age Counter
    function updateAge() {
        const ageElement = document.getElementById('age-display');
        if (!ageElement) return;
        const birthDate = new Date(CONFIG.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        ageElement.textContent = age + ' years old';
    }
    updateAge();
    setInterval(updateAge, 86400000);

    // Terminal Logic
    const Terminal = {
        async execute(container) {
            let text = "";
            try {
                const response = await fetch('fastfetch.txt');
                if (!response.ok) throw new Error('Failed to load');
                text = await response.text();
            } catch (error) {
                console.error('Error fetching fastfetch.txt:', error);
                text = "Error: Could not load terminal output.";
            }

            const outputDiv = document.createElement('div');
            outputDiv.className = 'neofetch-output';

            const processedLines = text.split('\n').map(line => this.processLine(line));

            const pre = document.createElement('pre');
            Object.assign(pre.style, {
                fontFamily: "'CaskaydiaCove Nerd Font Mono', 'JetBrains Mono', monospace",
                lineHeight: '1.3',
                whiteSpace: 'pre',
                margin: '0',
                overflowX: 'auto',
                color: 'var(--terminal-text)',
                fontSize: '14px'
            });

            pre.innerHTML = processedLines.join('\n');
            outputDiv.appendChild(pre);
            container.appendChild(outputDiv);
            this.addPrompt(container);
        },

        processLine(line) {
            let safeLine = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

            // User@Host
            if (safeLine.includes('@') && !safeLine.includes(': ')) {
                const match = safeLine.match(/^(.*?)(\s+)([^\s]+@[^\s]+)$/);
                if (match) {
                    return `<span style="color: var(--terminal-cyan)">${match[1]}</span>${match[2]}<span style="color: var(--terminal-cyan); text-decoration: underline; font-weight: bold;">${match[3]}</span>`;
                }
            }

            // Dhashes
            if (safeLine.includes('-----------')) {
                const match = safeLine.match(/^(.*?)(\s+)(-----------)$/);
                if (match) {
                    return `<span style="color: var(--terminal-cyan)">${match[1]}</span>${match[2]}<span style="color: var(--terminal-cyan)">${match[3]}</span>`;
                }
            }

            // Key: Value
            if (safeLine.includes(': ')) {
                const match = safeLine.match(/^(.*?)(\s{5,})([A-Za-z0-9\s(/)]+:\s+)(.*)$/);
                if (match) {
                    const valPart = match[4].replace(/(\(\d+%\))/g, '<span style="color: var(--terminal-green)">$1</span>');
                    return `<span style="color: var(--terminal-cyan)">${match[1]}</span>${match[2]}<span style="color: var(--terminal-cyan); font-weight: bold;">${match[3]}</span><span style="color: var(--terminal-text)">${valPart}</span>`;
                }
            }

            return `<span style="color: var(--terminal-cyan)">${safeLine}</span>`;
        },

        addPrompt(container) {
            const newPrompt = document.createElement('div');
            newPrompt.className = 'prompt';
            newPrompt.innerHTML = `<span class="prompt-path" style="color: var(--terminal-path)">~</span> <span class="prompt-symbol" style="color: var(--terminal-dot-green)">&gt;</span> <span class="input-line"></span><span class="cursor-block"></span>`;

            const prevCursor = container.querySelector('.prompt:not(:last-child) .cursor-block');
            if (prevCursor) prevCursor.remove();

            container.appendChild(newPrompt);
            container.scrollTop = container.scrollHeight;
        },

        startTyping(inputElement, containerElement) {
            const text = CONFIG.terminalCommand;
            let index = 0;
            inputElement.textContent = "";

            const typeChar = () => {
                if (index < text.length) {
                    inputElement.textContent += text.charAt(index);
                    index++;
                    setTimeout(typeChar, 100 + Math.random() * 100);
                } else {
                    setTimeout(() => this.execute(containerElement), 500);
                }
            };
            setTimeout(typeChar, 1000);
        }
    };

    const terminalBody = document.getElementById('terminal-body');
    const inputSpan = document.getElementById('terminal-input');

    if (terminalBody && inputSpan) {
        const termObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                termObserver.disconnect();
                Terminal.startTyping(inputSpan, terminalBody);
            }
        }, { threshold: 0.1 });
        termObserver.observe(terminalBody);
    }

    // Carousel Autoscroll Logic
    const Carousel = {
        init() {
            const carousel = document.getElementById('connect-carousel');
            if (!carousel) return;

            this.carousel = carousel;
            this.isPaused = false;
            this.isInteracting = false;
            this.isWaiting = false;
            this.isOffScreen = false;
            this.scrollPos = 0;
            this.direction = 1;
            this.resumeTimeout = null;
            this.scrollSpeed = 2;
            this.pauseDuration = 1500;
            this.resumeDelay = 2000;

            this.setupObserver();
            this.setupListeners();
            requestAnimationFrame(() => this.step());
        },

        step() {
            if (!this.isPaused && !this.isInteracting && !this.isWaiting && !this.isOffScreen) {
                const maxScroll = this.carousel.scrollWidth - this.carousel.clientWidth;
                if (maxScroll > 0) {
                    this.scrollPos += this.scrollSpeed * this.direction;

                    if (this.scrollPos >= maxScroll) {
                        this.scrollPos = maxScroll;
                        this.direction = -1;
                        this.pause();
                    } else if (this.scrollPos <= 0) {
                        this.scrollPos = 0;
                        this.direction = 1;
                        this.pause();
                    }
                    this.carousel.scrollLeft = this.scrollPos;
                }
            }
            requestAnimationFrame(() => this.step());
        },

        pause() {
            this.isWaiting = true;
            setTimeout(() => this.isWaiting = false, this.pauseDuration);
        },

        setupObserver() {
            const obs = new IntersectionObserver((entries) => {
                this.isOffScreen = !entries[0].isIntersecting;
                if (entries[0].isIntersecting) {
                    this.scrollPos = this.carousel.scrollLeft;
                }
            }, { threshold: 0.1 });
            obs.observe(this.carousel);
        },

        setupListeners() {
            const handleStart = () => {
                this.isInteracting = true;
                if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
            };

            const handleEnd = () => {
                if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
                this.resumeTimeout = setTimeout(() => {
                    this.isInteracting = false;
                    this.scrollPos = this.carousel.scrollLeft;
                }, this.resumeDelay);
            };

            this.carousel.addEventListener('mouseenter', () => this.isPaused = true);
            this.carousel.addEventListener('mouseleave', () => this.isPaused = false);
            this.carousel.addEventListener('touchstart', handleStart, { passive: true });
            this.carousel.addEventListener('touchend', handleEnd, { passive: true });
            this.carousel.addEventListener('mousedown', handleStart);
            this.carousel.addEventListener('mouseup', handleEnd);
            this.carousel.addEventListener('scroll', () => {
                if (this.isInteracting || this.isPaused || this.isWaiting || this.isOffScreen) {
                    this.scrollPos = this.carousel.scrollLeft;
                }
            });
        }
    };

    Carousel.init();

    // Lanyard Discord Presence Integration
    const Lanyard = {
        userId: CONFIG.discordUserId,
        ws: null,
        heartbeatInterval: null,
        spotifyInterval: null,
        currentData: null,

        init() {
            this.connect();
        },

        connect() {
            this.ws = new WebSocket('wss://api.lanyard.rest/socket');

            this.ws.onopen = () => {
                console.log('Lanyard WebSocket connected');
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onclose = () => {
                console.log('Lanyard WebSocket closed, reconnecting...');
                clearInterval(this.heartbeatInterval);
                clearInterval(this.spotifyInterval);
                setTimeout(() => this.connect(), 5000);
            };

            this.ws.onerror = (error) => {
                console.error('Lanyard WebSocket error:', error);
            };
        },

        handleMessage(data) {
            switch (data.op) {
                case 1: // Hello
                    this.heartbeatInterval = setInterval(() => {
                        this.ws.send(JSON.stringify({ op: 3 }));
                    }, data.d.heartbeat_interval);

                    // Subscribe to user
                    this.ws.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: this.userId }
                    }));
                    break;

                case 0: // Event
                    if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                        this.currentData = data.d;
                        this.render(data.d);
                        this.startSpotifyProgress();
                    }
                    break;
            }
        },

        startSpotifyProgress() {
            clearInterval(this.spotifyInterval);
            if (this.currentData?.listening_to_spotify && this.currentData?.spotify) {
                this.spotifyInterval = setInterval(() => {
                    this.updateSpotifyProgress();
                }, 1000);
            }
        },

        updateSpotifyProgress() {
            if (!this.currentData?.spotify) return;

            const { timestamps } = this.currentData.spotify;
            const now = Date.now();
            const start = timestamps.start;
            const end = timestamps.end;
            const duration = end - start;
            const elapsed = now - start;
            const progress = Math.min((elapsed / duration) * 100, 100);

            const progressFill = document.querySelector('.spotify-progress-fill');
            const currentTime = document.querySelector('.spotify-current-time');

            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            if (currentTime) {
                currentTime.textContent = this.formatTime(elapsed);
            }
        },

        formatTime(ms) {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / 1000 / 60) % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        },

        getStatusText(status) {
            const statuses = {
                online: 'Online',
                idle: 'Idle',
                dnd: 'Do Not Disturb',
                offline: 'Offline'
            };
            return statuses[status] || 'Unknown';
        },

        getAvatarUrl(data) {
            if (data.discord_user.avatar) {
                const ext = data.discord_user.avatar.startsWith('a_') ? 'gif' : 'png';
                return `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.${ext}?size=256`;
            }
            return `https://cdn.discordapp.com/embed/avatars/${parseInt(data.discord_user.discriminator) % 5}.png`;
        },

        getAvatarDecorationUrl(data) {
            const asset = data.discord_user?.avatar_decoration_data?.asset;
            if (!asset) return null;
            return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160`;
        },

        getCustomStatus(data) {
            if (data.activities) {
                const statusActivity = data.activities.find(a => a.type === 4);
                if (statusActivity && statusActivity.state) {
                    return statusActivity.state;
                }
            }
            return null;
        },

        getActivityImage(activity) {
            if (activity.assets?.large_image) {
                if (activity.assets.large_image.startsWith('mp:external/')) {
                    return `https://media.discordapp.net/external/${activity.assets.large_image.replace('mp:external/', '')}`;
                }
                if (activity.assets.large_image.startsWith('spotify:')) {
                    return `https://i.scdn.co/image/${activity.assets.large_image.replace('spotify:', '')}`;
                }
                return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
            }
            return null;
        },

        render(data) {
            const container = document.getElementById('discord-presence');
            if (!container) return;

            const avatarUrl = this.getAvatarUrl(data);
            const decorationUrl = this.getAvatarDecorationUrl(data);
            const status = data.discord_status;
            const username = data.discord_user.global_name || data.discord_user.username;
            const customStatus = this.getCustomStatus(data);

            // Profile section (left half)
            const profileHtml = `
                <div class="discord-profile-card">
                    <a href="https://discordapp.com/users/${data.discord_user.id}" target="_blank" class="profile-avatar-container" title="Open Discord profile">
                        <img src="${avatarUrl}" alt="${this.escapeHtml(username)}" class="profile-avatar">
                        ${decorationUrl ? `<img src="${decorationUrl}" alt="" class="avatar-decoration">` : ''}
                        <div class="status-indicator ${status}"></div>
                    </a>
                    <div class="profile-info">
                        <h3 class="profile-username">${this.escapeHtml(username)}</h3>
                        ${customStatus ? `<p class="profile-custom-status">${this.escapeHtml(customStatus)}</p>` : ''}
                        <span class="profile-status-badge ${status}">${this.getStatusText(status)}</span>
                    </div>
                </div>
            `;

            let activitiesHtml = '';

            // Spotify Activity
            if (data.listening_to_spotify && data.spotify) {
                const spotify = data.spotify;
                const progress = this.calculateProgress(spotify.timestamps);
                const duration = spotify.timestamps.end - spotify.timestamps.start;

                activitiesHtml += `
                    <div class="activity-card spotify">
                        <img src="${spotify.album_art_url}" alt="Album Art" class="activity-image">
                        <div class="activity-info">
                            <div class="activity-type">🎵 Listening to Spotify</div>
                            <div class="activity-name">${this.escapeHtml(spotify.song)}</div>
                            <div class="activity-details">by ${this.escapeHtml(spotify.artist)}</div>
                            <div class="activity-state">on ${this.escapeHtml(spotify.album)}</div>
                            <div class="spotify-progress-container">
                                <div class="spotify-progress-bar">
                                    <div class="spotify-progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <div class="spotify-progress-time">
                                    <span class="spotify-current-time">${this.formatTime(Date.now() - spotify.timestamps.start)}</span>
                                    <span>${this.formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Other Activities (games, etc.)
            const activities = data.activities?.filter(a => a.type !== 4 && a.name !== 'Spotify') || [];
            for (const activity of activities) {
                const imageUrl = this.getActivityImage(activity);
                const typeLabel = this.getActivityTypeLabel(activity.type);

                activitiesHtml += `
                    <div class="activity-card">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${this.escapeHtml(activity.name)}" class="activity-image">` : ''}
                        <div class="activity-info">
                            <div class="activity-type">${typeLabel}</div>
                            <div class="activity-name">${this.escapeHtml(activity.name)}</div>
                            ${activity.details ? `<div class="activity-details">${this.escapeHtml(activity.details)}</div>` : ''}
                            ${activity.state ? `<div class="activity-state">${this.escapeHtml(activity.state)}</div>` : ''}
                        </div>
                    </div>
                `;
            }

            if (!activitiesHtml) {
                activitiesHtml = '<div class="no-activities">Not doing anything right now</div>';
            }

            container.innerHTML = `
                ${profileHtml}
                <div class="discord-activities">
                    ${activitiesHtml}
                </div>
            `;
        },

        getActivityTypeLabel(type) {
            const types = {
                0: '🎮 Playing',
                1: '📡 Streaming',
                2: '🎵 Listening to',
                3: '📺 Watching',
                5: '🏆 Competing in'
            };
            return types[type] || '🎯 Activity';
        },

        calculateProgress(timestamps) {
            const now = Date.now();
            const start = timestamps.start;
            const end = timestamps.end;
            const duration = end - start;
            const elapsed = now - start;
            return Math.min((elapsed / duration) * 100, 100);
        },

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };

    Lanyard.init();
});
