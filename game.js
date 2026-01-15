// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
  // Player settings
  playerSpeed: 5, // How fast the player ship moves (pixels per frame)
  playerColor: "green", // Player ship color (color name or hex code)
  playerSize: 40, // Size of the player ship (pixels)

  // Enemy settings
  enemySpeed: 0.8, // How fast enemies fall (pixels per frame)
  enemySpawnRate: 60, // Frames between enemy spawns (lower = more enemies)
  enemySize: 30, // Size of enemies (pixels)
  enemyColor: "red", // Enemy color

  // Bullet settings
  bulletSpeed: 8, // How fast bullets travel (pixels per frame)
  bulletSize: 5, // Size of bullets (pixels)
  bulletColor: "yellow", // Bullet color
  bulletCooldown: 15, // Frames between shots (lower = faster shooting)

  // Game settings
  scoreMultiplier: 10, // Points per enemy destroyed
  gameSpeed: 1, // Overall game speed multiplier
  lives: 3, // Starting number of lives
  invulnerabilityTime: 120, // Frames of invulnerability after being hit
};

// Game state
let gameState = {
  running: false,
  paused: false,
  gameOver: false,
  score: 0,
  lives: GAME_CONFIG.lives,
  lastFrameTime: 0,
  invulnerable: false,
  invulnerableTimer: 0,
};

// Game objects
let player = null;
let enemies = [];
let bullets = [];
let particles = [];

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fit container
function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth - 30;
  canvas.height = container.clientHeight - 80;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Player class
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = canvas.width / 2;
    // Constrain player to bottom 25% of canvas
    const playableAreaTop = canvas.height * 0.75;
    const playableAreaBottom = canvas.height - 60;
    this.y = playableAreaBottom;
    this.width = GAME_CONFIG.playerSize;
    this.height = GAME_CONFIG.playerSize;
    this.speed = GAME_CONFIG.playerSpeed;
    this.color = GAME_CONFIG.playerColor;
    this.lastShot = 0;
    this.playableAreaTop = playableAreaTop;
    this.playableAreaBottom = playableAreaBottom;
  }

  update() {
    // Handle input
    const keys = gameState.keys || {};

    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      this.x = Math.max(
        this.width / 2,
        this.x - this.speed * GAME_CONFIG.gameSpeed
      );
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      this.x = Math.min(
        canvas.width - this.width / 2,
        this.x + this.speed * GAME_CONFIG.gameSpeed
      );
    }
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
      // Move forward (up) but stay within bottom 25% of canvas
      this.y = Math.max(
        this.playableAreaTop + this.height / 2,
        this.y - this.speed * GAME_CONFIG.gameSpeed
      );
    }
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
      // Move backward (down) but stay within bottom 25% of canvas
      this.y = Math.min(
        this.playableAreaBottom - this.height / 2,
        this.y + this.speed * GAME_CONFIG.gameSpeed
      );
    }
    if (keys[" "] || keys["Space"]) {
      this.shoot();
    }
  }

  shoot() {
    const currentFrame = gameState.frameCount || 0;
    if (currentFrame - this.lastShot >= GAME_CONFIG.bulletCooldown) {
      bullets.push(new Bullet(this.x, this.y - this.height / 2));
      this.lastShot = currentFrame;
    }
  }

  draw() {
    ctx.save();

    // Draw invulnerability flash
    if (gameState.invulnerable) {
      const flash = Math.sin(gameState.invulnerableTimer * 0.3) > 0;
      if (!flash) {
        ctx.restore();
        return;
      }
    }

    // Get color (support rainbow mode)
    let color = this.color;
    if (GAME_CONFIG.rainbowMode) {
      const hue = (gameState.frameCount || 0) % 360;
      color = `hsl(${hue}, 100%, 50%)`;
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    // Draw ship (triangle)
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height / 2);
    ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}

// Enemy class
class Enemy {
  constructor() {
    this.x =
      Math.random() * (canvas.width - GAME_CONFIG.enemySize) +
      GAME_CONFIG.enemySize / 2;
    this.y = -GAME_CONFIG.enemySize;
    this.width = GAME_CONFIG.enemySize;
    this.height = GAME_CONFIG.enemySize;
    this.speed = GAME_CONFIG.enemySpeed;
  }

  update() {
    this.y += this.speed * GAME_CONFIG.gameSpeed;
  }

