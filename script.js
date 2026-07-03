const bgCanvas = document.getElementById('bg-cloud-canvas');
const bgCtx = bgCanvas.getContext('2d');
const fgCanvas = document.getElementById('fg-cloud-canvas');
const fgCtx = fgCanvas.getContext('2d');

const drawCanvas = document.getElementById('draw-canvas');
const drawCtx = drawCanvas.getContext('2d');

let fgClouds = []; 
let bgClouds = []; 
let shootingStars = []; 
let mouse = { x: null, y: null, lastX: null, lastY: null, vx: 0, vy: 0, active: false };

let currentGlobalClearance = 0;
let isTransitioningOut = false;
let isEntranceSequenceActive = false;
let activePageContext = 1; 
let isDrawingMode = false;
let isDrawingStrokeActive = false; 
let systemLock = false;

let drawnHeartPoints = [];

// Gentle, Super-Slow 2D Bounding Box Floating Moon Engine
let cosmicMoon = {
    x: 0, y: 0, radius: 65, vx: 0.03, vy: 0.015, 
    init() { this.x = bgCanvas.width * 0.5; this.y = bgCanvas.height * 0.25; this.vx = 0.03; this.vy = 0.015; },
    draw() {
        bgCtx.save();
        let glowGradient = bgCtx.createRadialGradient(this.x, this.y, this.radius * 0.05, this.x, this.y, this.radius * 2.2);
        glowGradient.addColorStop(0, '#fffdf0'); glowGradient.addColorStop(0.2, '#fffcf0');
        glowGradient.addColorStop(0.4, 'rgba(255, 244, 204, 0.2)'); glowGradient.addColorStop(1, 'rgba(255, 254, 240, 0)');
        bgCtx.fillStyle = glowGradient; bgCtx.beginPath(); bgCtx.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2); bgCtx.fill();
        bgCtx.fillStyle = '#fffdf0'; bgCtx.beginPath(); bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); bgCtx.fill(); bgCtx.restore();
    },
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x - this.radius <= 10) { this.x = this.radius + 10; this.vx *= -1; } 
        else if (this.x + this.radius >= bgCanvas.width - 10) { this.x = bgCanvas.width - this.radius - 10; this.vx *= -1; }
        if (this.y - this.radius <= 10) { this.y = this.radius + 10; this.vy *= -1; } 
        else if (this.y + this.radius >= bgCanvas.height * 0.5) { this.y = bgCanvas.height * 0.5 - this.radius; this.vy *= -1; }
    }
};

