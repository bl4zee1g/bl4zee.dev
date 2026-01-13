document.addEventListener('DOMContentLoaded', function () {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    const cards = document.querySelectorAll('.social-card, .project-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + index * 100);
    });

    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Typewriter
    class Typewriter {
        constructor(elementId, texts, waitTime = 3000) {
            this.element = document.getElementById(elementId);
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
    new Typewriter('typewriter-text', ['Jane Wirz', 'bl4zee']);

    // Age Counter
    function updateAge() {
        const ageElement = document.getElementById('age-display');
        if (!ageElement) return;
        const birthDate = new Date('2005-12-16');
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        ageElement.textContent = age + ' years old';
    }
    updateAge();
    setInterval(updateAge, 86400000);

    // Terminal
    function executeCommand(container) {
        // Hardcoded due to local file fetch restrictions
        const text = `           .-------------------------:                    bl4zee@c0re
          .+=========================.                    -----------
         :++===++==================-       :++-           OS: CachyOS x86_64
        :*++====+++++=============-        .==:           Host: MS-7D75 (1.0)
       -*+++=====+***++==========:                        Kernel: Linux 6.18.5-2-cachyos
      =*++++========------------:                         Uptime: 1 hour, 59 mins
     =*+++++=====-                     ...                Packages: 1240 (pacman)
   .+*+++++=-===:                    .=+++=:              Shell: zsh 5.9
  :++++=====-==:                     -*****+              Display (ROG PG279Q): 2560x1440 @ 1.33x in 27", 144 Hz [External]
 :++========-=.                      .=+**+.              Display (AORUS FO27Q3): 2560x1440 @ 1.33x in 27", 360 Hz [External]
.+==========-.                          .                 WM: Hyprland 0.53.1 (Wayland)
 :+++++++====-                                .--==-.     Theme: wallbash [Qt], Tokyo-Night [GTK2/3]
  :++==========.                             :+++++++:    Icons: Tela-circle-purple [Qt], Tela-circle-purple [GTK2/3]
   .-===========.                            =*****+*+    Font: Cantarell (10pt) [Qt], Cantarell (10pt) [GTK2/3]
    .-===========:                           .+*****+:    Cursor: Bibata-Modern-Ice (24px)
      -=======++++:::::::::::::::::::::::::-:  .---:      Terminal: kitty 0.45.0
       :======++++====+++******************=.             Terminal Font: CaskaydiaCoveNFM-Regular (9pt)
        :=====+++==========++++++++++++++*-               CPU: AMD Ryzen 5 7600X (12) @ 5.46 GHz
         .====++==============++++++++++*-                GPU 1: AMD Radeon RX 9070 XT [Discrete]
          .===+==================+++++++:                 GPU 2: AMD Raphael [Integrated]
           .-=======================+++:                  Memory: 5.85 GiB / 30.45 GiB (19%)
             ..........................                   Swap: 60.00 KiB / 30.45 GiB (0%)
                                                          Disk (/): 79.22 GiB / 929.50 GiB (9%) - btrfs
                                                          Disk (/mnt/data): 84.14 GiB / 228.17 GiB (37%) - ext4
                                                          Local IP (enp14s0): 192.168.1.180/24
                                                          Locale: en_US.UTF-8`;

        const outputDiv = document.createElement('div');
        outputDiv.className = 'neofetch-output';

        // create pre element for proper formatting
        const pre = document.createElement('pre');
        pre.style.fontFamily = "'CaskaydiaCove Nerd Font Mono', 'JetBrains Mono', monospace";
        pre.style.lineHeight = '1.2';
        pre.style.whiteSpace = 'pre';
        pre.style.margin = '0';
        pre.style.overflowX = 'auto'; // handle potential overflow
        pre.style.color = 'var(--terminal-text)';
        pre.style.fontSize = '12px'; // Smaller font to prevent scrolling
        pre.textContent = text; // Content is now safe

        outputDiv.appendChild(pre);
        container.appendChild(outputDiv);

        addPrompt(container);
    }

    function addPrompt(container) {
        const newPrompt = document.createElement('div');
        newPrompt.className = 'prompt';
        newPrompt.innerHTML = `<span class="prompt-user">bl4zee</span><span class="prompt-at">@</span><span class="prompt-host">c0re</span><span class="prompt-path">~</span><span class="prompt-symbol">&gt;</span><span class="input-line"></span><span class="cursor-block"></span>`;
        const prevCursor = container.querySelector('.prompt:not(:last-child) .cursor-block');
        if (prevCursor) prevCursor.remove();
        container.appendChild(newPrompt);
        container.scrollTop = container.scrollHeight;
    }

    function startTyping(inputElement, containerElement) {
        const text = "fastfetch";
        let index = 0;
        inputElement.textContent = "";
        function typeChar() {
            if (index < text.length) {
                inputElement.textContent += text.charAt(index);
                index++;
                setTimeout(typeChar, 100 + Math.random() * 100);
            } else {
                setTimeout(() => executeCommand(containerElement), 500);
            }
        }
        setTimeout(typeChar, 1000);
    }

    const terminalBody = document.getElementById('terminal-body');
    const inputSpan = document.getElementById('terminal-input');
    if (terminalBody && inputSpan) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    observer.disconnect();
                    startTyping(inputSpan, terminalBody);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(terminalBody);
    }

    // Carousel Autoscroll
    const carousel = document.getElementById('connect-carousel');
    if (carousel) {
        let isPaused = false;      // Hover pause
        let isInteracting = false; // Touch/Click pause
        let isWaiting = false;     // Edge pause
        let isOffScreen = false;   // Performance pause
        let scrollPos = 0;
        let direction = 1;
        let resumeTimeout = null;
        const scrollSpeed = 0.5;
        const pauseDuration = 1500;
        const resumeDelay = 2000;

        function step() {
            if (!isPaused && !isInteracting && !isWaiting && !isOffScreen) {
                const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                if (maxScroll <= 0) {
                    requestAnimationFrame(step);
                    return;
                }

                scrollPos += scrollSpeed * direction;

                if (scrollPos >= maxScroll) {
                    scrollPos = maxScroll;
                    direction = -1;
                    pause();
                } else if (scrollPos <= 0) {
                    scrollPos = 0;
                    direction = 1;
                    pause();
                }
                carousel.scrollLeft = scrollPos;
            }
            requestAnimationFrame(step);
        }

        function pause() {
            isWaiting = true;
            setTimeout(() => {
                isWaiting = false;
            }, pauseDuration);
        }

        // Optimization: Pause when off-screen
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isOffScreen = !entry.isIntersecting;
                if (entry.isIntersecting) {
                    scrollPos = carousel.scrollLeft;
                }
            });
        }, { threshold: 0.1 });
        observer.observe(carousel);

        function handleInteractionStart() {
            isInteracting = true;
            if (resumeTimeout) clearTimeout(resumeTimeout);
        }

        function handleInteractionEnd() {
            if (resumeTimeout) clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(() => {
                isInteracting = false;
                scrollPos = carousel.scrollLeft;
            }, resumeDelay);
        }

        carousel.addEventListener('scroll', () => {
            if (isInteracting || isPaused || isWaiting || isOffScreen) {
                scrollPos = carousel.scrollLeft;
            }
        });

        carousel.addEventListener('mouseenter', () => isPaused = true);
        carousel.addEventListener('mouseleave', () => isPaused = false);

        carousel.addEventListener('touchstart', handleInteractionStart, { passive: true });
        carousel.addEventListener('touchend', handleInteractionEnd, { passive: true });
        carousel.addEventListener('touchcancel', handleInteractionEnd, { passive: true });
        carousel.addEventListener('mousedown', handleInteractionStart);
        carousel.addEventListener('mouseup', handleInteractionEnd);

        requestAnimationFrame(step);
    }
});
