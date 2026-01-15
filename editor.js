// Editor functionality
const codeEditor = document.getElementById('codeEditor');
const runCodeBtn = document.getElementById('runCode');
const resetCodeBtn = document.getElementById('resetCode');
const statusIndicator = document.getElementById('statusIndicator');
const errorDisplay = document.getElementById('errorDisplay');
const challengesBtn = document.getElementById('challengesBtn');
const challengesMenu = document.getElementById('challengesMenu');
const toggleInstructionsBtn = document.getElementById('toggleInstructions');
const instructionsPanel = document.getElementById('instructionsPanel');

// Default code template
const defaultCode = `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,           // How fast the player ship moves (pixels per frame)
    playerColor: '#00ff00',   // Player ship color (hex code or color name)
    playerSize: 40,           // Size of the player ship (pixels)
    
    // Enemy settings
    enemySpeed: 2,            // How fast enemies fall (pixels per frame)
    enemySpawnRate: 60,       // Frames between enemy spawns (lower = more enemies)
    enemySize: 30,            // Size of enemies (pixels)
    enemyColor: '#ff0000',    // Enemy color
    
    // Bullet settings
    bulletSpeed: 8,           // How fast bullets travel (pixels per frame)
    bulletSize: 5,            // Size of bullets (pixels)
    bulletColor: '#ffff00',   // Bullet color
    bulletCooldown: 15,       // Frames between shots (lower = faster shooting)
    
    // Game settings
    scoreMultiplier: 10,     // Points per enemy destroyed
    gameSpeed: 1,             // Overall game speed multiplier
    lives: 3,                 // Starting number of lives
    invulnerabilityTime: 120, // Frames of invulnerability after being hit
    rainbowMode: false        // Enable rainbow color effects
};`;

// Initialize editor with default code
codeEditor.value = defaultCode;

// Simple syntax highlighting (basic implementation)
function highlightCode() {
    // This is a basic implementation - for a full editor, consider using CodeMirror
    // For now, we'll just ensure the code is readable
    codeEditor.style.color = '#d4d4d4';
}

// Execute code safely
function executeCode() {
    const code = codeEditor.value;
    
    // Clear previous errors
    errorDisplay.classList.remove('show');
    errorDisplay.textContent = '';
    statusIndicator.textContent = 'Running...';
    statusIndicator.className = 'status-indicator running';
    
    try {
        // Create a safe execution context
        // Extract GAME_CONFIG assignment
        const configMatch = code.match(/const\s+GAME_CONFIG\s*=\s*(\{[\s\S]*?\});/);
        
        if (!configMatch) {
            throw new Error('Could not find GAME_CONFIG object. Make sure it starts with "const GAME_CONFIG = {"');
        }
        
        // Try to parse and validate the config
        const configCode = configMatch[1];
        
        // Use Function constructor for safer eval (still not perfect, but better than direct eval)
        const configObj = new Function('return ' + configCode)();
        
        // Validate it's an object
        if (typeof configObj !== 'object' || configObj === null) {
            throw new Error('GAME_CONFIG must be an object');
        }
        
        // Merge with existing config (preserve defaults for missing properties)
        Object.assign(GAME_CONFIG, configObj);
        
        // Apply config to game
        if (typeof applyConfig === 'function') {
            applyConfig();
        }
        
        // Success!
        statusIndicator.textContent = 'Success!';
        statusIndicator.className = 'status-indicator';
        
        // Restart game if it was running
        if (gameState && gameState.running) {
            // Game will continue with new settings
        } else {
            // Start the game automatically
            setTimeout(() => {
                if (typeof startGame === 'function') {
                    startGame();
                }
            }, 100);
        }
        
    } catch (error) {
        // Show error
        errorDisplay.textContent = `Error: ${error.message}\n\nTip: Make sure your code is valid JavaScript and GAME_CONFIG is properly formatted.`;
        errorDisplay.classList.add('show');
        statusIndicator.textContent = 'Error';
        statusIndicator.className = 'status-indicator error';
        
        console.error('Code execution error:', error);
    }
}

// Reset to default code
function resetToDefault() {
    if (confirm('Reset code to default? This will lose your changes.')) {
        codeEditor.value = defaultCode;
        executeCode();
    }
}

// Challenge presets
const challenges = {
    superSpeed: {
        name: 'Super Speed',
        code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 20,          // SUPER FAST!
    playerColor: '#00ff00',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 2,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: '#ff0000',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: '#ffff00',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`
    },
    rainbowMode: {
        name: 'Rainbow Mode',
        code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: '#00ff00',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 2,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: '#ff0000',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: '#ffff00',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: true         // RAINBOW COLORS!
};`
    },
    rapidFire: {
        name: 'Rapid Fire',
        code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: '#00ff00',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 2,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: '#ff0000',
    
    // Bullet settings
    bulletSpeed: 12,          // Faster bullets
    bulletSize: 5,
    bulletColor: '#ffff00',
    bulletCooldown: 5,        // MUCH faster shooting!
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`
    },
    biggerShip: {
        name: 'Bigger Ship',
        code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: '#00ff00',
    playerSize: 80,           // MUCH BIGGER!
    
    // Enemy settings
    enemySpeed: 2,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: '#ff0000',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: '#ffff00',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`
    },
    slowMotion: {
        name: 'Slow Motion',
        code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: '#00ff00',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 0.5,          // SLOW MOTION!
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: '#ff0000',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: '#ffff00',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 10,
    gameSpeed: 0.5,           // Overall slow motion
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`
    },
    doublePoints: {
        name: 'Double Points',
        code: `// Game Configuration - MODIFY THESE VALUES TO CHANGE THE GAME!
const GAME_CONFIG = {
    // Player settings
    playerSpeed: 5,
    playerColor: '#00ff00',
    playerSize: 40,
    
    // Enemy settings
    enemySpeed: 2,
    enemySpawnRate: 60,
    enemySize: 30,
    enemyColor: '#ff0000',
    
    // Bullet settings
    bulletSpeed: 8,
    bulletSize: 5,
    bulletColor: '#ffff00',
    bulletCooldown: 15,
    
    // Game settings
    scoreMultiplier: 100,     // HUGE POINTS!
    gameSpeed: 1,
    lives: 3,
    invulnerabilityTime: 120,
    rainbowMode: false
};`
    }
};

// Apply challenge
function applyChallenge(challengeKey) {
    const challenge = challenges[challengeKey];
    if (challenge) {
        codeEditor.value = challenge.code;
        executeCode();
        challengesMenu.classList.remove('active');
    }
}

// Event listeners
runCodeBtn.addEventListener('click', executeCode);

resetCodeBtn.addEventListener('click', resetToDefault);

challengesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    challengesMenu.classList.toggle('active');
});

// Close challenges menu when clicking outside
document.addEventListener('click', (e) => {
    if (!challengesMenu.contains(e.target) && e.target !== challengesBtn) {
        challengesMenu.classList.remove('active');
    }
});

// Challenge item clicks
document.querySelectorAll('.challenge-item').forEach(item => {
    item.addEventListener('click', () => {
        const challengeKey = item.getAttribute('data-challenge');
        applyChallenge(challengeKey);
    });
});

// Toggle instructions
toggleInstructionsBtn.addEventListener('click', () => {
    instructionsPanel.classList.toggle('show');
});

// Auto-format on tab
codeEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeEditor.selectionStart;
        const end = codeEditor.selectionEnd;
        codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);
        codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
    }
});

// Initialize
highlightCode();

// Auto-start game on load
window.addEventListener('load', () => {
    setTimeout(() => {
        executeCode();
    }, 500);
});