function switchAppScene(targetSceneNumber) {
    activePageContext = targetSceneNumber;
    document.querySelectorAll('.view-screen').forEach(sec => sec.classList.add('hidden-layer', 'display-none'));

    if (targetSceneNumber === 2) {
        fgCanvas.style.zIndex = "1"; fgCanvas.style.opacity = "0"; fgClouds = []; 
        const drawView = document.getElementById('view-section-2');
        drawView.classList.remove('display-none');
        setTimeout(() => drawView.classList.remove('hidden-layer'), 50);
        setupDrawingCanvas();
    } 
    else if (targetSceneNumber === 3) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1"; initSparseAmbientFlowers();
        const memoriesView = document.getElementById('view-section-3');
        memoriesView.classList.remove('display-none');
        setTimeout(() => memoriesView.classList.remove('hidden-layer'), 50);
        parseTextParagraphIntoSpans('mehndi-story');
    }
    else if (targetSceneNumber === 4) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1"; initSparseAmbientFlowers();
        const galleryView = document.getElementById('view-section-4');
        galleryView.classList.remove('display-none');
        setTimeout(() => galleryView.classList.remove('hidden-layer'), 50);
        setTimeout(() => { if (activePageContext === 4) switchAppScene(5); }, 5000);
    }
    else if (targetSceneNumber === 5) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1"; initSparseAmbientFlowers();
        const musicView = document.getElementById('view-section-5');
        musicView.classList.remove('display-none');
        setTimeout(() => musicView.classList.remove('hidden-layer'), 50);
        parseTextParagraphIntoSpans('music-story');
    }
    else if (targetSceneNumber === 6) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1"; initSparseAmbientFlowers();
        const cookingView = document.getElementById('view-section-6');
        cookingView.classList.remove('display-none');
        setTimeout(() => cookingView.classList.remove('hidden-layer'), 50);
        parseTextParagraphIntoSpans('cooking-story');
    }
    else if (targetSceneNumber === 7) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1"; initSparseAmbientFlowers();
        const foodGridView = document.getElementById('view-section-7');
        foodGridView.classList.remove('display-none');
        setTimeout(() => foodGridView.classList.remove('hidden-layer'), 50);
        setTimeout(() => { if (activePageContext === 7) switchAppScene(8); }, 5000);
    }
    else if (targetSceneNumber === 8) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1"; initSparseAmbientFlowers();
        const timeView = document.getElementById('view-section-8');
        timeView.classList.remove('display-none');
        setTimeout(() => timeView.classList.remove('hidden-layer'), 50);
        parseTextParagraphIntoSpans('time-story', 'great.');
    }
    else if (targetSceneNumber === 9) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1"; initSparseAmbientFlowers();
        const timeGridView = document.getElementById('view-section-9');
        timeGridView.classList.remove('display-none');
        setTimeout(() => timeGridView.classList.remove('hidden-layer'), 50);
        setTimeout(() => { if (activePageContext === 9) switchAppScene(10); }, 5000);
    }
    else if (targetSceneNumber === 10) {
        fgCanvas.style.zIndex = "1"; fgCanvas.style.opacity = "0"; fgClouds = [];
        const videoTheaterView = document.getElementById('view-section-10');
        videoTheaterView.classList.remove('display-none');
        setTimeout(() => videoTheaterView.classList.remove('hidden-layer'), 50);
        setupVideoPlayerPlaylistControls();
    }
    else if (targetSceneNumber === 11) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1"; initSparseAmbientFlowers();
        const appreciationView = document.getElementById('view-section-11');
        appreciationView.classList.remove('display-none');
        setTimeout(() => appreciationView.classList.remove('hidden-layer'), 50);
        parseTextParagraphIntoSpans('appreciation-story', 'forever');
    }
    else if (targetSceneNumber === 12) {
        fgCanvas.style.zIndex = "12"; fgCanvas.style.opacity = "1";
        initBirthdayFlowerCurtain(); 
        currentGlobalClearance = 0;
        const birthdayRevealView = document.getElementById('view-section-12');
        birthdayRevealView.classList.remove('display-none');
        setTimeout(() => birthdayRevealView.classList.remove('hidden-layer'), 50);
    }
}

function setupVideoPlayerPlaylistControls() {
    const player = document.getElementById('custom-theater-stream');
    const buttons = document.querySelectorAll('.playlist-btn');
    const nextBtn = document.getElementById('video-next-trigger');
    if(!player) return;

    if (nextBtn) {
        nextBtn.onclick = () => { player.pause(); switchAppScene(11); };
        nextBtn.ontouchstart = (e) => { e.stopPropagation(); player.pause(); switchAppScene(11); };
    }

    buttons.forEach(btn => {
        const loadTrack = () => { buttons.forEach(b => b.classList.remove('active-track')); btn.classList.add('active-track'); player.src = btn.getAttribute('data-src'); player.load(); player.play().catch(() => {}); };
        btn.onclick = loadTrack; btn.ontouchstart = (e) => { e.stopPropagation(); loadTrack(); };
    });
}

