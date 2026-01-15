// Editor functionality
let codeEditor; // Will be initialized as CodeMirror instance
const codeEditorContainer = document.getElementById("codeEditorContainer");
const runCodeBtn = document.getElementById("runCode");
const resetCodeBtn = document.getElementById("resetCode");
const statusIndicator = document.getElementById("statusIndicator");
const errorDisplay = document.getElementById("errorDisplay");
const challengesBtn = document.getElementById("challengesBtn");
const challengesMenu = document.getElementById("challengesMenu");
const toggleInstructionsBtn = document.getElementById("toggleInstructions");
const instructionsPanel = document.getElementById("instructionsPanel");
const playAgainBtn = document.getElementById("playAgainBtn");

// Default code template
const defaultCode = `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,           // How fast the player ship moves (pixels per frame)
    playerColor: 'green',    // Player ship color (color name or hex code)
    playerSize: 40,           // Size of the player ship (pixels)
    
    // Enemy settings
    enemySpeed: 0.8,          // How fast enemies fall (pixels per frame)
    enemySpawnRate: 60,       // Frames between enemy spawns (lower = more enemies)
    enemySize: 30,            // Size of enemies (pixels)
    enemyColor: 'red',        // Enemy color
    
    // Bullet settings
    bulletSpeed: 8,           // How fast bullets travel (pixels per frame)
    bulletSize: 5,            // Size of bullets (pixels)
    bulletColor: 'yellow',    // Bullet color
    bulletCooldown: 15,       // Frames between shots (lower = faster shooting)
    
    // Game settings
    scoreMultiplier: 10,     // Points per enemy destroyed
    gameSpeed: 1,             // Overall game speed multiplier
    lives: 3,                 // Starting number of lives
    invulnerabilityTime: 120, // Frames of invulnerability after being hit
    rainbowMode: false        // Enable rainbow color effects
};`;

// Initialize CodeMirror editor when DOM and CodeMirror are ready
function initializeEditor() {
  if (typeof CodeMirror === "undefined") {
    console.error("CodeMirror not loaded");
    // Fallback to textarea if CodeMirror fails
    const textarea = document.createElement("textarea");
    textarea.id = "codeEditor";
    textarea.spellcheck = false;
    textarea.value = defaultCode;
    codeEditorContainer.appendChild(textarea);
    codeEditor = {
      getValue: () => textarea.value,
      setValue: (val) => {
        textarea.value = val;
      },
    };
    return;
  }

  codeEditor = CodeMirror(codeEditorContainer, {
    value: defaultCode,
    mode: "javascript",
    theme: "monokai",
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    autofocus: false,
  });

  // Set editor size to fill container
  function resizeEditor() {
    const container = codeEditorContainer.parentElement;
    if (codeEditor && codeEditor.setSize) {
      codeEditor.setSize(null, container.clientHeight - 120);
    }
  }

  window.addEventListener("resize", resizeEditor);
  resizeEditor();
}

