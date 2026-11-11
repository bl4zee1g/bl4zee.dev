const CONFIG = {
  birthDate: "2005-12-16",
  typewriterTexts: ["Jane", "bl4zee"],
  revealOffset: "20px",
  revealThreshold: 0.1,
  discordUserId: "502866937617973260",
  statusPageUrl: "https://status.bl4zee.dev",
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

  // Live Last.fm data, fetched in the browser. config.js (from scripts/lastfm-config)
  // provides the read-only API key and username.
  const lastfmCall = async (method, params = {}) => {
    const { apiKey, user } = window.LASTFM_CONFIG;
    const query = new URLSearchParams({
      method,
      user,
      api_key: apiKey,
      format: "json",
      ...params,
    });
    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?${query}`);
    const json = await res.json();
    if (!res.ok || json.error)
      throw new Error(json.message ?? `HTTP ${res.status}`);
    return json;
  };

  // Artist pictures: Deezer has no CORS headers, so the homelab nginx proxies
  // /api/deezer/ to api.deezer.com and adds Access-Control-Allow-Origin.
  const deezerArtistImage = async (name) => {
    const query = new URLSearchParams({ q: name, limit: "5" });
    const res = await fetch(`/api/deezer/search/artist?${query}`);
    if (!res.ok) return null;
    const json = await res.json();
    const match = json.data?.find(
      (a) => a.name.toLowerCase() === name.toLowerCase(),
    );
    return match?.picture_medium ?? null;
  };

  const fetchListening = async () => {
    const [recent, top, info] = await Promise.all([
      lastfmCall("user.getrecenttracks", { limit: 1 }),
      lastfmCall("user.gettopartists", { period: "7day", limit: 5 }),
      lastfmCall("user.getinfo"),
    ]);
    const user = info.user;
    const latest = [recent.recenttracks.track].flat()[0];
    const pick = (images) =>
      images?.find((i) => i.size === "extralarge")?.["#text"] || null;
    return {
      profile: {
        name: user.name,
        realname: user.realname || null,
        image: pick(user.image),
      },
      stats: {
        scrobbles: Number(user.playcount),
        artists: Number(user.artist_count),
        tracks: Number(user.track_count),
        albums: Number(user.album_count),
        memberSince: new Date(
          Number(user.registered.unixtime) * 1000,
        ).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      },
      lastTrack: latest
        ? {
            name: latest.name,
            artist: latest.artist["#text"],
            album: latest.album?.["#text"] || null,
            url: latest.url,
            image: pick(latest.image),
            nowPlaying: latest["@attr"]?.nowplaying === "true",
          }
        : null,
      topArtists: await Promise.all(
        top.topartists.artist.map(async (a) => ({
          name: a.name,
          playcount: Number(a.playcount),
          url: a.url,
          image: await deezerArtistImage(a.name).catch(() => null),
        })),
      ),
    };
  };
  const loadListening = async () => {
    const box = document.getElementById("lastfm-stats");
    if (!box) return;
    try {
      const data = await fetchListening();

      const left = document.createElement("div");

      const nowRow = document.createElement("div");
      nowRow.className = "flex items-center gap-4 mb-8";
      if (data.lastTrack?.image) {
        const cover = document.createElement("img");
        cover.src = data.lastTrack.image;
        cover.alt = `${data.lastTrack.album ?? data.lastTrack.name} cover`;
        cover.width = 64;
        cover.height = 64;
        cover.loading = "lazy";
        cover.className =
          "w-16 h-16 rounded-lg border border-gray-700/50 shrink-0";
        nowRow.append(cover);
      }
      const now = document.createElement("p");
      now.className = "text-lg";
      if (data.lastTrack) {
        const t = data.lastTrack;
        const link = document.createElement("a");
        link.href = t.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className =
          "font-semibold hover:text-lavender-400 transition-colors";
        link.textContent = `${t.name} – ${t.artist}`;
        now.append(
          t.nowPlaying ? "Currently scrobbling " : "Last played: ",
          link,
        );
      } else {
        now.textContent = "Nothing played yet";
      }
      nowRow.append(now);

      const topHeading = document.createElement("h3");
      topHeading.className = "font-display font-semibold mb-3";
      topHeading.textContent = "Top artists, last 7 days";

      const list = document.createElement("ol");
      list.className = "text-gray-300 text-lg space-y-2";
      for (const artist of data.topArtists) {
        const li = document.createElement("li");
        li.className = "flex items-center";
        if (artist.image) {
          const pic = document.createElement("img");
          pic.src = artist.image;
          pic.alt = "";
          pic.width = 36;
          pic.height = 36;
          pic.loading = "lazy";
          pic.className = "w-9 h-9 rounded-full mr-3 shrink-0";
          li.append(pic);
        }
        const link = document.createElement("a");
        link.href = artist.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "hover:text-lavender-400 transition-colors";
        link.textContent = artist.name;
        const plays = document.createElement("span");
        plays.className = "text-gray-500 text-sm ml-2";
        plays.textContent = `· ${artist.playcount} plays`;
        li.append(link, plays);
        list.append(li);
      }
      left.append(nowRow, topHeading, list);

      const right = document.createElement("div");
      const allTimeHeading = document.createElement("h3");
      allTimeHeading.className = "font-display font-semibold mb-3";
      allTimeHeading.textContent = "All time";
      const stats = document.createElement("dl");
      stats.className = "grid grid-cols-2 gap-x-8 gap-y-3";
      const rows = [
        ["Scrobbles", data.stats.scrobbles],
        ["Artists", data.stats.artists],
        ["Tracks", data.stats.tracks],
        ["Albums", data.stats.albums],
        ["Member since", data.stats.memberSince],
      ];
      for (const [label, value] of rows) {
        const term = document.createElement("dt");
        term.className = "text-gray-400 text-sm";
        term.textContent = label;
        const desc = document.createElement("dd");
        desc.className = "font-display font-semibold text-xl";
        desc.textContent =
          typeof value === "number" ? value.toLocaleString() : value;
        stats.append(term, desc);
      }
      right.append(allTimeHeading, stats);

      const header = document.createElement("div");
      header.className = "flex items-center gap-5 mb-8";
      const avatar = document.createElement("img");
      avatar.src = data.profile.image;
      avatar.alt = `${data.profile.name} avatar`;
      avatar.width = 80;
      avatar.height = 80;
      avatar.className =
        "w-20 h-20 rounded-full border border-gray-700/50 shrink-0";
      const names = document.createElement("div");
      const name = document.createElement("a");
      name.href = `https://www.last.fm/user/${data.profile.name}`;
      name.target = "_blank";
      name.rel = "noopener noreferrer";
      name.className =
        "font-display font-bold text-2xl hover:text-lavender-400 transition-colors";
      name.textContent = data.profile.name;
      names.append(name);
      if (data.profile.realname) {
        const real = document.createElement("p");
        real.className = "text-gray-400";
        real.textContent = data.profile.realname;
        names.append(real);
      }
      header.append(avatar, names);
      right.prepend(header);
      box.replaceChildren(right, left);
    } catch (e) {
      console.warn("Failed to load lastfm.json:", e);
      const msg = document.createElement("p");
      msg.className = "text-gray-400";
      msg.textContent = "Listening stats unavailable right now.";
      box.replaceChildren(msg);
    }
  };

  loadListening();

  Lanyard.init();
});