// ==========================================================================
// Cloud Architecture Framework Models
// ==========================================================================
class ImmersiveCloudNode {
    constructor(x, y, customVy = 0, isAmbient = false) {
        this.x = x; this.y = y; this.isAmbient = isAmbient; this.isFlownAway = customVy > 0;
        this.zFactor = isAmbient ? (Math.random() * 0.4 + 0.3) : Math.random() * 0.7 + 0.3; 
        this.vx = isAmbient ? (Math.random() * 0.22 + 0.18) : (Math.random() - 0.5) * 0.4 * (this.zFactor * 1.5);
        this.vy = customVy * (this.zFactor * 1.2); 
        this.baseSize = isAmbient ? (Math.random() * 60 + 80) : (Math.random() * 55 + 65);
        this.size = this.baseSize * (this.zFactor * 1.8); 
        this.opacity = isAmbient ? (Math.random() * 0.08 + 0.06) : (Math.random() * 0.3 + 0.65) * (1.3 - this.zFactor);
        this.baseOpacity = this.opacity;
    }
    draw(context) {
        if (this.opacity <= 0) return; context.save();
        if (!this.isAmbient && this.zFactor > 0.5) { context.shadowColor = 'rgba(1, 2, 5, 0.85)'; context.shadowBlur = this.size * 0.5; context.shadowOffsetX = this.size * 0.12; context.shadowOffsetY = this.size * 0.18; }
        let gradient = context.createRadialGradient(this.x, this.y, this.size * 0.05, this.x, this.y, this.size);
        if (this.zFactor > 0.7) { gradient.addColorStop(0, `rgba(245, 248, 255, ${this.opacity})`); gradient.addColorStop(0.4, `rgba(215, 225, 245, ${this.opacity * 0.7})`); } 
        else { gradient.addColorStop(0, `rgba(165, 180, 205, ${this.opacity * 0.95})`); gradient.addColorStop(0.4, `rgba(125, 140, 170, ${this.opacity * 0.55})`); }
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient; context.beginPath(); context.arc(this.x, this.y, this.size, 0, Math.PI * 2); context.fill(); context.restore();
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (mouse.active && !isTransitioningOut && !this.isAmbient) {
            const dx = this.x - mouse.x; const dy = this.y - mouse.y; const distance = Math.sqrt(dx * dx + dy * dy); const forceRadius = 150; 
            if (distance < forceRadius) { this.isFlownAway = true; const angle = Math.atan2(dy, dx); const pushForce = (forceRadius - distance) / forceRadius; this.vx += Math.cos(angle) * pushForce * 7 * (this.zFactor * 1.2) + mouse.vx * 0.25; this.vy += Math.sin(angle) * pushForce * 7 * (this.zFactor * 1.2) + mouse.vy * 0.25; }
        }
        if (this.isFlownAway) {
            this.vx *= 0.94; this.vy *= 0.94; this.opacity -= 0.015; 
            if (this.opacity <= 0 || this.y > fgCanvas.height + this.size) {
                if (isEntranceSequenceActive) return; 
                if (this.isAmbient) { this.x = Math.random() * bgCanvas.width; this.y = Math.random() * bgCanvas.height; this.vx = (Math.random() - 0.5) * 0.3; this.vy = 0; this.opacity = this.baseOpacity; this.isFlownAway = false; }
            }
        }
    }
}

// ==========================================================================
// REBUILT: Heavy Interactive Flower Veil Physics (GRAVITY & SETTLING)
// ==========================================================================
class CelestialFlowerBlossom {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.zFactor = Math.random() * 0.5 + 0.5;
        this.size = (Math.random() * 16 + 18) * this.zFactor; 
        this.opacity = 1.0; 
        
