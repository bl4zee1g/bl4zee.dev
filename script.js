const CONFIG = {
  birthDate: "2005-12-16",
  typewriterTexts: ["Jane", "bl4zee"],
  revealOffset: "20px",
  revealThreshold: 0.1,
  discordUserId: "502866937617973260",
  statusPageUrl: "https://status.bl4zee.dev",
  koitoUrl: "https://koito.bl4zee.dev",
  scrobbleUser: "bl4zee",
  scrobbleAvatar: "https://femboy.beauty/HDvVlX",
};

document.addEventListener("DOMContentLoaded", function () {
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  // Reveal Animations using IntersectionObserver
  const revealCallback = (entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = element.dataset.delay || 0;

        setTimeout(() => {
          element.style.transition =
            "opacity 0.6s ease-out, transform 0.6s ease-out";
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }, delay);

        observer.unobserve(element);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    threshold: CONFIG.revealThreshold,
  });

  const cards = document.querySelectorAll(
    ".social-card, .project-card, .text-center, .homelab-figure, .status-grid",
  );
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = `translateY(${CONFIG.revealOffset})`;
    // Add staggered delay based on index for elements near each other
    card.dataset.delay = (index % 4) * 100;
    revealObserver.observe(card);
  });

  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Typewriter
  class Typewriter {
    constructor(elementId, texts, waitTime = 1500) {
      this.element = document.getElementById(elementId);
      if (!this.element) return;
      this.texts = texts;
      this.waitTime = waitTime;
      this.txt = "";
      this.wordIndex = 0;
      this.isDeleting = false;
      this.type();
      this.element.classList.add("cursor");
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

      let typeSpeed = 90;
      if (this.isDeleting) typeSpeed = 45;

      if (!this.isDeleting && this.txt === fullTxt) {
        typeSpeed = this.waitTime;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === "") {
        this.isDeleting = false;
        this.wordIndex++;
        typeSpeed = 250;
      }

      setTimeout(() => this.type(), typeSpeed);
    }
  }
  new Typewriter("typewriter-text", CONFIG.typewriterTexts);

  // Age Counter
  function updateAge() {
    const ageElement = document.getElementById("age-display");
    if (!ageElement) return;
    const birthDate = new Date(CONFIG.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    ageElement.textContent = age + " years old";
  }
  updateAge();
  setInterval(updateAge, 86400000);

  // Carousel Autoscroll Logic
  const Carousel = {
    init() {
      const carousel = document.getElementById("connect-carousel");
      if (!carousel) return;

      this.carousel = carousel;
      this.isPaused = false;
      this.isInteracting = false;
      this.isWaiting = false;
      this.isOffScreen = false;
      this.scrollPos = 0;
      this.direction = 1;
      this.resumeTimeout = null;
      this.scrollSpeed = 1.5;
      this.pauseDuration = 1500;
      this.resumeDelay = 2000;

      this.setupObserver();
      this.setupListeners();
      requestAnimationFrame(() => this.step());
    },

    step() {
      if (
        !this.isPaused &&
        !this.isInteracting &&
        !this.isWaiting &&
        !this.isOffScreen
      ) {
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
      setTimeout(() => (this.isWaiting = false), this.pauseDuration);
    },

    setupObserver() {
      const obs = new IntersectionObserver(
        (entries) => {
          this.isOffScreen = !entries[0].isIntersecting;
          if (entries[0].isIntersecting) {
            this.scrollPos = this.carousel.scrollLeft;
          }
        },
        { threshold: 0.1 },
      );
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

      this.carousel.addEventListener(
        "mouseenter",
        () => (this.isPaused = true),
      );
      this.carousel.addEventListener(
        "mouseleave",
        () => (this.isPaused = false),
      );
      this.carousel.addEventListener("touchstart", handleStart, {
        passive: true,
      });
      this.carousel.addEventListener("touchend", handleEnd, { passive: true });
      this.carousel.addEventListener("mousedown", handleStart);
      this.carousel.addEventListener("mouseup", handleEnd);
      this.carousel.addEventListener("scroll", () => {
        if (
          this.isInteracting ||
          this.isPaused ||
          this.isWaiting ||
          this.isOffScreen
        ) {
          this.scrollPos = this.carousel.scrollLeft;
        }
      });
    },
  };

  Carousel.init();

  // Lanyard Discord Presence Integration
  const Lanyard = {
    userId: CONFIG.discordUserId,
    ws: null,
    heartbeatInterval: null,
    spotifyInterval: null,
    currentData: null,
    bannerUrl: null,
    profileEffects: null,

    init() {
      this.connect();
      this.fetchProfileData();
    },

    async fetchProfileData() {
      try {
        const res = await fetch(`https://dcdn.dstn.to/profile/${this.userId}`);
        const data = await res.json();

        const themeColor = data.user_profile?.theme_colors?.[0];
        if (themeColor != null) {
          this.themeColor = "#" + themeColor.toString(16).padStart(6, "0");
        }

        const hash = data.user?.banner;
        if (hash) {
          this.bannerUrl = `https://cdn.discordapp.com/banners/${this.userId}/${hash}.webp?size=1024`;
          this.applyBanner();
        }

        const effectSku = data.user_profile?.profile_effect?.sku_id;
        if (effectSku) {
          const effectRes = await fetch(
            `https://discord.com/api/v9/collectibles-products/${effectSku}`,
          );
          const effectData = await effectRes.json();
          this.profileEffects = effectData.items?.[0]?.effects || [];
          this.applyProfileEffect();
        }
      } catch (e) {
        console.warn("Failed to fetch profile data:", e);
      }
    },

    applyBanner() {
      const card = document.querySelector(".discord-profile-card");
      if (!card) return;
      if (this.themeColor) {
        card.style.backgroundColor = this.themeColor;
      }
      if (this.bannerUrl) {
        card.style.backgroundImage = `url(${this.bannerUrl})`;
        card.classList.add("has-banner");
      }
    },

    applyProfileEffect() {
      const card = document.querySelector(".discord-profile-card");
      if (!card || !this.profileEffects?.length) return;

      card.querySelectorAll(".profile-effect").forEach((el) => el.remove());

      this.profileEffects
        .filter((e) => e.loop)
        .forEach((effect) => {
          const img = document.createElement("img");
          img.src = effect.src;
          img.className = "profile-effect";
          img.alt = "";
          card.appendChild(img);
        });
    },

    connect() {
      this.ws = new WebSocket("wss://api.lanyard.rest/socket");

      this.ws.onopen = () => {
        console.log("Lanyard WebSocket connected");
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = () => {
        console.log("Lanyard WebSocket closed, reconnecting...");
        clearInterval(this.heartbeatInterval);
        clearInterval(this.spotifyInterval);
        setTimeout(() => this.connect(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error("Lanyard WebSocket error:", error);
      };
    },

    handleMessage(data) {
      switch (data.op) {
        case 1: // Hello
          this.heartbeatInterval = setInterval(() => {
            this.ws.send(JSON.stringify({ op: 3 }));
          }, data.d.heartbeat_interval);

          // Subscribe to user
          this.ws.send(
            JSON.stringify({
              op: 2,
              d: { subscribe_to_id: this.userId },
            }),
          );
          break;

        case 0: // Event
          if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
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

      const progressFill = document.querySelector(".spotify-progress-fill");
      const currentTime = document.querySelector(".spotify-current-time");

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
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    },

    getAvatarUrl(data) {
      if (data.discord_user.avatar) {
        const ext = data.discord_user.avatar.startsWith("a_") ? "gif" : "png";
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
        const statusActivity = data.activities.find((a) => a.type === 4);
        if (statusActivity) {
          const emoji = statusActivity.emoji;
          let emojiHtml = "";
          if (emoji?.id) {
            const ext = emoji.animated ? "gif" : "png";
            const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=32`;
            emojiHtml = `<img src="${url}" alt=":${this.escapeHtml(emoji.name)}:" class="custom-status-emoji">`;
          } else if (emoji?.name) {
            emojiHtml = `<span class="custom-status-emoji">${emoji.name}</span>`;
          }
          return { text: statusActivity.state || "", emojiHtml };
        }
      }
      return null;
    },

    getActivityImage(activity) {
      if (activity.assets?.large_image) {
        if (activity.assets.large_image.startsWith("mp:external/")) {
          return `https://media.discordapp.net/external/${activity.assets.large_image.replace("mp:external/", "")}`;
        }
        if (activity.assets.large_image.startsWith("spotify:")) {
          return `https://i.scdn.co/image/${activity.assets.large_image.replace("spotify:", "")}`;
        }
        return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
      }
      return null;
    },

    render(data) {
      const container = document.getElementById("discord-presence");
      if (!container) return;

      const avatarUrl = this.getAvatarUrl(data);
      const decorationUrl = this.getAvatarDecorationUrl(data);
      const status = data.discord_status;
      const username =
        data.discord_user.global_name || data.discord_user.username;
      const customStatus = this.getCustomStatus(data);

      // Profile section (left half)
      const profileHtml = `
                <div class="discord-profile-card">
                    <a href="https://discordapp.com/users/${data.discord_user.id}" target="_blank" class="profile-avatar-container" title="Open Discord profile">
                        <img src="${avatarUrl}" alt="${this.escapeHtml(username)}" class="profile-avatar">
                        ${decorationUrl ? `<img src="${decorationUrl}" alt="" class="avatar-decoration">` : ""}
                        <div class="status-indicator ${status}"></div>
                    </a>
                    <div class="profile-info">
                        <h3 class="profile-username">
                            ${this.escapeHtml(username)}${data.discord_user.primary_guild?.identity_enabled && data.discord_user.primary_guild?.tag ? ` <a href="https://discord.gg/hbpMZhPSdx" target="_blank" class="guild-tag"><img src="https://cdn.discordapp.com/clan-badges/${data.discord_user.primary_guild.identity_guild_id}/${data.discord_user.primary_guild.badge}.png?size=32" alt="" class="guild-tag-badge"> ${this.escapeHtml(data.discord_user.primary_guild.tag)}</a>` : ""}
                        </h3>
                        ${customStatus ? `<p class="profile-custom-status">${customStatus.emojiHtml}${this.escapeHtml(customStatus.text)}</p>` : ""}
                    </div>
                </div>
            `;

      let activitiesHtml = "";

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
      const activities =
        data.activities?.filter((a) => a.type !== 4 && a.name !== "Spotify") ||
        [];
      for (const activity of activities) {
        const imageUrl = this.getActivityImage(activity);
        const typeLabel = this.getActivityTypeLabel(activity.type);
        // Details (song, document) are the headline; app name sits beside the type label
        const typeText = activity.details
          ? `${typeLabel} ${activity.name}`
          : typeLabel;
        const headline = activity.details || activity.name;

        activitiesHtml += `
                    <div class="activity-card">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${this.escapeHtml(activity.name)}" class="activity-image">` : ""}
                        <div class="activity-info">
                            <div class="activity-type">${this.escapeHtml(typeText)}</div>
                            <div class="activity-name">${this.escapeHtml(headline)}</div>
                            ${activity.state ? `<div class="activity-state">${this.escapeHtml(activity.state)}</div>` : ""}
                        </div>
                    </div>
                `;
      }

      if (!activitiesHtml) {
        activitiesHtml =
          '<div class="no-activities">Not doing anything right now</div>';
      }

      container.innerHTML = `
                ${profileHtml}
                <div class="discord-activities">
                    ${activitiesHtml}
                </div>
            `;

      this.applyBanner();
      this.applyProfileEffect();
    },

    getActivityTypeLabel(type) {
      const types = {
        0: "🎮 Playing",
        1: "📡 Streaming",
        2: "🎵 Listening to",
        3: "📺 Watching",
        5: "🏆 Competing in",
      };
      return types[type] || "🎯 Activity";
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
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },
  };
  // Status: monitor list comes from status.json (written by the homelab every 5 min)
  // and each card's badges are served directly by Uptime Kuma.
  const statusBadge = (src, alt) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.height = 20;
    img.loading = "lazy";
    return img;
  };

  const createStatusCard = (monitor) => {
    const badgeBase = `${CONFIG.statusPageUrl}/api/badge/${monitor.id}`;
    const link = /^https?:\/\//.test(monitor.url ?? "");
    const card = document.createElement(link ? "a" : "div");
    card.className = "status-card";
    if (link) {
      card.href = monitor.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.title = `Open ${monitor.name}`;
    }

    const name = document.createElement("span");
    name.className = "status-card-name";
    name.textContent = monitor.name;

    const badges = document.createElement("div");
    badges.className = "status-card-badges";
    badges.append(
      statusBadge(`${badgeBase}/status`, `${monitor.name} status`),
      statusBadge(`${badgeBase}/uptime/24h`, `${monitor.name} 24h uptime`),
    );

    card.append(name, badges);
    return card;
  };

  const loadStatus = async () => {
    const grid = document.getElementById("status-grid");
    if (!grid) return;
    try {
      const res = await fetch("status.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const cards = data.groups.flatMap((group) =>
        group.monitors.map(createStatusCard),
      );
      grid.replaceChildren(...cards);
    } catch (e) {
      console.warn("Failed to load status.json:", e);
      const msg = document.createElement("p");
      msg.className = "text-center text-gray-400";
      msg.textContent = "Status unavailable right now.";
      grid.replaceChildren(msg);
    }
  };

  loadStatus();

  // Listening data from my self-hosted Koito instance, fetched in the browser.
  // Public web reads need no token; the instance must allow this origin via KOITO_CORS_ALLOWED_ORIGINS.
  const KOITO_API = `${CONFIG.koitoUrl}/apis/web/v1`;
  // Koito serves this image ID for tracks with no artwork.
  const NO_IMAGE_ID = "00000000-0000-0000-0000-000000000000";
  const koitoCall = async (path) => {
    const res = await fetch(`${KOITO_API}${path}`, {
      signal: AbortSignal.timeout(10 * 1000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const shortDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  const fetchListening = async () => {
    // A failed or timed-out call empties only its own section instead of blocking the panel.
    const soft = (call) =>
      call.catch((e) => {
        console.warn("Koito call failed:", e);
        return null;
      });
    const [stats, activity, artists, recent] = await Promise.all([
      soft(koitoCall("/stats?period=all_time")),
      soft(koitoCall("/listen-activity?range=30&step=day")),
      soft(koitoCall("/top/artists?period=week&limit=10")),
      soft(koitoCall("/listens?period=all_time&limit=6")),
    ]);
    // Only days with listens count toward active days and the busiest day.
    const days = (activity?.activity ?? []).filter((d) => d.listens > 0);
    const busiest = days.reduce(
      (best, d) => (!best || d.listens > best.listens ? d : best),
      null,
    );
    return {
      scrobbles: stats?.listen_count ?? null,
      minutes: stats?.minutes_listened ?? null,
      daysActive: stats?.days_active ?? null,
      tracks: stats?.track_count ?? null,
      last30: activity ? { activeDays: days.length, busiest } : null,
      currentStreak: activity?.streak ?? null,
      avgDailyPlays:
        stats?.avg_daily_plays == null ? null : Math.round(stats.avg_daily_plays),
      tracksPerArtist: stats?.tracks_per_artist ?? null,
      albumsPerArtist: stats?.albums_per_artist ?? null,
      topArtists:
        artists?.items.map(({ item }) => ({
          name: item.name,
          plays: item.listen_count,
          image: item.image,
        })) ?? null,
      recent: recent?.items ?? [],
    };
  };

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // Koito image paths are relative to the instance. Placeholder IDs mean no artwork.
  const coverUrl = (image) =>
    image?.small && !image.small.includes(NO_IMAGE_ID)
      ? `${CONFIG.koitoUrl}${image.small}`
      : null;
  const setCover = (frame, url, alt) => {
    const img = make("img", "w-full h-full object-cover");
    img.src = url;
    img.alt = alt;
    img.width = 60;
    img.height = 60;
    img.loading = "lazy";
    frame.replaceChildren(img);
  };

  const artistLine = (track) => track.artists.map((a) => a.name).join(", ");

  // One listen row: cover art (or an empty square), title, artist and time.
  // Multi-artist rows show every artist in full and drop the time, since the names need the room.
  const recentItem = (listen) => {
    const track = listen.track;
    const multiArtist = track.artists.length > 1;
    const li = make("li", "flex items-center gap-4");
    const frame = make(
      "div",
      "w-[60px] h-[60px] rounded-lg border border-gray-700/50 bg-gray-800/50 shrink-0 overflow-hidden",
    );
    li.append(frame);
    const url = coverUrl(track.image);
    if (url) setCover(frame, url, `${track.title} cover`);
    const info = make("div", "min-w-0 flex-1");
    info.append(
      make("p", "text-[15px] font-semibold truncate", track.title),
      make(
        "p",
        multiArtist ? "text-gray-400 text-sm" : "text-gray-400 text-sm truncate",
        artistLine(track),
      ),
    );
    li.append(info);
    if (!multiArtist) {
      const when = new Date(listen.time).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      li.append(make("p", "text-gray-400 text-sm shrink-0 text-right", when));
    }
    return li;
  };

  const loadListening = async () => {
    const box = document.getElementById("listening-stats");
    if (!box) return;
    box.replaceChildren(
      make("p", "text-gray-400 animate-pulse", "Loading listening stats…"),
    );
    try {
      const data = await fetchListening();

      // Left: profile and totals. null (stat unavailable) shows as a dash.
      const left = make("div", "flex flex-col");
      const header = make("div", "flex items-center gap-5 mb-8");
      const avatar = make(
        "img",
        "w-20 h-20 rounded-full border border-gray-700/50 shrink-0",
      );
      avatar.src = CONFIG.scrobbleAvatar;
      avatar.alt = `${CONFIG.scrobbleUser} avatar`;
      avatar.width = 80;
      avatar.height = 80;
      const names = make("div");
      const name = make(
        "a",
        "font-display font-bold text-2xl hover:text-lavender-400 transition-colors",
        CONFIG.scrobbleUser,
      );
      name.href = CONFIG.koitoUrl;
      name.target = "_blank";
      name.rel = "noopener noreferrer";
      const subtitle =
        data.currentStreak == null
          ? "on Koito"
          : `on a ${data.currentStreak} day listening streak`;
      names.append(name, make("p", "text-gray-400", subtitle));
      header.append(avatar, names);
      const statGrid = (rows) => {
        const dl = make(
          "dl",
          "grid grid-cols-2 items-baseline gap-x-8 gap-y-1",
        );
        for (const [label, value] of rows) {
          dl.append(
            make("dt", "text-gray-400 text-sm", label),
            make("dd", "font-display font-semibold text-xl", value),
          );
        }
        return dl;
      };
      const shown = (n) => (n == null ? "—" : n.toLocaleString());
      const fixed = (n) => (n == null ? "—" : n.toFixed(1));
      const busiest = data.last30?.busiest;
      const busiestText = busiest
        ? `${shortDate(busiest.start_time)} · ${busiest.listens}`
        : "—";
      left.append(
        header,
        make("h3", "font-display font-semibold mb-2", "All time"),
        statGrid([
          ["Scrobbles", shown(data.scrobbles)],
          ["Minutes listened", shown(data.minutes)],
          ["Days active", shown(data.daysActive)],
          ["Tracks", shown(data.tracks)],
        ]),
        make("h3", "font-display font-semibold mb-2 mt-4", "Last 30 days"),
        statGrid([
          ["Active days", data.last30 ? shown(data.last30.activeDays) : "—"],
          ["Busiest day", busiestText],
        ]),
        make("h3", "font-display font-semibold mb-2 mt-4", "Average"),
        statGrid([
          ["Daily plays", shown(data.avgDailyPlays)],
          ["Tracks / artist", fixed(data.tracksPerArtist)],
          ["Albums / artist", fixed(data.albumsPerArtist)],
        ]),
      );

      // Right: top artists, last 7 days
      const right = make("div", "flex flex-col justify-between");
      right.append(
        make(
          "h3",
          "font-display font-semibold mb-3",
          "Top artists, last 7 days",
        ),
      );
      if (data.topArtists === null) {
        right.append(
          make(
            "p",
            "text-gray-400",
            "Top artists aren't available from Koito right now.",
          ),
        );
      } else if (data.topArtists.length === 0) {
        right.append(make("p", "text-gray-400", "No plays in the last 7 days"));
      } else {
        const list = make("ol", "text-gray-300 text-lg flex flex-col justify-between flex-1");
        for (const artist of data.topArtists) {
          const li = make("li", "flex items-center gap-3");
          const frame = make(
            "div",
            "w-10 h-10 rounded-full border border-gray-700/50 bg-gray-800/50 shrink-0 overflow-hidden",
          );
          const url = coverUrl(artist.image);
          if (url) setCover(frame, url, `${artist.name} artwork`);
          li.append(
            frame,
            make("span", "min-w-0 flex-1 truncate", artist.name),
            make(
              "span",
              "text-gray-500 text-sm shrink-0",
              `· ${artist.plays} plays`,
            ),
          );
          list.append(li);
        }
        right.append(list);
      }

      // Third column: now playing (when active) above the last 6 listens with cover art
      const recentBox = make("div", "min-w-0 flex flex-col justify-between");
      const recentHeading = make(
        "h3",
        "font-display font-semibold mb-3",
        "Recent scrobbles",
      );
      const recentList = make("ul", "flex flex-col justify-between flex-1");
      recentList.replaceChildren(...data.recent.map(recentItem));
      recentBox.append(recentHeading, recentList);

      box.replaceChildren(left, right, recentBox);

      // Shown at the top of the recent column only while a track is playing.
      let nowBox = null;
      const renderNowPlaying = (track) => {
        if (!track) {
          nowBox?.remove();
          nowBox = null;
          return;
        }
        const heading = make(
          "h3",
          "font-display font-semibold mb-3 flex items-center gap-2",
        );
        heading.append(
          make("span", "w-2 h-2 rounded-full bg-lavender-400 animate-pulse"),
          "Now playing",
        );

        const info = make("div", "min-w-0 flex-1");
        info.append(
          make("p", "text-[15px] font-semibold truncate", track.title),
          make("p", "text-gray-400 text-sm truncate", artistLine(track)),
        );

        const cover = make(
          "div",
          "w-[60px] h-[60px] rounded-lg border border-gray-700/50 bg-gray-800/50 shrink-0 overflow-hidden",
        );
        const li = make("li", "flex items-center gap-4");
        li.append(cover, info);
        const list = make("ul", "flex flex-col");
        list.append(li);

        const url = coverUrl(track.image);
        if (url) setCover(cover, url, `${track.title} cover`);

        if (!nowBox) {
          nowBox = make("div", "min-w-0 mb-4");
          recentBox.prepend(nowBox);
        }
        nowBox.replaceChildren(heading, list);
      };
      // now-playing returns the current track only while Koito has one.
      const refreshNowPlaying = async () => {
        try {
          const np = await koitoCall("/now-playing");
          renderNowPlaying(np.currently_playing ? np.track : null);
        } catch (e) {
          console.warn("Failed to load now playing:", e);
          renderNowPlaying(null);
        }
      };
      refreshNowPlaying();
      setInterval(refreshNowPlaying, 15 * 1000);

      setInterval(async () => {
        try {
          const res = await koitoCall("/listens?period=all_time&limit=6");
          recentList.replaceChildren(...res.items.map(recentItem));
        } catch (e) {
          console.warn("Failed to refresh Koito listens:", e);
        }
      }, 30 * 1000);
    } catch (e) {
      console.warn("Failed to load Koito data:", e);
      box.replaceChildren(
        make("p", "text-gray-400", "Listening stats unavailable right now."),
      );
    }
  };

  loadListening();

  Lanyard.init();
});