  draw() {
    ctx.fillStyle = GAME_CONFIG.enemyColor;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    // Draw enemy (square)
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
    ctx.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}

// Bullet class
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.bulletSize;
    this.height = GAME_CONFIG.bulletSize * 2;
    this.speed = GAME_CONFIG.bulletSpeed;
  }

  update() {
    this.y -= this.speed * GAME_CONFIG.gameSpeed;
  }

  draw() {
    ctx.fillStyle = GAME_CONFIG.bulletColor;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;

    // Draw bullet (rectangle)
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
    ctx.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}

// Collision detection
function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Game loop
function gameLoop(timestamp) {
  if (!gameState.running || gameState.paused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  // Calculate delta time
  const deltaTime = timestamp - gameState.lastFrameTime;
  gameState.lastFrameTime = timestamp;
  gameState.frameCount = (gameState.frameCount || 0) + 1;

  // Update invulnerability timer
  if (gameState.invulnerable) {
    gameState.invulnerableTimer++;
    if (gameState.invulnerableTimer >= GAME_CONFIG.invulnerabilityTime) {
      gameState.invulnerable = false;
      gameState.invulnerableTimer = 0;
    }
  }

  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw stars background
  drawStars();

  // Update player
  if (player) {
    player.update();
    player.draw();
  }

  // Spawn enemies
  if (gameState.frameCount % GAME_CONFIG.enemySpawnRate === 0) {
    enemies.push(new Enemy());
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].draw();

    // Remove if off screen
    if (enemies[i].y > canvas.height + GAME_CONFIG.enemySize) {
      enemies.splice(i, 1);
      continue;
    }

    // Check collision with player
    if (
      player &&
      !gameState.invulnerable &&
      checkCollision(enemies[i].getBounds(), player.getBounds())
    ) {
      // Player hit
      gameState.lives--;
      gameState.invulnerable = true;
      gameState.invulnerableTimer = 0;
      enemies.splice(i, 1);

      if (gameState.lives <= 0) {
        endGame(false);
        return;
      }

      updateScoreDisplay();
    }
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw();

    // Remove if off screen
    if (bullets[i].y < -GAME_CONFIG.bulletSize) {
      bullets.splice(i, 1);
      continue;
    }

    // Check collision with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (checkCollision(bullets[i].getBounds(), enemies[j].getBounds())) {
        // Hit!
        gameState.score += GAME_CONFIG.scoreMultiplier;
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        updateScoreDisplay();
        break;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

// Draw stars background
function drawStars() {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 50; i++) {
    const x = (i * 37) % canvas.width;
    const y = (i * 53 + gameState.frameCount * 0.5) % canvas.height;
    ctx.fillRect(x, y, 1, 1);
  }
}

// Input handling
gameState.keys = {};
document.addEventListener("keydown", (e) => {
  gameState.keys[e.key] = true;
  if (e.key === " ") {
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  gameState.keys[e.key] = false;
});

// Game control functions
function startGame() {
  if (gameState.running) return;

  gameState.running = true;
  gameState.paused = false;
  gameState.gameOver = false;
  gameState.score = 0;
  gameState.lives = GAME_CONFIG.lives;
  gameState.frameCount = 0;
  gameState.invulnerable = false;
  gameState.invulnerableTimer = 0;

  player = new Player();
  enemies = [];
  bullets = [];

  updateScoreDisplay();
  hideGameOver();
  gameState.lastFrameTime = performance.now();
  gameLoop(gameState.lastFrameTime);
}

function pauseGame() {
  gameState.paused = !gameState.paused;
}

function endGame(won) {
  gameState.running = false;
  gameState.gameOver = true;

  const overlay = document.getElementById("gameOverlay");
  const message = document.getElementById("gameOverMessage");
  const playAgainBtn = document.getElementById("playAgainBtn");

  if (won) {
    message.textContent = "🎉 You Won! 🎉";
    message.style.color = "#4CAF50";
  } else {
    message.textContent = "Game Over!";
    message.style.color = "#ff4444";
  }

  playAgainBtn.style.display = "block";
  overlay.classList.add("show");
}

function hideGameOver() {
  const overlay = document.getElementById("gameOverlay");
  const playAgainBtn = document.getElementById("playAgainBtn");
  overlay.classList.remove("show");
  playAgainBtn.style.display = "none";
}

function resetGame() {
  gameState.running = false;
  gameState.gameOver = false;
  player = null;
  enemies = [];
  bullets = [];
  hideGameOver();
  updateScoreDisplay();
}

function updateScoreDisplay() {
  document.getElementById("scoreValue").textContent = gameState.score;
  document.getElementById("livesValue").textContent = gameState.lives;
}

// Apply config changes
function applyConfig() {
  if (player) {
    player.reset();
  }
  gameState.lives = GAME_CONFIG.lives;
  updateScoreDisplay();
}

// Initialize
resetGame();