        // Stationary baseline speeds
        this.vx = 0;
        this.vy = 0;
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.002; 
        this.hueType = Math.random() > 0.45 ? 'rose' : 'cream';
    }

    draw(context) {
        if (this.opacity <= 0) return;
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.globalAlpha = this.opacity;

        context.shadowColor = 'rgba(25, 2, 6, 0.4)';
        context.shadowBlur = this.size * 0.3;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 2;

        const petals = 5;
        context.beginPath();
        for (let i = 0; i < petals; i++) {
            context.rotate((Math.PI * 2) / petals);
            context.moveTo(0, 0);
            context.bezierCurveTo(-this.size * 0.6, -this.size * 0.4, -this.size * 0.5, -this.size * 1.2, 0, -this.size);
            context.bezierCurveTo(this.size * 0.5, -this.size * 1.2, this.size * 0.6, -this.size * 0.4, 0, 0);
        }

        if (this.hueType === 'rose') {
            let flowerGrad = context.createRadialGradient(0, 0, 0, 0, 0, this.size);
            flowerGrad.addColorStop(0, '#ffe4e6'); 
            flowerGrad.addColorStop(0.4, '#f43f5e'); 
            flowerGrad.addColorStop(1, '#9f1239'); 
            context.fillStyle = flowerGrad;
        } else {
            let flowerGrad = context.createRadialGradient(0, 0, 0, 0, 0, this.size);
            flowerGrad.addColorStop(0, '#ffffff');
            flowerGrad.addColorStop(0.5, '#ffe4e6');
            flowerGrad.addColorStop(1, '#f43f5e');
            context.fillStyle = flowerGrad;
        }
        context.fill();

        context.shadowColor = 'transparent';
        let centerGlow = context.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.25);
        centerGlow.addColorStop(0, '#fcd34d');
        centerGlow.addColorStop(0.6, '#fbbf24');
        centerGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        context.fillStyle = centerGlow;
        context.beginPath();
        context.arc(0, 0, this.size * 0.18, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }

    update() {
        // Apply smooth air friction resistance (dampening vectors)
        this.vx *= 0.96;
        this.vy *= 0.96;
        
        // MODIFIED: Continuous down-pulling gravity vector simulated to represent organic petal weight
        this.vy += 0.12 * this.zFactor;

        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;

        if (mouse.active) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 130;

            if (distance < forceRadius) {
                const angle = Math.atan2(dy, dx);
                const pushForce = (forceRadius - distance) / forceRadius;
                
                // Explode particles outward with robust kinetic impulse velocity rules
                this.vx += Math.cos(angle) * pushForce * 8 * this.zFactor + mouse.vx * 0.15;
                this.vy += Math.sin(angle) * pushForce * 8 * this.zFactor + mouse.vy * 0.15;
                this.rotSpeed += (Math.random() - 0.5) * 0.1 * pushForce;
            }
        }

        // FIXED BOTTOM BOUNDARY SETTLING MATRIX: Flowers stack/settle inside window borders instead of dissolving instantly
        const floorLimit = fgCanvas.height - this.size * 0.5 - 10;
        if (this.y > floorLimit) {
            this.y = floorLimit;
            this.vy *= -0.2; // Soft ground impact bounce absorption
            this.vx *= 0.8;  // Heavy friction drag roll on floor contact
            this.rotSpeed *= 0.8;
        }

        // Horizontal boundary bounce wall reflections
        if (this.x - this.size < 0) {
            this.x = this.size;
            this.vx *= -0.4;
        } else if (this.x + this.size > fgCanvas.width) {
            this.x = fgCanvas.width - this.size;
            this.vx *= -0.4;
        }
    }
}

