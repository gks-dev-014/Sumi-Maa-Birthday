const drawCanvas = document.getElementById('draw-canvas');
const drawCtx = drawCanvas.getContext('2d');

const flowerCanvas = document.getElementById('flower-canvas');
const flowerCtx = flowerCanvas.getContext('2d');

let isDrawing = false;
let drawnPointsCount = 0;
const pointsRequiredForCompletion = 90; 

let flowers = [];
let mouse = { x: null, y: null, lastX: null, lastY: null, vx: 0, vy: 0, active: false };

// ==========================================================================
// Flower Particle Class Definition Engine
// ==========================================================================
class BackgroundFlower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 12 + 10; 
        this.petalCount = Math.floor(Math.random() * 2) + 5; 
        this.color = this.getRandomFlowerColor();
        this.centerColor = '#fbc4b6';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.opacity = Math.random() * 0.4 + 0.4; 
        this.baseOpacity = this.opacity;
        this.isFlownAway = false;
    }

    getRandomFlowerColor() {
        const colors = ['#ffb7c5', '#ffa6c9', '#ffc0cb', '#ffe4e1'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        if (this.opacity <= 0) return;
        flowerCtx.save();
        flowerCtx.globalAlpha = this.opacity;
        flowerCtx.translate(this.x, this.y);
        flowerCtx.rotate(this.rotation);

        for (let i = 0; i < this.petalCount; i++) {
            flowerCtx.rotate((Math.PI * 2) / this.petalCount);
            flowerCtx.beginPath();
            flowerCtx.fillStyle = this.color;
            flowerCtx.moveTo(0, 0);
            flowerCtx.bezierCurveTo(-this.size/2, -this.size, this.size/2, -this.size, 0, 0);
            flowerCtx.fill();
        }

        flowerCtx.beginPath();
        flowerCtx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
        flowerCtx.fillStyle = this.centerColor;
        flowerCtx.fill();
        flowerCtx.restore();
    }

    update() {
        this.rotation += this.rotationSpeed;
        
        if (mouse.active) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 100; 

            if (distance < forceRadius) {
                this.isFlownAway = true;
                const angle = Math.atan2(dy, dx);
                const pushForce = (forceRadius - distance) / forceRadius;
                this.vx += Math.cos(angle) * pushForce * 6 + mouse.vx * 0.3;
                this.vy += Math.sin(angle) * pushForce * 6 + mouse.vy * 0.3;
            }
        }

        if (this.isFlownAway) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.95;
            this.vy *= 0.95;
            this.opacity -= 0.008;
            if (this.opacity <= 0) {
                this.x = Math.random() * flowerCanvas.width;
                this.y = Math.random() * flowerCanvas.height;
                this.vx = 0;
                this.vy = 0;
                this.opacity = this.baseOpacity;
                this.isFlownAway = false;
            }
        }
    }
}

function initFlowers() {
    flowers = [];
    const spacing = 45; 
    for (let x = 0; x < flowerCanvas.width; x += spacing) {
        for (let y = 0; y < flowerCanvas.height; y += spacing) {
            flowers.push(new BackgroundFlower(x + (Math.random()-0.5)*20, y + (Math.random()-0.5)*20));
        }
    }
}

function animateFlowers() {
    flowerCtx.clearRect(0, 0, flowerCanvas.width, flowerCanvas.height);

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

    requestAnimationFrame(animateFlowers);
}

function setupCanvasBounds() {
    const rect = drawCanvas.parentNode.getBoundingClientRect();
    drawCanvas.width = rect.width;
    drawCanvas.height = rect.height;
    
    drawCtx.strokeStyle = '#56250d'; 
    drawCtx.lineWidth = 5;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';

    flowerCanvas.width = window.innerWidth;
    flowerCanvas.height = window.innerHeight;
    initFlowers();
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const rect = drawCanvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    drawCtx.lineTo(x, y);
    drawCtx.stroke();
    
    drawnPointsCount++;
    if (drawnPointsCount > pointsRequiredForCompletion) {
        endDrawingSequence();
    }
}

function startDrawing(e) {
    isDrawing = true;
    drawCtx.beginPath();
    const rect = drawCanvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    drawCtx.moveTo(x, y);
}

function stopDrawing() { isDrawing = false; }

drawCanvas.addEventListener('mousedown', startAction => {
    // When drawing on the hand, capture coordinate inputs explicitly
    mouse.x = startAction.clientX;
    mouse.y = startAction.clientY;
    mouse.active = true;
    startDrawing(startAction);
});
drawCanvas.addEventListener('mousemove', (e) => {
    if(isDrawing) { mouse.x = e.clientX; mouse.y = e.clientY; }
    draw(e);
});
drawCanvas.addEventListener('mouseup', () => { stopDrawing(); mouse.active = false; });

drawCanvas.addEventListener('touchstart', startAction => { 
    const t = startAction.touches[0];
    mouse.x = t.clientX; mouse.y = t.clientY; mouse.active = true;
    startDrawing(startAction); 
    draw(startAction); 
});
drawCanvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    mouse.x = t.clientX; mouse.y = t.clientY;
    draw(e);
});
drawCanvas.addEventListener('touchend', () => { stopDrawing(); mouse.active = false; });

