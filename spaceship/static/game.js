const socket = io();

const screens = {
    passcode: document.getElementById('passcode-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-ui')
};
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const chatContainerLobby = document.getElementById('lobby-chat-container');
const chatContainerGame = document.getElementById('game-chat-wrapper');
const chatComponent = document.getElementById('chat-component');

let gameState = 'passcode';
let myId = null;
let mapInfo = { width: 2000, height: 1500 };
let players = {};
let bullets = {};
let scores = { red: 0, blue: 0 };
let mapObstacles = [];
let currentChatChannel = 'global';

const keys = { w: false, a: false, s: false, d: false };
let heavyAmmo = 3;
let isReloadingHeavy = false;
let lastHeavyShootTime = 0;
const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false, isRightDown: false };

document.getElementById('passcode-btn').addEventListener('click', () => {
    const pw = document.getElementById('passcode-input').value;
    if (pw === 'spaceship123') {
        showScreen('lobby');
        chatContainerLobby.appendChild(chatComponent);
    } else {
        document.getElementById('passcode-error').innerText = 'Access Denied';
    }
});

document.getElementById('deploy-btn').addEventListener('click', () => {
    socket.emit('join_game', {
        passcode: 'spaceship123',
        name: document.getElementById('pilot-name').value || 'Pilot',
        team: document.getElementById('team-select').value,
        shipClass: document.getElementById('ship-select').value
    });
});

document.getElementById('shop-toggle-btn').addEventListener('click', () => {
    document.getElementById('shop-panel').classList.toggle('hidden');
});

document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        socket.emit('buy_upgrade', { upgrade: e.target.dataset.upgrade });
    });
});

document.querySelectorAll('.chat-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.chat-tab').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentChatChannel = e.target.dataset.channel;
    });
});

document.getElementById('chat-send').addEventListener('click', sendChat);
document.getElementById('chat-minimize-btn').addEventListener('click', () => {
    const body = document.getElementById('chat-body');
    const btn = document.getElementById('chat-minimize-btn');
    if (body.style.display === 'none') {
        body.style.display = 'flex';
        btn.innerText = '_';
    } else {
        body.style.display = 'none';
        btn.innerText = '^';
    }
});


socket.on('obstacle_destroyed', (data) => {
    mapObstacles = mapObstacles.filter(o => o.id !== data.obs_id);
});

socket.on('match_reset', (data) => {
    scores = data.scores;
    mapObstacles = data.obstacles;
    players = data.players;
    
    // Refresh stats if we exist
    if (players[myId]) {
        if (!players[myId].isDead) {
            document.getElementById('death-screen').classList.remove('active');
            canvas.style.display = 'block';
        }
    }
    
    // Reset our heavy ammo naturally
    heavyAmmo = 3;
    isReloadingHeavy = false;
    document.getElementById('ui-reloading').style.display = 'none';
        
    updateHUD();
});

document.getElementById('restart-match-btn').addEventListener('click', () => {
    socket.emit('reset_match');
});

document.getElementById('respawn-btn').addEventListener('click', () => {
    socket.emit('request_respawn', {
        shipClass: document.getElementById('death-ship-select').value
    });
});

document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChat();
});

function sendChat() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (text) {
        socket.emit('chat_message', { text, channel: currentChatChannel });
        input.value = '';
    }
}

function showScreen(name) {
    gameState = name;
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
}

socket.on('join_error', (data) => alert(data.message));

socket.on('game_init', (data) => {
    myId = data.myId;
    mapInfo = {width: data.mapWidth, height: data.mapHeight};
    players = data.players;
    scores = data.scores;
    mapObstacles = data.obstacles || [];
    
    showScreen('game');
    chatContainerGame.appendChild(chatComponent);
    canvas.style.display = 'block';
    resizeCanvas();
    updateHUD();
    requestAnimationFrame(gameLoop);
});

socket.on('player_joined', (p) => players[p.id] = p);
socket.on('player_left', (data) => delete players[data.id]);