class CosmicShootingStar {
    constructor() { this.reset(); }
    reset() { this.x = Math.random() * bgCanvas.width * 0.7; this.y = Math.random() * bgCanvas.height * 0.4; this.length = Math.random() * 80 + 60; this.speed = Math.random() * 12 + 10; this.dx = Math.cos(Math.PI / 6) * this.speed; this.dy = Math.sin(Math.PI / 6) * this.speed; this.opacity = 1; this.fadeSpeed = Math.random() * 0.025 + 0.015; this.width = Math.random() * 1.5 + 1; }
    draw() { if (this.opacity <= 0) return; bgCtx.save(); bgCtx.globalAlpha = this.opacity; let starGradient = bgCtx.createLinearGradient(this.x, this.y, this.x - this.length, this.y - this.length * 0.5); starGradient.addColorStop(0, '#ffffff'); starGradient.addColorStop(0.1, 'rgba(255, 244, 214, 1)'); starGradient.addColorStop(0.6, 'rgba(147, 197, 253, 0.4)'); starGradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); bgCtx.strokeStyle = starGradient; bgCtx.lineWidth = this.width; bgCtx.lineCap = 'round'; bgCtx.beginPath(); bgCtx.moveTo(this.x, this.y); bgCtx.lineTo(this.x - this.length, this.y - this.length * 0.5); bgCtx.stroke(); bgCtx.restore(); }
    update() { this.x += this.dx; this.y += this.dy; this.opacity -= this.fadeSpeed; }
}

function initDenseForegroundClouds() { fgClouds = []; const spacing = 28; for (let x = -50; x < fgCanvas.width + 50; x += spacing) { for (let y = -50; y < fgCanvas.height + 50; y += spacing) { fgClouds.push(new ImmersiveCloudNode(x + (Math.random()-0.5)*22, y + (Math.random()-0.5)*22)); } } fgClouds.sort((a, b) => a.zFactor - b.zFactor); }
function initBackgroundAmbientMists() { bgClouds = []; const spacing = 75; for (let x = -60; x < bgCanvas.width + 60; x += spacing) { for (let y = 0; y < bgCanvas.height; y += spacing) { bgClouds.push(new ImmersiveCloudNode(x + (Math.random()-0.5)*35, y + (Math.random()-0.5)*35, 0, true)); } } }
function initSparseAmbientFlowers() { isEntranceSequenceActive = false; fgClouds = []; const spacing = 120; for (let x = 40; x < fgCanvas.width; x += spacing) { for (let y = 40; y < fgCanvas.height; y += spacing) { fgClouds.push(new ImmersiveCloudNode(x + (Math.random()-0.5)*40, y + (Math.random()-0.5)*40, 0, true)); } } }

function initBirthdayFlowerCurtain() {
    fgClouds = [];
    const spacing = 19; // Increased mapping allocation grid counts for high cover density
    for (let x = 10; x < fgCanvas.width; x += spacing) {
        for (let y = 10; y < fgCanvas.height; y += spacing) {
            let randOffsetX = (Math.random() - 0.5) * 12;
            let randOffsetY = (Math.random() - 0.5) * 12;
            fgClouds.push(new CelestialFlowerBlossom(x + randOffsetX, y + randOffsetY));
        }
    }
}

function buildTwinklingStarsEnvironment() {
    const starField = document.getElementById('dynamic-stars-layer'); if (!starField) return; starField.innerHTML = ''; const starCount = Math.floor((window.innerWidth * window.innerHeight) / 6000);
    for(let i=0; i<starCount; i++) { const star = document.createElement('div'); star.classList.add('custom-star'); const diameter = Math.random() * 2.5 + 1; star.style.width = `${diameter}px`; star.style.height = `${diameter}px`; star.style.top = `${Math.random() * 100}%`; star.style.left = `${Math.random() * 100}%`; star.style.animationDelay = `${Math.random() * 5}s`; starField.appendChild(star); }
}

