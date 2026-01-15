// Editor functionality
let codeEditor; // Will be initialized as CodeMirror instance
const codeEditorContainer = document.getElementById("codeEditorContainer");
const runCodeBtn = document.getElementById("runCode");
const resetCodeBtn = document.getElementById("resetCode");
const statusIndicator = document.getElementById("statusIndicator");
const errorDisplay = document.getElementById("errorDisplay");
const challengesBtn = document.getElementById("challengesBtn");
const challengesMenu = document.getElementById("challengesMenu");
const themeBtn = document.getElementById("themeBtn");
const themeMenu = document.getElementById("themeMenu");
const toggleInstructionsBtn = document.getElementById("toggleInstructions");
const instructionsPanel = document.getElementById("instructionsPanel");
const playAgainBtn = document.getElementById("playAgainBtn");

// Default code template
const defaultCode = `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 2,         // How fast the player ship moves (pixels per frame)
    playerColor: "green",   // Player ship color (color name or hex code)
    playerSize: 40,         // Size of the player ship (pixels)

    // Enemy settings
    enemySpeed: 0.8,        // How fast enemies fall (pixels per frame)
    enemySpawnRate: 360,    // Frames between enemy spawns (lower = more enemies)
    enemySize: 30,          // Size of enemies (pixels)
    enemyColor: "red",      // Enemy color

    // Bullet settings
    bulletSpeed: 0.5,       // How fast bullets travel (pixels per frame)
    bulletSize: 5,          // Size of bullets (pixels)
    bulletColor: "yellow",  // Bullet color
    bulletCooldown: 120,    // Frames between shots (lower = faster shooting)

    // Game settings
    scoreMultiplier: 10,     // Points per enemy destroyed
    gameSpeed: 1,            // Overall game speed multiplier
    lives: 3,                // Starting number of lives
    invulnerabilityTime: 120 // Frames of invulnerability after being hit
};`;

// Theme management
const availableThemes = {
  // Dark themes
  monokai: "Monokai",
  dracula: "Dracula",
  darcula: "Darcula",
  material: "Material",
  "material-darker": "Material Darker",
  "material-ocean": "Material Ocean",
  "material-palenight": "Material Palenight",
  "3024-night": "3024 Night",
  blackboard: "Blackboard",
  cobalt: "Cobalt",
  hopscotch: "Hopscotch",
  "pastel-on-dark": "Pastel on Dark",
  "ayu-dark": "Ayu Dark",
  "ayu-mirage": "Ayu Mirage",
  "base16-dark": "Base16 Dark",
  "gruvbox-dark": "Gruvbox Dark",
  nord: "Nord",
  "oceanic-next": "Oceanic Next",
  seti: "Seti",
  "tomorrow-night-bright": "Tomorrow Night Bright",
  "tomorrow-night-eighties": "Tomorrow Night Eighties",
  twilight: "Twilight",
  "vibrant-ink": "Vibrant Ink",
  zenburn: "Zenburn",
  "the-matrix": "The Matrix",
  icecoder: "Icecoder",
  rubyblue: "Rubyblue",
  "xq-dark": "XQ Dark",
  // Light themes
  default: "Default",
  "3024-day": "3024 Day",
  eclipse: "Eclipse",
  solarized: "Solarized",
  "xq-light": "XQ Light",
  "base16-light": "Base16 Light",
  "duotone-light": "Duotone Light",
  "paraiso-light": "Paraiso Light",
  yeti: "Yeti",
  neat: "Neat",
  elegant: "Elegant",
};

let loadedThemes = new Set(["monokai"]); // monokai is already loaded in HTML

// Load theme CSS dynamically
function loadTheme(themeName) {
  // "default" theme doesn't need a CSS file - it's the base CodeMirror style
  if (themeName === "default") {
    return Promise.resolve();
  }

  if (loadedThemes.has(themeName)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/${themeName}.min.css`;
    link.onload = () => {
      loadedThemes.add(themeName);
      resolve();
    };
    link.onerror = () => {
      console.error(`Failed to load theme: ${themeName}`);
      reject(new Error(`Failed to load theme: ${themeName}`));
    };
    document.head.appendChild(link);
  });
}

// Change editor theme
function changeTheme(themeName) {
  if (!availableThemes[themeName]) {
    console.error(`Unknown theme: ${themeName}`);
    return;
  }

  loadTheme(themeName)
    .then(() => {
      if (codeEditor) {
        // For "default" theme, use empty string (no theme)
        const themeValue = themeName === "default" ? "" : themeName;
        codeEditor.setOption("theme", themeValue);
      }

      // Update UI
      themeBtn.textContent = `🎨 Theme: ${availableThemes[themeName]} ▼`;

      // Update active state
      document.querySelectorAll(".theme-item").forEach((item) => {
        item.classList.remove("active");
        if (item.getAttribute("data-theme") === themeName) {
          item.classList.add("active");
        }
      });

      // Save preference
      localStorage.setItem("codeEditorTheme", themeName);
    })
    .catch((error) => {
      console.error("Error changing theme:", error);
      // Show user-friendly error
      alert(
        `Failed to load theme: ${availableThemes[themeName]}. Please try another theme.`
      );
    });
}

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

  // Get saved theme or default to monokai
  const savedTheme = localStorage.getItem("codeEditorTheme") || "monokai";

  // For "default" theme, use empty string (no theme)
  const initialTheme = savedTheme === "default" ? "" : savedTheme;

  codeEditor = CodeMirror(codeEditorContainer, {
    value: defaultCode,
    mode: "javascript",
    theme: initialTheme,
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    autofocus: false,
  });

  // Set initial theme UI state (only if not default, since default doesn't need loading)
  if (savedTheme !== "default") {
    changeTheme(savedTheme);
  } else {
    // For default theme, just update the UI
    themeBtn.textContent = `🎨 Theme: Default ▼`;
    document.querySelectorAll(".theme-item").forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-theme") === "default") {
        item.classList.add("active");
      }
    });
  }

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

// Theme selector
themeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  themeMenu.classList.toggle("active");
});

// Close theme menu when clicking outside
document.addEventListener("click", (e) => {
  if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
    themeMenu.classList.remove("active");
  }
});

// Theme item clicks
document.querySelectorAll(".theme-item").forEach((item) => {
  item.addEventListener("click", () => {
    const themeName = item.getAttribute("data-theme");
    changeTheme(themeName);
    themeMenu.classList.remove("active");
  });
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