socket.on('player_moved', (data) => {
    if (players[data.id]) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
        players[data.id].angle = data.angle;
    }
});

socket.on('player_died', (data) => {
    if (players[data.id]) players[data.id].isDead = true;
    scores = data.scores;
    if (data.id === myId) {
        document.getElementById('death-screen').classList.add('active');
        canvas.style.display = 'none';
    }
    updateHUD();
});
socket.on('coins_update', (data) => {
    if (players[myId]) {
        players[myId].coins = data.coins;
        updateHUD();
    }
});

socket.on('player_damaged', (data) => {
    if (players[data.id]) players[data.id].hp = data.hp;
    if (data.id === myId) updateHUD();
});
socket.on('player_respawned', (p) => {
    players[p.id] = p;
    if (p.id === myId) {
        document.getElementById('death-screen').classList.remove('active');
        canvas.style.display = 'block';
        updateHUD();
    }
});
socket.on('bullet_spawned', (b) => {
    b.createdAt = Date.now();
    bullets[b.id] = b;
});

socket.on('upgrade_bought', (data) => {
    if (players[data.id]) {
        players[data.id].coins = data.coins;
        players[data.id].hp = data.hp;
        players[data.id].maxHp = data.maxHp;
        players[data.id].speed = data.speed;
        if (data.damage !== undefined) players[data.id].damage = data.damage;
        if (data.id === myId) updateHUD();
    }
});

socket.on('chat_message', (data) => {
    const box = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + (data.team === 'none' ? 'system' : data.team);
    let prefix = data.channel === 'team' ? '[TEAM] ' : '';
    msg.innerText = prefix + data.sender + ': ' + data.text;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
});

window.addEventListener('keydown', e => {
    if(document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'w' || e.key === 'W') keys.w = true;
    if (e.key === 'a' || e.key === 'A') keys.a = true;
    if (e.key === 's' || e.key === 'S') keys.s = true;
    if (e.key === 'd' || e.key === 'D') keys.d = true;
});
window.addEventListener('keyup', e => {
    if(document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'w' || e.key === 'W') keys.w = false;
    if (e.key === 'a' || e.key === 'A') keys.a = false;
    if (e.key === 's' || e.key === 'S') keys.s = false;
    if (e.key === 'd' || e.key === 'D') keys.d = false;
});
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('mousedown', e => { 
    if(e.target === canvas) {
        if(e.button === 0) mouse.isDown = true;
        if(e.button === 2) mouse.isRightDown = true;
    }
});
window.addEventListener('mouseup', e => { 
    if(e.button === 0) mouse.isDown = false; 
    if(e.button === 2) mouse.isRightDown = false; 
});
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

let lastTime = performance.now();
let lastShootTime = 0;

function updateHUD() {
    document.getElementById('score-red').innerText = scores.red;
    document.getElementById('score-blue').innerText = scores.blue;
    if (players[myId]) {
        document.getElementById('ui-coins').innerText = players[myId].coins;
        document.getElementById('ui-hp').innerText = Math.floor(players[myId].hp);
        document.getElementById('ui-speed').innerText = Math.floor(players[myId].speed);
        document.getElementById('ui-damage').innerText = Math.floor(players[myId].damage);
        document.getElementById('ui-ammo').innerText = heavyAmmo;
    }
}