function animateLayers() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height); fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    if (mouse.lastX !== null && mouse.lastY !== null) { mouse.vx = mouse.x - mouse.lastX; mouse.vy = mouse.y - mouse.lastY; } mouse.lastX = mouse.x; mouse.lastY = mouse.y;
    cosmicMoon.update(); cosmicMoon.draw();
    if (Math.random() < 0.006 && shootingStars.length < 2) { shootingStars.push(new CosmicShootingStar()); } shootingStars.forEach(star => { star.update(); star.draw(); }); shootingStars = shootingStars.filter(star => star.opacity > 0);
    bgClouds.forEach(cloud => { cloud.x += cloud.vx; if (cloud.x > bgCanvas.width + cloud.size) { cloud.x = -cloud.size; cloud.y = Math.random() * bgCanvas.height; } cloud.draw(bgCtx); });
    
    if (isEntranceSequenceActive || activePageContext === 12) { 
        fgClouds = fgClouds.filter(f => f.opacity > 0); 
    }
    fgClouds.forEach(node => {
        node.update();
        node.draw(fgCtx);
    });
    if (activePageContext === 1 && !isTransitioningOut) { let activeCount = 0; fgClouds.forEach(f => { if (!f.isFlownAway) activeCount++; }); currentGlobalClearance = ((fgClouds.length - activeCount) / fgClouds.length) * 100; if (currentGlobalClearance > 85) fgCanvas.classList.add('allow-clicks'); else fgCanvas.classList.remove('allow-clicks'); }
    requestAnimationFrame(animateLayers);
}

function triggerFlowerStormTransition() {
    if (isTransitioningOut) return; isTransitioningOut = true; document.getElementById('view-section-1').classList.add('hidden-layer');
    setTimeout(() => { document.getElementById('view-section-1').classList.add('display-none'); isTransitioningOut = false; switchAppScene(2); }, 600);
}

function clearActiveWordHighlights() { document.querySelectorAll('.interactive-word').forEach(w => w.classList.remove('active-touch')); }

function handleFingerSlideAction(e) {
    if (activePageContext === 2) return; const t = e.touches[0];
    const rect = fgCanvas.getBoundingClientRect();
    mouse.x = t.clientX - rect.left; mouse.y = t.clientY - rect.top; mouse.active = true;

    fgCanvas.style.pointerEvents = 'none'; const hitNode = document.elementFromPoint(t.clientX, t.clientY); fgCanvas.style.pointerEvents = 'auto';
    clearActiveWordHighlights();

    if (hitNode && hitNode.classList.contains('interactive-word')) {
        hitNode.classList.add('active-touch');
        if (hitNode.classList.contains('terminal-trigger-word') && currentGlobalClearance > 85) triggerFlowerStormTransition();
        if (hitNode.classList.contains('terminal-time-trigger') && activePageContext === 8) switchAppScene(9);
        if (hitNode.classList.contains('terminal-appreciation-trigger') && activePageContext === 11) switchAppScene(12);
    } 
    else if (hitNode && hitNode.classList.contains('interactive-emoji')) {
        const txt = hitNode.innerText;
        if ((txt.includes('🤭') || txt.includes('😊')) && activePageContext === 5) switchAppScene(6);
    } 
    else if (hitNode && hitNode.classList.contains('interactive-symbol')) {
        const txt = hitNode.innerText;
        if (txt.includes('❤️') && activePageContext === 3) switchAppScene(4);
        else if (txt.includes('🥰') && activePageContext === 6) switchAppScene(7);
    }
}

window.addEventListener('touchmove', handleFingerSlideAction, { passive: false });
window.addEventListener('touchend', () => { clearActiveWordHighlights(); mouse.active = false; });

