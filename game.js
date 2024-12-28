class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('gameScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.tryAgainButton = document.getElementById('tryAgainButton');
        
        // Game state
        this.score = 0;
        this.isJumping = false;
        this.gameLoop = null;
        this.obstacles = [];
        this.isGameOver = false;
        this.gameStartTime = Date.now();
        this.baseSpeed = 6;
        this.currentSpeed = this.baseSpeed;
        this.isMobile = this.checkIfMobile();
        
        // Ground level (higher up from bottom now)
        this.groundY = this.canvas.height - 60;
        
        // Player properties
        this.playerWidth = 40;
        this.playerHeight = 40;
        this.playerX = 50;
        this.playerY = this.groundY - this.playerHeight;
        this.jumpVelocity = 0;
        this.gravity = 0.7;
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.tryAgain = this.tryAgain.bind(this);
        
        // Event listeners for both keyboard and touch
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Add all touch-related event listeners
        this.canvas.addEventListener('touchstart', this.handleTouch, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
        
        // Prevent all default touch behaviors on the canvas
        this.canvas.style.touchAction = 'none';
        
        // Prevent double-tap zoom on mobile
        document.documentElement.style.touchAction = 'manipulation';
        
        // Add click event for mobile browsers that translate touch to click
        this.canvas.addEventListener('click', (e) => {
            if (this.isMobile) {
                e.preventDefault();
                this.handleTouch(e);
            }
        });
        
        this.tryAgainButton.addEventListener('click', this.tryAgain);
        
        // Start the game
        this.start();
    }
    
    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    start() {
        this.score = 0;
        this.obstacles = [];
        this.isGameOver = false;
        this.playerY = this.groundY - this.playerHeight;
        this.jumpVelocity = 0;
        this.isJumping = false;
        this.scoreElement.textContent = '0';
        this.tryAgainButton.classList.add('hidden');
        this.gameStartTime = Date.now();
        this.currentSpeed = this.baseSpeed;
        this.addObstacle();
        this.gameLoop = setInterval(this.update, 1000 / 60); // 60 FPS
    }

    stop() {
        clearInterval(this.gameLoop);
        this.isGameOver = true;
        this.finalScoreElement.textContent = this.score;
        if (!this.tryAgainButton.classList.contains('hidden')) {
            this.tryAgainButton.classList.add('hidden');
        }
    }
    
    handleTouch(event) {
        event.preventDefault();
        
        if (!this.isJumping && !this.isGameOver) {
            this.isJumping = true;
            this.jumpVelocity = -13.5;
        }
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
    }
    
    drawPoop(x, y) {
        // Universal emoji font stack for better cross-browser support
        this.ctx.font = '40px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", EmojiSymbols, EmojiOne, "Segoe UI Symbol", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💩', x + this.playerWidth/2, y + this.playerHeight/2);
    }
    
    drawToilet(x, y, width, height) {
        // Universal emoji font stack for better cross-browser support
        this.ctx.font = `${height}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", EmojiSymbols, EmojiOne, "Segoe UI Symbol", sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🚽', x + width/2, y + height/2);
    }
    
    createToilet(xPosition) {
        const minSize = 45;
        const maxSize = 65;
        const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        
        return {
            x: xPosition,
            y: this.groundY - size,
            width: size,
            height: size
        };
    }
    
    addObstacle() {
        // Randomly decide if we want 1 or 2 toilets
        const toiletCount = Math.random() < 0.5 ? 2 : 1; // 50% chance for double toilets
        
        if (toiletCount === 1) {
            this.obstacles.push(this.createToilet(this.canvas.width));
        } else {
            // Create two identical toilets right next to each other
            const toilet1 = this.createToilet(this.canvas.width);
            const toilet2 = {
                ...toilet1,
                x: this.canvas.width + toilet1.width - 5 // Slight overlap for closer appearance
            };
            
            this.obstacles.push(toilet1, toilet2);
        }

        // Randomly add a third toilet sometimes for extra challenge
        if (this.score > 10 && Math.random() < 0.2) { // 20% chance after score > 10
            const toilet3 = this.createToilet(this.canvas.width + toilet1.width * 2);
            this.obstacles.push(toilet3);
        }
    }
    
    updateSpeed() {
        const elapsedSeconds = (Date.now() - this.gameStartTime) / 1000;
        const speedIncrements = Math.floor(elapsedSeconds / 10); // Speed increases every 10 seconds instead of 15
        this.currentSpeed = this.baseSpeed + speedIncrements * 0.8; // Bigger speed increase (0.8 instead of 0.5)
    }
    
    update() {
        if (this.isGameOver) return;

        // Update speed based on time
        this.updateSpeed();

        // Update player
        if (this.isJumping) {
            this.playerY += this.jumpVelocity;
            this.jumpVelocity += this.gravity;
            
            if (this.playerY >= this.groundY - this.playerHeight) {
                this.playerY = this.groundY - this.playerHeight;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.currentSpeed;
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                this.scoreElement.textContent = this.score;
            }
            
            // Collision detection
            if (this.checkCollision(obstacle)) {
                this.gameOver();
                return;
            }
        }
        
        // Add new obstacles
        if (this.obstacles.length === 0 || 
            this.obstacles[this.obstacles.length - 1].x < this.canvas.width - 300) {
            this.addObstacle();
        }
        
        this.draw();
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.isGameOver = true;
        this.tryAgainButton.classList.remove('hidden');
        this.draw();
    }
    
    checkCollision(obstacle) {
        const playerHitbox = {
            x: this.playerX + 10,
            y: this.playerY + 10,
            width: this.playerWidth - 20,
            height: this.playerHeight - 20
        };
        
        return !(playerHitbox.x + playerHitbox.width < obstacle.x + 10 || 
                playerHitbox.x > obstacle.x + obstacle.width - 10 ||
                playerHitbox.y + playerHitbox.height < obstacle.y + 10 ||
                playerHitbox.y > obstacle.y + obstacle.height - 10);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');  // Sky blue at top
        gradient.addColorStop(1, '#E0F6FF');  // Lighter blue at bottom
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw decorative clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(80, 40, 1);
        this.drawCloud(200, 60, 0.8);
        this.drawCloud(350, 30, 1.2);
        
        // Draw ground with gradient
        const groundGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#90EE90');  // Light green
        groundGradient.addColorStop(1, '#228B22');  // Forest green
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Draw ground line
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.strokeStyle = '#228B22';
        this.ctx.stroke();
        
        // Draw player (poop)
        this.drawPoop(this.playerX, this.playerY);
        
        // Draw obstacles (toilets)
        this.obstacles.forEach(obstacle => {
            this.drawToilet(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw game over text and emojis
        if (this.isGameOver) {
            // Add semi-transparent overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '24px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", EmojiSymbols, EmojiOne, "Segoe UI Symbol", sans-serif';
            this.ctx.textAlign = 'center';
            const gameOverText = `Game Over!👨‍💼💀`;
            this.ctx.fillText(gameOverText, this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    drawCloud(x, y, scale) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 15 * scale, y - 10 * scale, 15 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 30 * scale, y, 20 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 15 * scale, y + 5 * scale, 15 * scale, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    tryAgain() {
        this.start();
    }
    
    handleKeyPress(event) {
        if (event.code === 'Space' && !this.isJumping && !this.isGameOver) {
            this.isJumping = true;
            this.jumpVelocity = -13.5; // Middle ground for jump power
        }
    }
}

// Initialize game when timer starts
document.getElementById('startButton').addEventListener('click', () => {
    window.game = new Game();
});

// Stop game when timer stops
document.getElementById('stopButton').addEventListener('click', () => {
    if (window.game) {
        window.game.stop();
    }
}); 