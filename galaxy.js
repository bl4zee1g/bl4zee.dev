// Simple Galaxy Star Background Animation
class GalaxyBackground {
    constructor() {
        this.canvas = document.getElementById('galaxy-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];

        // Configuration
        this.starCount = 150;

        this.init();
    }

    init() {
        this.resize();
        this.createStars();

        window.addEventListener('resize', () => {
            this.resize();
            this.createStars();
        });

        // Start animation
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = document.documentElement.scrollHeight;
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                color: this.getStarColor()
            });
        }
    }

    getStarColor() {
        const colors = [
            'rgba(255, 255, 255, ',      // White
            'rgba(196, 181, 253, ',      // Lavender
            'rgba(216, 180, 254, ',      // Pastel purple
            'rgba(200, 220, 255, ',      // Blue-white
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawStar(star) {
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fillStyle = star.color + star.opacity + ')';
        this.ctx.fill();
    }

    updateStars() {
        this.stars.forEach(star => {
            // Move star
            star.x += star.speedX;
            star.y += star.speedY;

            // Wrap around screen edges
            if (star.x < 0) star.x = this.canvas.width;
            if (star.x > this.canvas.width) star.x = 0;
            if (star.y < 0) star.y = this.canvas.height;
            if (star.y > this.canvas.height) star.y = 0;
        });
    }

    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars
        this.stars.forEach(star => this.drawStar(star));

        // Update star positions
        this.updateStars();

        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GalaxyBackground();
});
