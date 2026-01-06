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
    const neofetchOutput = `
                <div class="neofetch-output">
                    <div class="logo-art">                   -\`
                  .o+\`
                 \`ooo/
                \`+oooo:
               \`+oooooo:
               -+oooooo+:
             \`/+:-:++oooo+:
            \`/++++/+++++++:
           \`/++++++++++++++:
          \`/+++ooooooooooooo/\`
         ./ooosssso++osssssso+\`
        .oossssso-\`\`\`\`/ossssss+\`
       -osssssso.      :ssssssso.
      :osssssss/        osssso+++.
     /ossssssss/        +ssssooo/-
    \`/ossssso+/:-        -:/+osssso+-
   \`+sso+:-                 \`.-/+oso:
  \`++:.                           \`-/+/
  .\`                                 \`/</div>
                    <div class="sys-info">
                        <div class="info-line"><span class="info-key">bl4zee</span><span class="info-val">@</span><span class="info-key">c0re</span></div>
                        <div class="info-line">----------</div>
                        <div class="info-line"><span class="info-key">OS</span>: <span class="info-val">Arch Linux x86_64</span></div>
                        <div class="info-line"><span class="info-key">Host</span>: <span class="info-val">MS-7D75 1.0</span></div>
                        <div class="info-line"><span class="info-key">Kernel</span>: <span class="info-val">6.17.9-arch1-1</span></div>
                        <div class="info-line"><span class="info-key">Uptime</span>: <span class="info-val">9 hours, 56 mins</span></div>
                        <div class="info-line"><span class="info-key">Packages</span>: <span class="info-val">1071 (pacman), 22 (flatpak)</span></div>
                        <div class="info-line"><span class="info-key">Shell</span>: <span class="info-val">zsh 5.9</span></div>
                        <div class="info-line"><span class="info-key">Resolution</span>: <span class="info-val">2560x1440, 2560x1440</span></div>
                        <div class="info-line"><span class="info-key">WM</span>: <span class="info-val">Hyprland</span></div>
                        <div class="info-line"><span class="info-key">Theme</span>: <span class="info-val">Catppuccin-Mocha [GTK2/3]</span></div>
                        <div class="info-line"><span class="info-key">Icons</span>: <span class="info-val">Tela-circle-dracula [GTK2/3]</span></div>
                        <div class="info-line"><span class="info-key">Cursor</span>: <span class="info-val">Bibata-Modern-Ice [GTK2/3]</span></div>
                        <div class="info-line"><span class="info-key">Terminal</span>: <span class="info-val">kitty</span></div>
                        <div class="info-line"><span class="info-key">Terminal Font</span>: <span class="info-val">CaskaydiaCove Nerd Font Mono 9.0</span></div>
                        <div class="info-line"><span class="info-key">CPU</span>: <span class="info-val">AMD Ryzen 5 7600X (12) @ 5.457GHz</span></div>
                        <div class="info-line"><span class="info-key">GPU</span>: <span class="info-val">AMD ATI Radeon RX 9070/9070 XT/9070 GRE</span></div>
                        <div class="info-line"><span class="info-key">Memory</span>: <span class="info-val">12692 MiB / 31183 MiB</span></div>
                        <div class="info-line"><br></div>
                        <div class="info-line"><span class="terminal-dot dot-red"></span><span class="terminal-dot dot-green"></span><span class="terminal-dot dot-yellow"></span><span class="terminal-dot dot-red"></span><span class="terminal-dot dot-green"></span><span class="terminal-dot dot-yellow"></span></div>
                    </div>
                </div>`;

    function executeCommand(container) {
        const outputDiv = document.createElement('div');
        outputDiv.innerHTML = neofetchOutput;
        container.appendChild(outputDiv);
        const newPrompt = document.createElement('div');
        newPrompt.className = 'prompt';
        newPrompt.innerHTML = `<span class="prompt-user">bl4zee</span><span class="prompt-at">@</span><span class="prompt-host">c0re</span><span class="prompt-path">~</span><span class="prompt-symbol">&gt;</span><span class="input-line"></span><span class="cursor-block"></span>`;
        const prevCursor = container.querySelector('.prompt:not(:last-child) .cursor-block');
        if (prevCursor) prevCursor.remove();
        container.appendChild(newPrompt);
        container.scrollTop = container.scrollHeight;
    }

    function startTyping(inputElement, containerElement) {
        const text = "neofetch";
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
