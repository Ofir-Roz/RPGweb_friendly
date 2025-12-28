/**
 * Virtual Joystick for Mobile Devices
 * Converts touch input to keyboard events (W, A, S, D)
 */

class VirtualJoystick {
    constructor(container) {
        this.container = container;
        this.knob = null;
        this.base = null;
        this.isDragging = false;
        this.currentDirection = null;
        this.deadZone = 0.2;
        this.maxDistance = 35;
        this.touchId = null;
        this.center = { x: 60, y: 60 };
        this.currentPos = { x: this.center.x, y: this.center.y };
        this.activeKeys = new Set();
        this.init();
    }
    
    init() {
        this.base = document.createElement('div');
        this.base.className = 'joystick-base';
        this.knob = document.createElement('div');
        this.knob.className = 'joystick-knob';
        this.base.appendChild(this.knob);
        this.container.appendChild(this.base);
        this.addEventListeners();
        this.updateKnobPosition(this.center.x, this.center.y);
    }
    
    addEventListeners() {
        this.knob.addEventListener('mousedown', this.onStart.bind(this));
        document.addEventListener('mousemove', this.onMove.bind(this));
        document.addEventListener('mouseup', this.onEnd.bind(this));
        this.base.addEventListener('touchstart', this.onStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onEnd.bind(this));
        document.addEventListener('touchcancel', this.onEnd.bind(this));
    }
    
    onStart(event) {
        if (event.type.includes('touch')) {
            if (this.touchId !== null) return;
            const touch = event.touches[0];
            if (!touch) return;
            this.touchId = touch.identifier;
        }
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
        this.knob.classList.add('dragging');
        if (event.type === 'mousedown') {
            this.knob.setPointerCapture?.(event.pointerId);
        }
    }
    
    onMove(event) {
        if (!this.isDragging) return;
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
        let constrainedX = deltaX;
        let constrainedY = deltaY;
        if (distance > this.maxDistance) {
            const ratio = this.maxDistance / distance;
            constrainedX = deltaX * ratio;
            constrainedY = deltaY * ratio;
        }
        const knobX = this.center.x + constrainedX;
        const knobY = this.center.y + constrainedY;
        this.updateKnobPosition(knobX, knobY);
        this.updateDirection(constrainedX, constrainedY);
    }
    
    onEnd(event) {
        if (event.type.includes('touch')) {
            const touch = Array.from(event.changedTouches || []).find(t => t.identifier === this.touchId);
            if (!touch && this.touchId !== null) return;
            this.touchId = null;
        }
        if (!this.isDragging) return;
        this.isDragging = false;
        this.knob.classList.remove('dragging');
        this.updateKnobPosition(this.center.x, this.center.y);
        this.releaseAllKeys();
        this.currentDirection = null;
    }
    
    updateKnobPosition(x, y) {
        this.currentPos = { x, y };
        const offsetX = x - this.center.x;
        const offsetY = y - this.center.y;
        this.knob.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    }
    
    updateDirection(deltaX, deltaY) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedDistance = distance / this.maxDistance;
        this.releaseAllKeys();
        if (normalizedDistance > this.deadZone) {
            const directions = this.calculateDirections(deltaX, deltaY);
            if (directions.length > 0) {
                this.currentDirection = directions.join('+');
                this.sendDirectionKeys(directions);
            }
        } else {
            this.currentDirection = null;
        }
    }
    
    calculateDirections(deltaX, deltaY) {
        const directions = [];
        const threshold = 0.3;
        const normalizedX = deltaX / this.maxDistance;
        const normalizedY = deltaY / this.maxDistance;
        if (normalizedY < -threshold) directions.push('up');
        else if (normalizedY > threshold) directions.push('down');
        if (normalizedX < -threshold) directions.push('left');
        else if (normalizedX > threshold) directions.push('right');
        return directions;
    }
    
    sendDirectionKeys(directions) {
        const keyMap = { 'up': 'W', 'down': 'S', 'left': 'A', 'right': 'D' };
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
        window.dispatchEvent(event);
    }
    
    destroy() {
        this.releaseAllKeys();
        if (this.container && this.base) {
            this.container.removeChild(this.base);
        }
    }
}

// =====================================================================

document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 600) {
        initializeJoystick();
    }
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
    mobileControls.classList.add('joystick-active');
    mobileControls.innerHTML = `
        <div class="mobile-controls-with-joystick">
            <div class="joystick-container"></div>
            <div class="mobile-controls-actions">
                <button class="mobile-key" data-key="SPACE">Space</button>
                <button class="mobile-key" data-key="ENTER">Enter</button>
            </div>
        </div>
    `;
    const joystickContainer = document.querySelector('.joystick-container');
    if (joystickContainer) {
        joystickInstance = new VirtualJoystick(joystickContainer);
    }
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
        restoreOriginalMobileControls();
    }
}

function addActionButtonListeners() {
    document.querySelectorAll('.mobile-key').forEach(btn => {
        btn.addEventListener('touchstart', e => {
            e.stopPropagation();
            const key = btn.getAttribute('data-key');
            const code = key === 'SPACE' ? 32 : (key === 'ENTER' ? 13 : key.charCodeAt(0));
            const keyValue = key === 'SPACE' ? ' ' : (key === 'ENTER' ? 'Enter' : key);
            const evt = new KeyboardEvent('keydown', { key: keyValue, keyCode: code, which: code });
            window.dispatchEvent(evt);
            btn.classList.add('active');
            e.preventDefault();
        }, { passive: false });
        
        btn.addEventListener('touchend', e => {
            e.stopPropagation();
            const key = btn.getAttribute('data-key');
            const code = key === 'SPACE' ? 32 : (key === 'ENTER' ? 13 : key.charCodeAt(0));
            const keyValue = key === 'SPACE' ? ' ' : (key === 'ENTER' ? 'Enter' : key);
            const evt = new KeyboardEvent('keyup', { key: keyValue, keyCode: code, which: code });
            window.dispatchEvent(evt);
            btn.classList.remove('active');
            e.preventDefault();
        }, { passive: false });
        
        btn.addEventListener('touchcancel', e => {
            e.stopPropagation();
            btn.classList.remove('active');
            const key = btn.getAttribute('data-key');
            const code = key === 'SPACE' ? 32 : (key === 'ENTER' ? 13 : key.charCodeAt(0));
            const keyValue = key === 'SPACE' ? ' ' : (key === 'ENTER' ? 'Enter' : key);
            const evt = new KeyboardEvent('keyup', { key: keyValue, keyCode: code, which: code });
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
    addActionButtonListeners();
}
