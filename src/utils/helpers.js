// Unique ID Generator
export function genUid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9);
}

// SHA-256 for Admin
export async function sha256Hex(message) {
    const enc = new TextEncoder();
    const data = enc.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Notification System
export function showNotification(message, type = 'default', duration = 5000) {
    const notificationArea = document.getElementById('notification-area');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.animation = 'none';
    notification.offsetHeight; // trigger reflow
    notification.style.animation = `slideInNotification 0.4s ease-out, fadeOutNotification 0.4s ease-in ${duration/1000 - 0.4}s forwards`;
    
    notificationArea.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode === notificationArea) {
            notificationArea.removeChild(notification);
        }
    }, duration);
}

// Floating Text for Combat
export function showFloatingText(text, anchorElement, opts = {}) {
    try {
        if(!anchorElement) return;
        const span = document.createElement('div');
        span.className = 'floating-text';
        span.textContent = text;
        const rect = anchorElement.getBoundingClientRect();
        span.style.left = `${rect.left + rect.width/2}px`;
        span.style.top = `${rect.top - 8}px`;
        span.style.pointerEvents = 'none';
        span.style.zIndex = 9999;
        
        const t = opts.type || (text.startsWith('-') ? 'damage' : (text.startsWith('+') ? 'heal' : 'status'));
        span.classList.add(t);
        if (opts.color) span.style.color = opts.color;
        if (opts.large) span.style.fontSize = '2.8rem';

        document.body.appendChild(span);

        if (opts.shaky) span.classList.add('shaky');
        else span.classList.add('animate');

        span.addEventListener('animationend', () => { if (span.parentNode) span.parentNode.removeChild(span); });
        setTimeout(()=>{ if (span.parentNode) span.parentNode.removeChild(span); }, 1200);
    } catch (e) { console.warn('floating text err', e); }
}

// Sound Effects
const audioContext = (typeof AudioContext !== 'undefined') ? new AudioContext() : null;
const sfxBuffers = {};

export async function loadSfx(name, url) {
    if (!audioContext) return;
    try {
        const res = await fetch(url);
        const ab = await res.arrayBuffer();
        sfxBuffers[name] = await audioContext.decodeAudioData(ab);
    } catch (e) {
        console.warn('SFX load failed', name, e);
    }
}

export function playSfx(name) {
    try {
        if (audioContext && sfxBuffers[name]) {
            const src = audioContext.createBufferSource();
            src.buffer = sfxBuffers[name];
            const gain = audioContext.createGain();
            gain.gain.value = 0.7;
            src.connect(gain).connect(audioContext.destination);
            src.start(0);
        }
    } catch (e) { /* ignore */ }
}