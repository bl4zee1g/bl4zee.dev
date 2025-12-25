

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function () {
    // Feather icons replacement
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Add subtle animations to cards on load
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



    // Dynamic year for footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(function () {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}, 250));

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

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

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

document.addEventListener('DOMContentLoaded', () => {
    new Typewriter('typewriter-text', ['Jane Wirz', 'bl4zee']);
});

function updateAge() {
    const ageElement = document.getElementById('age-display');
    if (!ageElement) return;

    const birthDate = new Date('2005-12-16');
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    ageElement.textContent = age + ' years old';
}

document.addEventListener('DOMContentLoaded', updateAge);
// Also update daily just in case the site is left open
setInterval(updateAge, 86400000);
// Terminal Animation logic
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
<div class="info-line"><span class="info-key">GPU</span>: <span class="info-val">AMD ATI Raphael</span></div>
<div class="info-line"><span class="info-key">Memory</span>: <span class="info-val">12692 MiB / 31183 MiB</span></div>
<div class="info-line"><span class="info-key">Network</span>: <span class="info-val">100 Mbps</span></div>
<div class="info-line"><br></div>
<div class="info-line"><span class="terminal-dot dot-red"></span><span class="terminal-dot dot-green"></span><span class="terminal-dot dot-yellow"></span><span class="terminal-dot dot-red"></span><span class="terminal-dot dot-green"></span><span class="terminal-dot dot-yellow"></span></div>
</div>
</div>
`;

function initTerminalAnimation() {
    const terminalBody = document.getElementById('terminal-body');
    const inputSpan = document.getElementById('terminal-input');

    if (!terminalBody || !inputSpan) return;

    // Use IntersectionObserver to start animation when visible
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

function startTyping(inputElement, containerElement) {
    const text = "neofetch";
    let index = 0;

    // Clear initial content just in case
    inputElement.textContent = "";

    function typeChar() {
        if (index < text.length) {
            inputElement.textContent += text.charAt(index);
            index++;
            setTimeout(typeChar, 100 + Math.random() * 100); // Random typing speed
        } else {
            // Finished typing, execute command
            setTimeout(() => {
                executeCommand(containerElement);
            }, 500);
        }
    }

    setTimeout(typeChar, 1000); // Initial delay
}

function executeCommand(container) {
    // 1. Remove cursor from current line (optional, but let's keep it simple)
    // 2. Append output
    const outputDiv = document.createElement('div');
    outputDiv.innerHTML = neofetchOutput;
    container.appendChild(outputDiv);

    // 3. Append new prompt line
    const newPrompt = document.createElement('div');
    newPrompt.className = 'prompt';
    newPrompt.innerHTML = `
        <span class="prompt-user">bl4zee</span><span class="prompt-at">@</span><span class="prompt-host">c0re</span>
        <span class="prompt-path">~</span>
        <span class="prompt-symbol">&gt;</span>
        <span class="input-line"></span><span class="cursor-block"></span>
    `;

    // Remove the cursor from the previous prompt
    const prevCursor = container.querySelector('.prompt:not(:last-child) .cursor-block');
    if (prevCursor) {
        prevCursor.remove();
    }

    container.appendChild(newPrompt);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

document.addEventListener('DOMContentLoaded', initTerminalAnimation);

document.addEventListener('DOMContentLoaded', initTerminalAnimation);

// Carousel Autoscroll
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('connect-carousel');
    if (!carousel) return;

    let isPaused = false;
    let scrollPos = 0;
    let direction = 1; // 1 for right, -1 for left
    const scrollSpeed = 0.3; // Pixels per frame

    function step() {
        if (!isPaused) {
            scrollPos += scrollSpeed * direction;

            const maxScroll = carousel.scrollWidth - carousel.clientWidth;

            if (scrollPos >= maxScroll) {
                scrollPos = maxScroll;
                direction = -1;
            } else if (scrollPos <= 0) {
                scrollPos = 0;
                direction = 1;
            }

            carousel.scrollLeft = scrollPos;
        }
        requestAnimationFrame(step);
    }

    carousel.addEventListener('mouseenter', () => isPaused = true);
    carousel.addEventListener('mouseleave', () => isPaused = false);

    // Initial start
    requestAnimationFrame(step);
});
