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
        this.touchId = null; // Track specific touch for this joystick
        
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
        
        // Touch events - only listen on the joystick container to avoid conflicts
        this.base.addEventListener('touchstart', this.onStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onEnd.bind(this));
        document.addEventListener('touchcancel', this.onEnd.bind(this));
    }
    
    onStart(event) {
        // For touch events, only handle if no other touch is being tracked
        if (event.type.includes('touch')) {
            if (this.touchId !== null) return; // Already tracking a touch
            const touch = event.touches[0];
            if (!touch) return;
            this.touchId = touch.identifier;
        }
        
        event.preventDefault();
        event.stopPropagation(); // Prevent event from bubbling to other controls
        this.isDragging = true;
        this.knob.classList.add('dragging');
        
        // Capture pointer for better tracking
        if (event.type === 'mousedown') {
            this.knob.setPointerCapture?.(event.pointerId);
        }
    }
    
    onMove(event) {
        if (!this.isDragging) return;
        
        // For touch events, only handle the specific touch we're tracking
        if (event.type.includes('touch')) {
            const touch = Array.from(event.touches).find(t => t.identifier === this.touchId);
            if (!touch) return;
        }
        
        event.preventDefault();
        
        const rect = this.base.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if (event.type.includes('touch')) {
            const touch = Array.from(event.touches).find(t => t.identifier === this.touchId);
            if (!touch) return;
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
        // For touch events, only handle if it's our tracked touch
        if (event.type.includes('touch')) {
            const touch = Array.from(event.changedTouches || []).find(t => t.identifier === this.touchId);
            if (!touch && this.touchId !== null) return;
            this.touchId = null; // Clear the touch tracking
        }
        
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
        // Convert from center-based coordinates to transform translate
        // Center is at (60, 60) for a 120px joystick
        const offsetX = x - this.center.x;
        const offsetY = y - this.center.y;
        this.knob.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    }
    
    updateDirection(deltaX, deltaY) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedDistance = distance / this.maxDistance;
        
        // Release all keys first
        this.releaseAllKeys();
        
        // Check if we're outside the dead zone
        if (normalizedDistance > this.deadZone) {
            // Calculate 8-directional movement based on normalized deltas
            const directions = this.calculateDirections(deltaX, deltaY);
            
            if (directions.length > 0) {
                this.currentDirection = directions.join('+');
                // Send appropriate key events for all active directions
                this.sendDirectionKeys(directions);
            }
        } else {
            this.currentDirection = null;
        }
    }
    
    calculateDirections(deltaX, deltaY) {
        const directions = [];
        const threshold = 0.3; // Sensitivity for diagonal movement (30% of max displacement)
        
        // Normalize the deltas to get direction strength
        const maxDistance = this.maxDistance;
        const normalizedX = deltaX / maxDistance;
        const normalizedY = deltaY / maxDistance;
        
        // Check vertical directions (Y-axis)
        // Negative Y is up (screen coordinates), positive Y is down
        if (normalizedY < -threshold) {
            directions.push('up'); // W key
        } else if (normalizedY > threshold) {
            directions.push('down'); // S key
        }
        
        // Check horizontal directions (X-axis)
        // Negative X is left, positive X is right
        if (normalizedX < -threshold) {
            directions.push('left'); // A key
        } else if (normalizedX > threshold) {
            directions.push('right'); // D key
        }
        
        // This creates 8-directional movement:
        // Pure directions: up, down, left, right
        // Diagonal directions: up+left (W+A), up+right (W+D), down+left (S+A), down+right (S+D)
        
        return directions;
    }
    
    sendDirectionKeys(directions) {
        const keyMap = {
            'up': 'W',
            'down': 'S',
            'left': 'A',
            'right': 'D'
        };
        
        // Send keydown events for all active directions
        directions.forEach(direction => {
            if (keyMap[direction]) {
                this.sendKeyEvent('keydown', keyMap[direction]);
                this.activeKeys.add(keyMap[direction]);
            }
        });
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
            // Stop propagation to prevent interference with joystick
            e.stopPropagation();
            
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
        }, { passive: false });
        
        btn.addEventListener('touchend', function(e) {
            // Stop propagation to prevent interference with joystick
            e.stopPropagation();
            
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
        }, { passive: false });
        
        // Also handle touchcancel to ensure button state is cleared
        btn.addEventListener('touchcancel', function(e) {
            e.stopPropagation();
            btn.classList.remove('active');
            
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
        }, { passive: false });
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