function update(dt) {
    if (!players[myId] || players[myId].isDead) return;
    
    const me = players[myId];
    
    let dx = 0; let dy = 0;
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        let newX = me.x + (dx / len) * me.speed * dt;
        let newY = me.y + (dy / len) * me.speed * dt;
        newX = Math.max(0, Math.min(mapInfo.width, newX));
        newY = Math.max(0, Math.min(mapInfo.height, newY));
        
        let radius = me.shipClass === 'juggernaut' ? 20 : (me.shipClass === 'scout' ? 12 : 15);
        let safe = true;
        for (let o of mapObstacles) {
            if (Math.hypot(newX - o.x, newY - o.y) < radius + o.radius + 5) {
                safe = false; break;
            }
        }
        if (safe) {
            me.x = newX; me.y = newY;
        }
    }

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    me.angle = Math.atan2(mouse.y - cy, mouse.x - cx);

    if (mouse.isDown && performance.now() - lastShootTime > 300) {
        lastShootTime = performance.now();
        socket.emit('player_shoot', { x: me.x, y: me.y, angle: me.angle, bullet_type: 'normal' });
    }
    if (mouse.isRightDown && !isReloadingHeavy && heavyAmmo > 0 && performance.now() - lastHeavyShootTime > 500) {
        lastHeavyShootTime = performance.now();
        heavyAmmo--;
        updateHUD();
        socket.emit('player_shoot', { x: me.x, y: me.y, angle: me.angle, bullet_type: 'heavy' });
        
        if (heavyAmmo <= 0) {
            isReloadingHeavy = true;
            document.getElementById('ui-reloading').style.display = 'inline';
            setTimeout(() => {
                heavyAmmo = 3;
                isReloadingHeavy = false;
                document.getElementById('ui-reloading').style.display = 'none';
                updateHUD();
            }, 5000);
        }
    }

    socket.emit('player_move', { x: me.x, y: me.y, angle: me.angle });

    const now = Date.now();
    // Draw Obstacles
    for (let o of mapObstacles) {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.lineJoin = 'round';
        if (o.type === 'rock') {
            ctx.fillStyle = '#555';
            ctx.beginPath(); ctx.arc(0, 0, o.radius, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#333'; ctx.lineWidth = 4; ctx.stroke();
            // simple craters
            ctx.fillStyle = '#444';
            ctx.beginPath(); ctx.arc(o.radius*0.3, -o.radius*0.2, o.radius*0.2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-o.radius*0.4, o.radius*0.4, o.radius*0.15, 0, Math.PI*2); ctx.fill();
        } else if (o.type === 'metal_crate') {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(-o.radius*0.8, -o.radius*0.8, o.radius*1.6, o.radius*1.6);
            ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 4;
            ctx.strokeRect(-o.radius*0.8, -o.radius*0.8, o.radius*1.6, o.radius*1.6);
            ctx.beginPath(); ctx.moveTo(-o.radius*0.8, -o.radius*0.8); ctx.lineTo(o.radius*0.8, o.radius*0.8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-o.radius*0.8, o.radius*0.8); ctx.lineTo(o.radius*0.8, -o.radius*0.8); ctx.stroke();
        } else if (o.type === 'mushroom') {
            ctx.fillStyle = '#dfd3c3';
            ctx.fillRect(-o.radius*0.4, 0, o.radius*0.8, o.radius*0.9);
            ctx.fillStyle = '#f03e3e';
            ctx.beginPath(); ctx.arc(0, 0, o.radius, Math.PI, 2*Math.PI); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(o.radius*0.5, -o.radius*0.4, o.radius*0.25, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-o.radius*0.6, -o.radius*0.3, o.radius*0.18, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, -o.radius*0.7, o.radius*0.22, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }

    for (let bid in bullets) {
        let b = bullets[bid];
        const age = (now - b.createdAt) / 1000;
        if (age > 2) {
            delete bullets[bid];
            continue;
        }
        b.currX = b.x + Math.cos(b.angle) * 1000 * age;
        b.currY = b.y + Math.sin(b.angle) * 1000 * age;
        
        let bHitObj = false;
        let bRad = b.type === 'heavy' ? 15 : 5;
        for (let o of mapObstacles) {
            if (Math.hypot(b.currX - o.x, b.currY - o.y) < bRad + o.radius) {
                bHitObj = true; 
                if (b.type === 'heavy' && b.owner === myId) {
                    socket.emit('obstacle_destroyed', {obs_id: o.id});
                }
                break;
            }
        }
        if (bHitObj) {
            delete bullets[bid];
            continue;
        }

        let hitPlayer = false;
        for (let id in players) {
            let p = players[id];
            if (p.isDead || p.team === b.team) continue;
            
            const dist = Math.hypot(p.x - b.currX, p.y - b.currY);
            let radius = p.shipClass === 'juggernaut' ? 20 : (p.shipClass === 'scout' ? 12 : 15);
            
            if (dist < radius + bRad) {
                if (b.owner === myId) {
                    socket.emit('bullet_hit', { targetId: id, shooterId: myId, damage: b.damage });
                }
                hitPlayer = true;
                break;
            }
        }
        if (hitPlayer) {
            delete bullets[bid];
            continue;
        }


    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!players[myId]) return;

    const me = players[myId];
    const cameraX = me.x - canvas.width / 2;
    const cameraY = me.y - canvas.height / 2;

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, mapInfo.width, mapInfo.height);

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for(let i=0; i<mapInfo.width; i+=100) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, mapInfo.height); ctx.stroke();
    }
    for(let i=0; i<mapInfo.height; i+=100) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(mapInfo.width, i); ctx.stroke();
    }

    // Draw Obstacles
    for (let o of mapObstacles) {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.lineJoin = 'round';
        if (o.type === 'rock') {
            ctx.fillStyle = '#555';
            ctx.beginPath(); ctx.arc(0, 0, o.radius, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#333'; ctx.lineWidth = 4; ctx.stroke();
            // simple craters
            ctx.fillStyle = '#444';
            ctx.beginPath(); ctx.arc(o.radius*0.3, -o.radius*0.2, o.radius*0.2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-o.radius*0.4, o.radius*0.4, o.radius*0.15, 0, Math.PI*2); ctx.fill();
        } else if (o.type === 'metal_crate') {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(-o.radius*0.8, -o.radius*0.8, o.radius*1.6, o.radius*1.6);
            ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 4;
            ctx.strokeRect(-o.radius*0.8, -o.radius*0.8, o.radius*1.6, o.radius*1.6);
            ctx.beginPath(); ctx.moveTo(-o.radius*0.8, -o.radius*0.8); ctx.lineTo(o.radius*0.8, o.radius*0.8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-o.radius*0.8, o.radius*0.8); ctx.lineTo(o.radius*0.8, -o.radius*0.8); ctx.stroke();
        } else if (o.type === 'mushroom') {
            ctx.fillStyle = '#dfd3c3';
            ctx.fillRect(-o.radius*0.4, 0, o.radius*0.8, o.radius*0.9);
            ctx.fillStyle = '#f03e3e';
            ctx.beginPath(); ctx.arc(0, 0, o.radius, Math.PI, 2*Math.PI); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(o.radius*0.5, -o.radius*0.4, o.radius*0.25, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-o.radius*0.6, -o.radius*0.3, o.radius*0.18, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, -o.radius*0.7, o.radius*0.22, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }

    for (let bid in bullets) {
        let b = bullets[bid];
        if(!b.currX) continue;
        ctx.fillStyle = b.team === 'red' ? '#ff3366' : '#33ccff';
        let bRad = b.type === 'heavy' ? 15 : 5;
        if (b.type === 'heavy') ctx.fillStyle = '#fffc00';
        ctx.beginPath();
        ctx.arc(b.currX, b.currY, bRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = b.type === 'heavy' ? 20 : 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    for (let id in players) {
        let p = players[id];
        if (p.isDead) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, 0, -35);

        ctx.fillStyle = 'red';
        ctx.fillRect(-20, -25, 40, 5);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(-20, -25, 40 * (p.hp / p.maxHp), 5);

        ctx.rotate(p.angle);
        
        ctx.fillStyle = p.team === 'red' ? '#ff3366' : '#33ccff';
        let r = p.shipClass === 'juggernaut' ? 20 : (p.shipClass === 'scout' ? 12 : 15);
        ctx.beginPath();
        ctx.moveTo(r * 1.5, 0);
        ctx.lineTo(-r, -r);
        ctx.lineTo(-r, r);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    ctx.restore();
}

function gameLoop() {
    if (gameState !== 'game') return;
    
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}