function parseTextParagraphIntoSpans(paragraphId, terminalMatchKey = null) {
    const container = document.getElementById(paragraphId); if (!container) return;
    const pType = container.getAttribute('data-paragraph-type'); const rawStr = container.innerText; container.innerHTML = '';
    
    rawStr.split(' ').forEach(word => {
        const span = document.createElement('span'); span.innerText = word + ' ';
        
        if (word.includes('🤭') || word.includes('😊') || word.includes('😂')) {
            span.innerText = word; span.classList.add('interactive-emoji');
            if (paragraphId === 'music-story') span.addEventListener('mouseenter', () => { if(activePageContext === 5) switchAppScene(6); });
        } else if (word.includes('❤️') || word.includes('🥰') || word.includes('🙏') || word.includes('🌟')) {
            span.innerText = word; span.classList.add('interactive-symbol'); 
            if (word.includes('❤️')) span.addEventListener('mouseenter', () => { if(activePageContext === 3) switchAppScene(4); });
            if (word.includes('🥰')) span.addEventListener('mouseenter', () => { if(activePageContext === 6) switchAppScene(7); });
        } else {
            span.classList.add('interactive-word');
            span.addEventListener('mouseenter', () => { if (pType !== 'intro' || currentGlobalClearance > 85) span.classList.add('active-touch'); });
            span.addEventListener('mouseleave', () => span.classList.remove('active-touch'));
            
            if (terminalMatchKey && word.toLowerCase().includes(terminalMatchKey)) { 
                if (paragraphId === 'time-story') {
                    span.classList.add('terminal-time-trigger');
                    span.addEventListener('mouseenter', () => { if(activePageContext === 8) switchAppScene(9); });
                } 
                else if (paragraphId === 'appreciation-story') {
                    span.classList.add('terminal-appreciation-trigger');
                    span.addEventListener('mouseenter', () => { if(activePageContext === 11) switchAppScene(12); });
                }
                else {
                    span.classList.add('terminal-trigger-word'); 
                    span.addEventListener('mouseenter', () => { if(currentGlobalClearance > 85) triggerFlowerStormTransition(); }); 
                }
            }
        }
        container.appendChild(span);
    });
}

// Drawing Core Pipeline
function setupDrawingCanvas() { const rect = drawCanvas.parentNode.getBoundingClientRect(); drawCanvas.width = rect.width; drawCanvas.height = rect.height; drawCtx.strokeStyle = '#6a230b'; drawCtx.lineWidth = 4.8; drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round'; isDrawingMode = true; isDrawingStrokeActive = false; drawnHeartPoints = []; }
function executeLocalDrawAction(clientX, clientY) { if (!isDrawingMode || !isDrawingStrokeActive) return; const rect = drawCanvas.getBoundingClientRect(); const currX = clientX - rect.left; const currY = clientY - rect.top; if (drawnHeartPoints.length === 0) { drawCtx.beginPath(); drawCtx.moveTo(currX, currY); } else { drawCtx.lineTo(currX, currY); drawCtx.stroke(); } drawnHeartPoints.push({ x: currX / drawCanvas.width, y: currY / drawCanvas.height }); }

drawCanvas.addEventListener('mousedown', (e) => { e.stopPropagation(); if(activePageContext !== 2 || !isDrawingMode) return; isDrawingStrokeActive = true; executeLocalDrawAction(e.clientX, e.clientY); });
drawCanvas.addEventListener('mousemove', (e) => { e.stopPropagation(); if (isDrawingStrokeActive) executeLocalDrawAction(e.clientX, e.clientY); });
drawCanvas.addEventListener('touchstart', (e) => { e.stopPropagation(); if(activePageContext !== 2 || !isDrawingMode) return; isDrawingStrokeActive = true; const t = e.touches[0]; executeLocalDrawAction(t.clientX, t.clientY); }, { passive: false });
drawCanvas.addEventListener('touchmove', (e) => { e.stopPropagation(); if (isDrawingStrokeActive) { const t = e.touches[0]; executeLocalDrawAction(t.clientX, t.clientY); } }, { passive: false });

function evaluateHeartShapeAccuracy() {
    if (drawnHeartPoints.length < 25) { resetDrawingTask(); return; }
    let sumX = 0, sumY = 0; drawnHeartPoints.forEach(p => { sumX += p.x; sumY += p.y; }); const cx = sumX / drawnHeartPoints.length; const cy = sumY / drawnHeartPoints.length;
    let matchingScoresSum = 0;
    drawnHeartPoints.forEach(p => { const dx = p.x - cx; const dy = (p.y - cy) * -1.1; const angle = Math.atan2(dy, dx); const standardHeartRadius = (Math.sin(angle) * Math.sqrt(Math.abs(Math.cos(angle)))) / (Math.sin(angle) + 1.4) - 2 * Math.sin(angle) + 2; const actualRadius = Math.sqrt(dx * dx + dy * dy) * 4.5; const deviation = Math.abs(actualRadius - standardHeartRadius); const matchFactor = Math.max(0, 1 - deviation * 0.4); matchingScoresSum += matchFactor; });
    const finalAccuracyPercent = Math.floor((matchingScoresSum / drawnHeartPoints.length) * 100); processCustomOdiaTwistOutput(finalAccuracyPercent);
}

function processCustomOdiaTwistOutput(score) {
    isDrawingStrokeActive = false; isDrawingMode = false; const alertOverlay = document.getElementById('custom-alert-overlay'); const eNode = document.getElementById('alert-emoji'); const tNode = document.getElementById('alert-text-odia'); const sNode = document.getElementById('alert-text-score'); sNode.innerText = `Heart Accuracy: ${score}%`; alertOverlay.classList.remove('hidden-element'); setTimeout(() => alertOverlay.classList.add('show'), 10);
    if (score < 50) { eNode.innerText = "🤭"; tNode.innerText = "Tk ta bhalse chesta kara!"; setTimeout(() => { closeAlertAndReset(false); }, 3200); } 
    else if (score >= 50 && score <= 70) { eNode.innerText = "😊"; tNode.innerText = "Au tk bhalse... Hauchi hauchi!"; setTimeout(() => { closeAlertAndReset(false); }, 3800); } 
    else { eNode.innerText = "❤️"; tNode.innerText = "Perfect! Bahut sundar heichi!"; setTimeout(() => { closeAlertAndReset(true); }, 2500); }
}

function closeAlertAndReset(isWin) { const alertOverlay = document.getElementById('custom-alert-overlay'); alertOverlay.classList.remove('show'); setTimeout(() => { alertOverlay.classList.add('hidden-element'); if (isWin) { document.getElementById('view-section-2').classList.add('hidden-layer'); setTimeout(() => { document.getElementById('view-section-2').style.display = 'none'; switchAppScene(3); }, 1000); } else { resetDrawingTask(); } }, 300); }
function resetDrawingTask() { drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height); setupDrawingCanvas(); }

