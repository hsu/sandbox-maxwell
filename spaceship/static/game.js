const socket = io({ path: '/spaceship/socket.io', transports: ['websocket'] });

const debugConsole = document.getElementById('mobile-debug');
document.getElementById('toggle-debug-btn').addEventListener('click', () => {
    debugConsole.style.display = debugConsole.style.display === 'none' ? 'block' : 'none';
});
function debugLog(msg) {
    if(!debugConsole) return;
    const d = new Date();
    const ts = d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds();
    debugConsole.innerHTML = `<div>[${ts}] ${msg}</div>` + debugConsole.innerHTML;
}
console.log = function(...args) { debugLog('LOG: ' + args.join(' ')); };
console.warn = function(...args) { debugLog('<span style="color:yellow">WARN: ' + args.join(' ') + '</span>'); };
console.error = function(...args) { debugLog('<span style="color:red">ERR: ' + args.join(' ') + '</span>'); };

window.onerror = function(msg, url, lineNo, columnNo, error) {
    debugLog(`<span style="color:red">SYS ERR: ${msg} at ${lineNo}:${columnNo}</span>`);
    return false;
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

socket.on('connect', () => {
    debugLog('<span style="color:yellow">SYS: Socket Connected</span>');
    if (gameState === 'game') {
        let me = players && myId ? players[myId] : null;
        socket.emit('join_game', {
            passcode: 'spaceship123',
            name: me ? me.name : document.getElementById('pilot-name').value || 'Pilot',
            team: me ? me.team : document.getElementById('team-select').value,
            shipClass: me ? me.shipClass : document.getElementById('ship-select').value,
            lastX: me ? me.x : null,
            lastY: me ? me.y : null,
            lastHp: me ? me.hp : null,
            lastCoins: me ? me.coins : null
        });
    }
});

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'shoot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'heavy') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'explosion') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'upgrade') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

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
let myFireRate = 300;
let myBulletSpeed = 1000;
let myBulletSize = 5;

const keys = { w: false, a: false, s: false, d: false };
let isRelativeControl = false;
let joyDx = 0, joyDy = 0, joyAngle = null, joyShooting = false;
let leftJoyId = null, rightJoyId = null, lastDoubleTapTime = 0, nippleManager = null;
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
    isRelativeControl = (document.getElementById('control-select').value === 'relative');
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

document.getElementById('admin-settings-btn').addEventListener('click', () => {
    document.getElementById('admin-settings-panel').classList.toggle('hidden');
});

document.getElementById('admin-apply-btn').addEventListener('click', () => {
    const pw = document.getElementById('admin-password').value;
    if (pw === 'hahaha') {
        myFireRate = parseInt(document.getElementById('admin-fire-rate').value) || 300;
        myBulletSpeed = parseInt(document.getElementById('admin-bullet-speed').value) || 1000;
        myBulletSize = parseInt(document.getElementById('admin-bullet-size').value) || 5;

        socket.emit('apply_admin_cheats', {
            password: pw,
            hp: document.getElementById('admin-hp').value,
            speed: document.getElementById('admin-speed').value,
            damage: document.getElementById('admin-damage').value,
            invisible: document.getElementById('admin-invisible').checked
        });

        document.getElementById('admin-error').innerText = 'Cheats injected!';
        document.getElementById('admin-error').style.color = '#0f0';
        setTimeout(() => {
            document.getElementById('admin-settings-panel').classList.add('hidden');
            document.getElementById('admin-error').innerText = '';
        }, 1000);
    } else {
        document.getElementById('admin-error').innerText = 'Invalid Passcode';
        document.getElementById('admin-error').style.color = '#ff3366';
    }
});

document.getElementById('admin-spawn-bot-btn').addEventListener('click', () => {
    const pw = document.getElementById('admin-password').value;
    if (pw === 'hahaha') {
        socket.emit('admin_spawn_bot', { password: pw });
        document.getElementById('admin-error').innerText = 'Bot generated!';
        document.getElementById('admin-error').style.color = '#ffcc00';
    } else {
        document.getElementById('admin-error').innerText = 'Invalid Passcode';
        document.getElementById('admin-error').style.color = '#ff3366';
    }
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
    debugLog('<span style="color:yellow">SYS: Received game_init payload from server!</span>');
    myId = data.myId;
    mapInfo = {width: data.mapWidth, height: data.mapHeight};
    players = data.players;
    if (players[myId]) players[myId].spawnTime = Date.now();
    scores = data.scores;
    mapObstacles = data.obstacles || [];

    showScreen('game');
    chatContainerGame.appendChild(chatComponent);
    canvas.style.display = 'block';
    resizeCanvas();
    initTouchControls();
    updateHUD();
    
    if (!window.loopRunning) {
        window.loopRunning = true;
        requestAnimationFrame(gameLoop);
    }
});

socket.on('player_joined', (p) => {
    p.spawnTime = Date.now();
    players[p.id] = p;
});
socket.on('player_left', (data) => {
    if (data.id === myId) return;
    delete players[data.id];
});

socket.on('player_moved', (data) => {
    if (players[data.id]) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
        players[data.id].angle = data.angle;
    }
});

