/**
 * Virtual Joystick Implementation
 * Integrates with existing game controls and sends WASD key events
 */

class VirtualJoystick {
    constructor(container) {
        this.container = container;
        this.knob = null;
        this.base = null;
        this.isDragging = false;
        this.currentDirection = null;
        this.deadZone = 0.2; // 20% dead zone
        this.maxDistance = 35; // Maximum distance from center
        
        this.center = { x: 60, y: 60 }; // Center of 120px joystick
        this.currentPos = { x: this.center.x, y: this.center.y };
        
        this.activeKeys = new Set();
        
        this.init();
    }
    
    init() {
        // Create joystick elements
        this.base = document.createElement('div');
        this.base.className = 'joystick-base';
        
        this.knob = document.createElement('div');
        this.knob.className = 'joystick-knob';
        
        this.base.appendChild(this.knob);
        this.container.appendChild(this.base);
        
        // Add event listeners
        this.addEventListeners();
        
        // Position knob at center initially
        this.updateKnobPosition(this.center.x, this.center.y);
    }
    
    addEventListeners() {
        // Mouse events
        this.knob.addEventListener('mousedown', this.onStart.bind(this));
        document.addEventListener('mousemove', this.onMove.bind(this));
        document.addEventListener('mouseup', this.onEnd.bind(this));
        
        // Touch events
        this.knob.addEventListener('touchstart', this.onStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onEnd.bind(this));
        document.addEventListener('touchcancel', this.onEnd.bind(this));
    }
    
    onStart(event) {
        event.preventDefault();
        this.isDragging = true;
        this.knob.classList.add('dragging');
        
        // Capture pointer for better tracking
        if (event.type === 'mousedown') {
            this.knob.setPointerCapture?.(event.pointerId);
        }
    }
    
    onMove(event) {
        if (!this.isDragging) return;
        
        event.preventDefault();
        
        const rect = this.base.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if (event.type.includes('touch')) {
            const touch = event.touches[0] || event.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Constrain to max distance
        let constrainedX = deltaX;
        let constrainedY = deltaY;
        
        if (distance > this.maxDistance) {
            const ratio = this.maxDistance / distance;
            constrainedX = deltaX * ratio;
            constrainedY = deltaY * ratio;
        }
        
        // Update knob position
        const knobX = this.center.x + constrainedX;
        const knobY = this.center.y + constrainedY;
        this.updateKnobPosition(knobX, knobY);
        
        // Calculate direction and send key events
        this.updateDirection(constrainedX, constrainedY);
    }
    
    onEnd(event) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.knob.classList.remove('dragging');
        
        // Return knob to center
        this.updateKnobPosition(this.center.x, this.center.y);
        
        // Release all movement keys
        this.releaseAllKeys();
        this.currentDirection = null;
    }
    
    updateKnobPosition(x, y) {
        this.currentPos = { x, y };
        this.knob.style.left = (x - 25) + 'px'; // 25 = half of knob width
        this.knob.style.top = (y - 25) + 'px';  // 25 = half of knob height
    }
    
    updateDirection(deltaX, deltaY) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedDistance = distance / this.maxDistance;
        
        // Release all keys first
        this.releaseAllKeys();
        
        // Check if we're outside the dead zone
        if (normalizedDistance > this.deadZone) {
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            const newDirection = this.angleToDirection(angle);
            
            if (newDirection !== this.currentDirection) {
                this.currentDirection = newDirection;
            }
            
            // Send appropriate key events
            this.sendDirectionKeys(newDirection);
        } else {
            this.currentDirection = null;
        }
    }
    
    angleToDirection(angle) {
        // Normalize angle to 0-360
        const normalizedAngle = ((angle + 360) % 360);
        
        // Define direction ranges (45-degree sectors)
        if (normalizedAngle >= 315 || normalizedAngle < 45) {
            return 'right'; // D key
        } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
            return 'down'; // S key
        } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
            return 'left'; // A key
        } else if (normalizedAngle >= 225 && normalizedAngle < 315) {
            return 'up'; // W key
        }
        
        return null;
    }
    
    sendDirectionKeys(direction) {
        const keyMap = {
            'up': 'W',
            'down': 'S',
            'left': 'A',
            'right': 'D'
        };
        
        if (direction && keyMap[direction]) {
            this.sendKeyEvent('keydown', keyMap[direction]);
            this.activeKeys.add(keyMap[direction]);
        }
    }
    
    releaseAllKeys() {
        this.activeKeys.forEach(key => {
            this.sendKeyEvent('keyup', key);
        });
        this.activeKeys.clear();
    }
    
    sendKeyEvent(type, key) {
        const code = key.charCodeAt(0);
        const event = new KeyboardEvent(type, {
            key: key,
            keyCode: code,
            which: code,
            bubbles: true,
            cancelable: true
        });
        
        // Dispatch to window for the game to catch
        window.dispatchEvent(event);
    }
    
    destroy() {
        this.releaseAllKeys();
        if (this.container && this.base) {
            this.container.removeChild(this.base);
        }
    }
}