const handlePointerRelease = () => { if (activePageContext === 2 && isDrawingMode && isDrawingStrokeActive) { isDrawingStrokeActive = false; evaluateHeartShapeAccuracy(); } else { isDrawingStrokeActive = false; } };
window.addEventListener('mouseup', handlePointerRelease); window.addEventListener('touchend', handlePointerRelease);

function trackGlobalInput(e) { if(activePageContext === 2) return; const clientX = e.clientX || (e.touches && e.touches[0].clientX); const clientY = e.clientY || (e.touches && e.touches[0].clientY); if (!clientX || !clientY) return; const rect = fgCanvas.getBoundingClientRect(); mouse.x = clientX - rect.left; mouse.y = clientY - rect.top; mouse.active = true; }
window.addEventListener('mousemove', trackGlobalInput);

function resizeCanvases() { bgCanvas.width = fgCanvas.width = window.innerWidth; bgCanvas.height = fgCanvas.height = window.innerHeight; cosmicMoon.init(); buildTwinklingStarsEnvironment(); }
window.addEventListener('resize', resizeCanvases);

window.addEventListener('DOMContentLoaded', () => {
    resizeCanvases(); initDenseForegroundClouds(); initBackgroundAmbientMists();
    parseTextParagraphIntoSpans('interactive-story-1', 'breath'); animateLayers();
    setTimeout(() => { const appViewport = document.getElementById('app-view-container'); if (appViewport) appViewport.classList.add('sky-initialized'); }, 100);
});