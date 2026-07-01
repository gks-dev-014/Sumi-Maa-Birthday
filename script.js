const canvas = document.getElementById('flower-canvas');
const ctx = canvas.getContext('2d');

let flowers = [];
let mouse = { x: null, y: null, lastX: null, lastY: null, vx: 0, vy: 0, active: false };
let isTransitioningOut = false; // Prevents double triggers during page swap

class RealisticFlower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 15 + 15; 
        this.petalCount = Math.floor(Math.random() * 2) + 5; 
        this.color = this.getRandomFlowerColor();
        this.centerColor = '#fbc4b6';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = 1;
        this.isFlownAway = false;
    }

    getRandomFlowerColor() {
        const colors = ['#ffb7c5', '#ffa6c9', '#ffc0cb', '#ffe4e1'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        for (let i = 0; i < this.petalCount; i++) {
            ctx.rotate((Math.PI * 2) / this.petalCount);
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-this.size/2, -this.size, this.size/2, -this.size, 0, 0);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.centerColor;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.rotation += this.rotationSpeed;
        if (mouse.active) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 120; 

            if (distance < forceRadius) {
                this.isFlownAway = true;
                const angle = Math.atan2(dy, dx);
                const pushForce = (forceRadius - distance) / forceRadius;
                this.vx += Math.cos(angle) * pushForce * 8 + mouse.vx * 0.4;
                this.vy += Math.sin(angle) * pushForce * 8 + mouse.vy * 0.4;
                this.rotationSpeed = (Math.random() - 0.5) * 0.3;
            }
        }

        if (this.isFlownAway) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.94;
            this.vy *= 0.94;
            this.opacity -= 0.015;
        }
    }
}

function initFlowers() {
    flowers = [];
    const spacing = 18; 
    for (let x = -20; x < canvas.width + 20; x += spacing) {
        for (let y = -20; y < canvas.height + 20; y += spacing) {
            const posX = x + (Math.random() - 0.5) * 15;
            const posY = y + (Math.random() - 0.5) * 15;
            flowers.push(new RealisticFlower(posX, posY));
        }
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initFlowers();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mouse.lastX !== null && mouse.lastY !== null) {
        mouse.vx = mouse.x - mouse.lastX;
        mouse.vy = mouse.y - mouse.lastY;
    }
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;

    flowers.forEach(flower => {
        flower.update();
        flower.draw();
    });

    if (isTransitioningOut) {
        requestAnimationFrame(animate);
        return;
    }

    let activeCount = 0;
    flowers.forEach(f => { if (!f.isFlownAway) activeCount++; });
    const clearedPercent = ((flowers.length - activeCount) / flowers.length) * 100;
    
    if (clearedPercent > 95) {
        canvas.style.transition = 'opacity 1s ease';
        canvas.style.opacity = '0';
        setTimeout(() => { if(!isTransitioningOut) canvas.remove(); }, 1000);
        return; 
    }

    requestAnimationFrame(animate);
}

function updateMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if(clientX && clientY) {
        mouse.x = clientX - rect.left;
        mouse.y = clientY - rect.top;
        checkTextUnderPointer(clientX, clientY);
    }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    animate();
});

const startAction = (e) => { mouse.active = true; updateMousePos(e); mouse.lastX = mouse.x; mouse.lastY = mouse.y; };
const stopAction = () => { 
    mouse.active = false; mouse.vx = 0; mouse.vy = 0; mouse.lastX = null; mouse.lastY = null;
    document.querySelectorAll('.interactive-word').forEach(w => w.classList.remove('active-touch'));
};

canvas.addEventListener('mousedown', startAction);
canvas.addEventListener('mousemove', updateMousePos);
canvas.addEventListener('mouseup', stopAction);
canvas.addEventListener('mouseleave', stopAction);

canvas.addEventListener('touchstart', startAction);
canvas.addEventListener('touchmove', updateMousePos);
canvas.addEventListener('touchend', stopAction);

// ==========================================================================
// Paragraph Word Processing
// ==========================================================================
const storyContainer = document.getElementById('interactive-story');
const rawText = storyContainer.innerText;
storyContainer.innerHTML = ''; 

const wordsArray = rawText.split(' ');

wordsArray.forEach(word => {
    const span = document.createElement('span');
    
    if (word.includes('🤭') || word.includes('😊')) {
        span.innerText = word;
        span.classList.add('interactive-emoji');
    } else {
        span.innerText = word + ' ';
        span.classList.add('interactive-word');
        
        // DIRECT COUPLING APPROACH: If it's the target ending word, give it explicit hardware tracking listeners
        if (word.toLowerCase().includes('breath')) {
            span.classList.add('terminal-trigger-word');
            
            // Hard wire listeners directly onto the word block to guarantee it triggers immediately on pass
            span.addEventListener('mouseover', () => {
                if (isElementUncovered(span)) triggerFlowerStormTransition();
            });
            span.addEventListener('touchstart', () => {
                if (isElementUncovered(span)) triggerFlowerStormTransition();
            });
        }
    }
    storyContainer.appendChild(span);
});

function checkTextUnderPointer(screenX, screenY) {
    if (isTransitioningOut) return;
    
    canvas.style.pointerEvents = 'none';
    const elementUnderFinger = document.elementFromPoint(screenX, screenY);
    canvas.style.pointerEvents = 'auto';
    
    document.querySelectorAll('.interactive-word').forEach(w => w.classList.remove('active-touch'));
    
    if (elementUnderFinger && isElementUncovered(elementUnderFinger)) {
        if (elementUnderFinger.classList.contains('interactive-word')) {
            elementUnderFinger.classList.add('active-touch');
            
            // Mobile drag coordinate intersection fallback check
            if (elementUnderFinger.classList.contains('terminal-trigger-word')) {
                triggerFlowerStormTransition();
            }
        } else if (elementUnderFinger.classList.contains('interactive-emoji')) {
            triggerGiantEmojiEffect();
        }
    }
}

function isElementUncovered(element) {
    const rect = element.getBoundingClientRect();
    const elementX = rect.left + rect.width / 2;
    const elementY = rect.top + rect.height / 2;

    for (let i = 0; i < flowers.length; i++) {
        const flower = flowers[i];
        if (!flower.isFlownAway && flower.opacity > 0.3) {
            const dx = flower.x - elementX;
            const dy = flower.y - elementY;
            if (Math.sqrt(dx * dx + dy * dy) < 25) return false; 
        }
    }
    return true; 
}

function triggerFlowerStormTransition() {
    if (isTransitioningOut) return;
    isTransitioningOut = true;
    
    // Smoothly bring back canvas overlay tracking transparency layer properties
    canvas.style.transition = 'opacity 0.4s ease';
    canvas.style.opacity = '1';
    
    // Bring back the solid flower cloud blanket
    initFlowers();
    
    // Take her to page 2 automatically
    setTimeout(() => {
        window.location.href = 'memories.html';
    }, 1500);
}

let effectCooldown = false;
function triggerGiantEmojiEffect() {
    if (effectCooldown || isTransitioningOut) return;
    effectCooldown = true;

    const overlay = document.getElementById('emoji-popup-overlay');
    overlay.classList.remove('hidden-element');
    setTimeout(() => overlay.classList.add('show'), 10);

    if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 400]);

    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.classList.add('hidden-element');
            effectCooldown = false;
        }, 300);
    }, 2000); 
}