// Game UI controls and debug output handling

// Toggle debug log visibility
document.getElementById('btn-log').onclick = function() {
    const log = document.getElementById('output');
    if (log.style.display === 'none') {
        log.style.display = 'block';
        this.textContent = 'Hide Log';
    } else {
        log.style.display = 'none';
        this.textContent = 'Show Log';
    }
};

// Mobile button handlers are in joystick/joystick.js