// Execute code safely
function executeCode() {
  const code = codeEditor.getValue();

  // Clear previous errors
  errorDisplay.classList.remove("show");
  errorDisplay.textContent = "";
  statusIndicator.textContent = "Running...";
  statusIndicator.className = "status-indicator running";

  try {
    // Create a safe execution context
    // Extract GAME_CONFIG assignment
    const configMatch = code.match(/const\s+GAME_CONFIG\s*=\s*(\{[\s\S]*?\});/);

    if (!configMatch) {
      throw new Error(
        'Could not find GAME_CONFIG object. Make sure it starts with "const GAME_CONFIG = {"'
      );
    }

    // Try to parse and validate the config
    const configCode = configMatch[1];

    // Use Function constructor for safer eval (still not perfect, but better than direct eval)
    const configObj = new Function("return " + configCode)();

    // Validate it's an object
    if (typeof configObj !== "object" || configObj === null) {
      throw new Error("GAME_CONFIG must be an object");
    }

    // Merge with existing config (preserve defaults for missing properties)
    Object.assign(GAME_CONFIG, configObj);

    // Apply config to game
    if (typeof applyConfig === "function") {
      applyConfig();
    }

    // Success!
    statusIndicator.textContent = "Success!";
    statusIndicator.className = "status-indicator";

    // Restart game if it was running
    if (gameState && gameState.running) {
      // Game will continue with new settings
    } else {
      // Start the game automatically
      setTimeout(() => {
        if (typeof startGame === "function") {
          startGame();
        }
      }, 100);
    }
  } catch (error) {
    // Show error
    errorDisplay.textContent = `Error: ${error.message}\n\nTip: Make sure your code is valid JavaScript and GAME_CONFIG is properly formatted.`;
    errorDisplay.classList.add("show");
    statusIndicator.textContent = "Error";
    statusIndicator.className = "status-indicator error";

    console.error("Code execution error:", error);
  }
}

// Reset to default code
function resetToDefault() {
  if (confirm("Reset code to default? This will lose your changes.")) {
    codeEditor.setValue(defaultCode);
    executeCode();
  }
}

// Challenge presets
const challenges = {
  superSpeed: {
    name: "Super Speed",
    code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 20,          // SUPER FAST!
    playerColor: 'green',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 0.8,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: 'red',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: 'yellow',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`,
  },
  rainbowMode: {
    name: "Rainbow Mode",
    code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: 'green',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 0.8,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: 'red',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: 'yellow',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: true         // RAINBOW COLORS!
};`,
  },
  rapidFire: {
    name: "Rapid Fire",
    code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: 'green',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 0.8,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: 'red',
    
    // Bullet settings
    bulletSpeed: 12,          // Faster bullets
    bulletSize: 5,
    bulletColor: 'yellow',
    bulletCooldown: 5,        // MUCH faster shooting!
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`,
  },
  biggerShip: {
    name: "Bigger Ship",
    code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: 'green',
    playerSize: 80,           // MUCH BIGGER!
    
    // Enemy settings
    enemySpeed: 0.8,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: 'red',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: 'yellow',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`,
  },
  slowMotion: {
    name: "Slow Motion",
    code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: 'green',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 0.5,          // SLOW MOTION!
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: 'red',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: 'yellow',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 0.5,           // Overall slow motion
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`,
  },
  doublePoints: {
    name: "Double Points",
    code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: 'green',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 0.8,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: 'red',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: 'yellow',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 100,     // HUGE POINTS!
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`,
  },
};

// Apply challenge
function applyChallenge(challengeKey) {
  const challenge = challenges[challengeKey];
  if (challenge) {
    codeEditor.setValue(challenge.code);
    executeCode();
    challengesMenu.classList.remove("active");
  }
}

// Event listeners
runCodeBtn.addEventListener("click", executeCode);

resetCodeBtn.addEventListener("click", resetToDefault);

challengesBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  challengesMenu.classList.toggle("active");
});

// Close challenges menu when clicking outside
document.addEventListener("click", (e) => {
  if (!challengesMenu.contains(e.target) && e.target !== challengesBtn) {
    challengesMenu.classList.remove("active");
  }
});

// Challenge item clicks
document.querySelectorAll(".challenge-item").forEach((item) => {
  item.addEventListener("click", () => {
    const challengeKey = item.getAttribute("data-challenge");
    applyChallenge(challengeKey);
  });
});

// Toggle instructions
toggleInstructionsBtn.addEventListener("click", () => {
  instructionsPanel.classList.toggle("show");
});

// Play again button handler
playAgainBtn.addEventListener("click", () => {
  if (typeof startGame === "function") {
    startGame();
  }
});

// Initialize editor and auto-start game on load
window.addEventListener("load", () => {
  initializeEditor();
  setTimeout(() => {
    executeCode();
  }, 500);
});