// Initialize joystick when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on mobile devices
    if (window.innerWidth <= 600) {
        initializeJoystick();
    }
    
    // Re-initialize on window resize if needed
    window.addEventListener('resize', function() {
        const mobileControls = document.getElementById('mobile-controls');
        if (window.innerWidth <= 600 && !document.querySelector('.joystick-container')) {
            initializeJoystick();
        } else if (window.innerWidth > 600 && document.querySelector('.joystick-container')) {
            removeJoystick();
        }
    });
});

let joystickInstance = null;

function initializeJoystick() {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;
    
    // Add joystick-active class to hide original directional controls
    mobileControls.classList.add('joystick-active');
    
    // Create new layout with joystick
    mobileControls.innerHTML = `
        <div class="mobile-controls-with-joystick">
            <div class="joystick-container"></div>
            <div class="mobile-controls-actions">
                <button class="mobile-key" data-key="SPACE">Space</button>
                <button class="mobile-key" data-key="ENTER">Enter</button>
            </div>
        </div>
    `;
    
    // Initialize joystick
    const joystickContainer = document.querySelector('.joystick-container');
    if (joystickContainer) {
        joystickInstance = new VirtualJoystick(joystickContainer);
    }
    
    // Re-add event listeners for action buttons
    addActionButtonListeners();
}

function removeJoystick() {
    if (joystickInstance) {
        joystickInstance.destroy();
        joystickInstance = null;
    }
    
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.classList.remove('joystick-active');
        // Restore original mobile controls layout
        restoreOriginalMobileControls();
    }
}

function addActionButtonListeners() {
    document.querySelectorAll('.mobile-key').forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
            const key = btn.getAttribute('data-key');
            let code;
            if (key === 'SPACE') code = 32;
            else if (key === 'ENTER') code = 13;
            else code = key.charCodeAt(0);
            
            const evt = new KeyboardEvent('keydown', { 
                key: key === 'SPACE' ? ' ' : (key === 'ENTER' ? 'Enter' : key), 
                keyCode: code, 
                which: code 
            });
            window.dispatchEvent(evt);
            btn.classList.add('active');
            e.preventDefault();
        });
        
        btn.addEventListener('touchend', function(e) {
            const key = btn.getAttribute('data-key');
            let code;
            if (key === 'SPACE') code = 32;
            else if (key === 'ENTER') code = 13;
            else code = key.charCodeAt(0);
            
            const evt = new KeyboardEvent('keyup', { 
                key: key === 'SPACE' ? ' ' : (key === 'ENTER' ? 'Enter' : key), 
                keyCode: code, 
                which: code 
            });
            window.dispatchEvent(evt);
            btn.classList.remove('active');
            e.preventDefault();
        });
    });
}

function restoreOriginalMobileControls() {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;
    
    mobileControls.innerHTML = `
        <div class="mobile-controls-left">
            <div class="mobile-controls-row">
                <button class="mobile-key" data-key="W" aria-label="Up">&#8593;</button>
            </div>
            <div class="mobile-controls-row">
                <button class="mobile-key" data-key="A" aria-label="Left">&#8592;</button>
                <button class="mobile-key" data-key="S" aria-label="Down">&#8595;</button>
                <button class="mobile-key" data-key="D" aria-label="Right">&#8594;</button>
            </div>
        </div>
        <div class="mobile-controls-right">
            <button class="mobile-key" data-key="SPACE">Space</button>
            <button class="mobile-key" data-key="ENTER">Enter</button>
        </div>
    `;
    
    // Re-add the original event listeners
    addActionButtonListeners();
}