socket.on('player_died', (data) => {
    playSound('explosion');
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
        if (data.coins > players[myId].coins) playSound('coin');
        players[myId].coins = data.coins;
        updateHUD();
    }
});

socket.on('player_damaged', (data) => {
    if (players[data.id] && data.hp < players[data.id].hp) playSound('hit');
    if (players[data.id]) players[data.id].hp = data.hp;
    if (data.id === myId) updateHUD();
});

socket.on('disconnect', () => {
    debugLog('<span style="color:red">SYS: Socket DISCONNECTED from server!</span>');
});
socket.on('player_respawned', (p) => {
    p.spawnTime = Date.now();
    players[p.id] = p;
    if (p.id === myId) {
        document.getElementById('death-screen').classList.remove('active');
        canvas.style.display = 'block';
        updateHUD();
    }
});
socket.on('player_cheated', (p) => {
    players[p.id] = p;
    if (p.id === myId) updateHUD();
});
socket.on('bullet_spawned', (b) => {
    debugLog('NET: Rcv BULLET id=' + b.id.substring(0,5));
    b.createdAt = Date.now();
    bullets[b.id] = b;
    if (b.type === 'heavy') playSound('heavy');
    else playSound('shoot');
});

socket.on('upgrade_bought', (data) => {
    if (players[data.id]) {
        if (data.id === myId) playSound('upgrade');
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
    joyAngle = null;
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
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        resizeCanvas();
        // Clear joysticks on rotation to prevent getting stuck
        joyShooting = false;
        joyDx = 0; joyDy = 0;
        leftJoyId = null;
        rightJoyId = null;
        if(document.querySelectorAll) {
            document.querySelectorAll('.nipple').forEach(n => n.remove());
        }
    }, 250);
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initTouchControls() {
    if (!('ontouchstart' in window) && navigator.maxTouchPoints <= 0) return;
    if (nippleManager) return;

    const zone = document.getElementById('joystick-zone');
    zone.style.display = 'block';

    let lastRightTapTime = 0;

    nippleManager = nipplejs.create({
        zone: zone,
        mode: 'dynamic',
        multitouch: true,
        maxNumberOfNipples: 2
    });

    nippleManager.on('start', (evt, data) => {
        debugLog(`Joy START id=${data.identifier} pos=${Math.floor(data.position.x)},${Math.floor(data.position.y)}`);
        if (data.position.x < window.innerWidth / 2) {
            leftJoyId = data.identifier;
        } else {
            rightJoyId = data.identifier;
            joyShooting = true;
            
            const now = Date.now();
            if (now - lastRightTapTime < 300) {
                fireHeavyWeapon();
            }
            lastRightTapTime = now;
        }
    });

    nippleManager.on('move', (evt, data) => {
        if (!data.vector) return;
        if (data.identifier === leftJoyId) {
            joyDx = data.vector.x;
            joyDy = -data.vector.y;
        } else if (data.identifier === rightJoyId) {
            if (data.vector && Math.hypot(data.vector.x, data.vector.y) > 0.01) {
                joyAngle = Math.atan2(-data.vector.y, data.vector.x);
            }
            joyShooting = true;
        }
    });

    nippleManager.on('end', (evt, data) => {
        debugLog(`Joy END id=${data.identifier}`);
        if (data.identifier === leftJoyId) {
            joyDx = 0; joyDy = 0; leftJoyId = null;
        } else if (data.identifier === rightJoyId) {
            joyShooting = false; rightJoyId = null;
        }
    });
    
    window.addEventListener('touchcancel', () => {
        debugLog('SYS: touchcancel intercepted. Force clearing joysticks.');
        joyShooting = false;
        joyDx = 0; joyDy = 0;
        leftJoyId = null;
        rightJoyId = null;
        document.querySelectorAll('.nipple').forEach(n => n.remove());
    });

    document.addEventListener("visibilitychange", () => {
        debugLog('SYS: Visibility changed. active=' + !document.hidden);
        if (document.hidden) {
            joyShooting = false;
            joyDx = 0; joyDy = 0;
            leftJoyId = null;
            rightJoyId = null;
            document.querySelectorAll('.nipple').forEach(n => n.remove());
        }
    });

    window.addEventListener('touchend', (e) => {
        if (e.touches && e.touches.length === 0) {
            if (joyShooting || leftJoyId !== null || rightJoyId !== null) {
                debugLog('SYS: 0 active touches detected. Ripcording joysticks.');
                joyShooting = false;
                joyDx = 0; joyDy = 0;
                leftJoyId = null;
                rightJoyId = null;
                document.querySelectorAll('.nipple').forEach(n => n.remove());
            }
        }
    });
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
    let inputY = joyDy !== 0 ? joyDy : (keys.w ? -1 : (keys.s ? 1 : 0));
    let inputX = joyDx !== 0 ? joyDx : (keys.a ? -1 : (keys.d ? 1 : 0));

    if (isRelativeControl) {
        if (inputX !== 0 && joyAngle === null) {
            me.angle += inputX * 4.0 * dt;
        }
        if (inputY !== 0) {
            let thrust = -inputY;
            dx += Math.cos(me.angle) * thrust;
            dy += Math.sin(me.angle) * thrust;
        }
    } else {
        dx = inputX;
        dy = inputY;
    }

    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        let moveMult = len > 1 ? 1 : len;
        let newX = me.x + (dx / len) * me.speed * moveMult * dt;
        let newY = me.y + (dy / len) * me.speed * moveMult * dt;
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

    if (!isRelativeControl) {
        if (joyAngle !== null) {
            me.angle = joyAngle;
        } else {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            me.angle = Math.atan2(mouse.y - cy, mouse.x - cx);
        }
    } else {
        if (joyAngle !== null) {
            me.angle = joyAngle;
        }
    }

    if ((mouse.isDown || joyShooting) && performance.now() - lastShootTime > myFireRate) {
        lastShootTime = performance.now();
        debugLog('NET: Emitting shot packet v1');
        socket.emit('player_shoot', { x: me.x, y: me.y, angle: me.angle, bullet_type: 'normal', speed: myBulletSpeed, size: myBulletSize });
    }
    if (mouse.isRightDown) {
        fireHeavyWeapon();
    }

    socket.emit('player_move', { x: me.x, y: me.y, angle: me.angle });

    const now = Date.now();

    for (let bid in bullets) {
        let b = bullets[bid];
        const age = (now - b.createdAt) / 1000;
        if (age > 2) {
            delete bullets[bid];
            continue;
        }
        let speed = b.speed || 1000;
        b.currX = b.x + Math.cos(b.angle) * speed * age;
        b.currY = b.y + Math.sin(b.angle) * speed * age;

        let bHitObj = false;
        let bRad = b.size || (b.type === 'heavy' ? 15 : 5);
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
            if (p.isDead || p.team === b.team || p.isInvisible) continue;

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
    if (!players[myId]) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
            ctx.fillStyle = '#cd853f'; // Peru/Wood color
            ctx.fillRect(-o.radius*0.8, -o.radius*0.8, o.radius*1.6, o.radius*1.6);
            ctx.strokeStyle = '#8b4513'; ctx.lineWidth = 4; // SaddleBrown border
            ctx.strokeRect(-o.radius*0.8, -o.radius*0.8, o.radius*1.6, o.radius*1.6);
            // Draw horizontal wooden slats instead of an X
            ctx.beginPath(); ctx.moveTo(-o.radius*0.8, -o.radius*0.4); ctx.lineTo(o.radius*0.8, -o.radius*0.4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-o.radius*0.8, 0); ctx.lineTo(o.radius*0.8, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-o.radius*0.8, o.radius*0.4); ctx.lineTo(o.radius*0.8, o.radius*0.4); ctx.stroke();
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
        ctx.fillStyle = b.team === 'red' ? '#ff3366' : (b.team === 'green' ? '#33ff33' : '#33ccff');
        let bRad = b.size || (b.type === 'heavy' ? 15 : 5);
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
        if (p.isInvisible && p.id !== myId) continue;

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

        if (p.spawnTime && Date.now() - p.spawnTime < 5000) {
            ctx.globalAlpha = 0.4 + Math.abs(Math.sin(Date.now() / 150)) * 0.4;
        } else if (p.isInvisible) {
            ctx.globalAlpha = 0.3;
        }

        ctx.fillStyle = p.team === 'red' ? '#ff3366' : (p.team === 'green' ? '#33ff33' : '#33ccff');
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

        ctx.globalAlpha = 1.0;

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

function fireHeavyWeapon() {
    let me = players[myId];
    if (!me || me.isDead) return;

    if (!isReloadingHeavy && heavyAmmo > 0 && performance.now() - lastHeavyShootTime > 500) {
        lastHeavyShootTime = performance.now();
        heavyAmmo--;
        updateHUD();
        socket.emit('player_shoot', { x: me.x, y: me.y, angle: me.angle, bullet_type: 'heavy', speed: myBulletSpeed, size: Math.max(15, myBulletSize * 3) });

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
}