function endDrawingSequence() {
    stopDrawing();
    drawCanvas.style.pointerEvents = 'none';
    mouse.active = false;
    
    setTimeout(() => {
        document.getElementById('drawing-view').classList.add('hidden-layer');
        document.getElementById('content-view').classList.remove('hidden-layer');
        processStoryParagraph('story-para-1', '❤️');
    }, 800);
}

function processStoryParagraph(targetParagraphId, specialSymbol) {
    const container = document.getElementById(targetParagraphId);
    const textString = container.innerText;
    container.innerHTML = ''; 
    
    const elementsArray = textString.split(' ');
    
    elementsArray.forEach(chunk => {
        const span = document.createElement('span');
        if (chunk.includes(specialSymbol)) {
            span.innerText = chunk;
            span.classList.add('interactive-symbol');
            span.addEventListener('mouseover', () => executeSymbolPopupEffect(specialSymbol));
            span.addEventListener('touchstart', () => executeSymbolPopupEffect(specialSymbol));
        } else {
            span.innerText = chunk + ' ';
            span.classList.add('interactive-word');
            span.addEventListener('mouseover', () => span.classList.add('active-touch'));
            span.addEventListener('mouseout', () => span.classList.remove('active-touch'));
        }
        container.appendChild(span);
    });
}

function trackGlobalInputCoordinates(e) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX && clientY) {
        mouse.x = clientX;
        mouse.y = clientY;
        mouse.active = true;
        
        const itemUnderTouch = document.elementFromPoint(clientX, clientY);
        if (itemUnderTouch && itemUnderTouch.classList.contains('interactive-word')) {
            document.querySelectorAll('.interactive-word').forEach(w => w.classList.remove('active-touch'));
            itemUnderTouch.classList.add('active-touch');
        }
        if (itemUnderTouch && itemUnderTouch.classList.contains('interactive-symbol')) {
            const matchingSymbol = itemUnderTouch.innerText.includes('❤️') ? '❤️' : '🎤';
            executeSymbolPopupEffect(matchingSymbol);
        }
    }
}

const contentView = document.getElementById('content-view');
contentView.addEventListener('mousemove', trackGlobalInputCoordinates);
contentView.addEventListener('touchmove', trackGlobalInputCoordinates);

const stopGlobalTracking = () => {
    mouse.active = false; mouse.vx = 0; mouse.vy = 0; mouse.lastX = null; mouse.lastY = null;
    document.querySelectorAll('.interactive-word').forEach(w => w.classList.remove('active-touch'));
};
contentView.addEventListener('mouseup', stopGlobalTracking);
contentView.addEventListener('touchend', stopGlobalTracking);

function executeSymbolPopupEffect(symbolToken) {
    if (systemLock) return;
    systemLock = true;
    let targetOverlay;
    
    if (symbolToken === '❤️') {
        targetOverlay = document.getElementById('heart-popup-overlay');
        targetOverlay.classList.remove('hidden-element');
        setTimeout(() => targetOverlay.classList.add('show'), 10);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);

        setTimeout(() => {
            targetOverlay.classList.remove('show');
            setTimeout(() => {
                targetOverlay.classList.add('hidden-element');
                systemLock = false;
                morphToMusicTheme(); 
            }, 300);
        }, 2000); 
        
    } else if (symbolToken === '🎤') {
        targetOverlay = document.getElementById('mic-popup-overlay');
        targetOverlay.classList.remove('hidden-element');
        setTimeout(() => targetOverlay.classList.add('show'), 10);
        
        const audio = document.getElementById('sargam-audio');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(err => console.log("Audio lock: ", err));
        }

        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100, 50, 400]);

        setTimeout(() => {
            targetOverlay.classList.remove('show');
            if (audio) {
                const fadeInterval = setInterval(() => {
                    if (audio.volume > 0.1) audio.volume -= 0.1;
                    else { audio.pause(); audio.volume = 1.0; clearInterval(fadeInterval); }
                }, 30);
            }
            setTimeout(() => {
                targetOverlay.classList.add('hidden-element');
                systemLock = false;
                window.location.href = 'wishes.html';
            }, 300);
        }, 3000); 
    }
}

function morphToMusicTheme() {
    const memoryCardNode = document.getElementById('memory-card');
    const backgroundOverlayNode = document.getElementById('dynamic-bg');

    backgroundOverlayNode.classList.remove('style-mehndi');
    backgroundOverlayNode.classList.add('style-music');

    memoryCardNode.classList.remove('box-mehndi');
    memoryCardNode.classList.add('box-music');

    document.getElementById('story-para-1').classList.add('hidden-element');
    const paragraphTwo = document.getElementById('story-para-2');
    paragraphTwo.classList.remove('hidden-element');

    processStoryParagraph('story-para-2', '🎤');
}

window.addEventListener('resize', setupCanvasBounds);
window.addEventListener('DOMContentLoaded', () => {
    setupCanvasBounds();
    animateFlowers(); 
});