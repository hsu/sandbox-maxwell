import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
import time
import random

app = Flask(__name__, static_url_path='/spaceship/static')
app.config['SECRET_KEY'] = 'space_secret_123'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', path='/spaceship/socket.io')

# Game State
PASSCODE = "spaceship123"
players = {}
scores = {"red": 0, "blue": 0}

SHIP_STATS = {
    "fighter": {"hp": 100, "speed": 400, "damage": 20, "radius": 15},
    "scout": {"hp": 60, "speed": 600, "damage": 15, "radius": 12},
    "juggernaut": {"hp": 200, "speed": 250, "damage": 30, "radius": 20}
}
MAP_WIDTH = 2000
MAP_HEIGHT = 1500

OBSTACLE_TYPES = ['rock', 'metal_crate', 'mushroom']
def generate_obstacles():
    obs = []
    for _ in range(15):
        obs.append({ 'id': str(uuid.uuid4()), 'x': random.randint(300, MAP_WIDTH - 300), 'y': random.randint(200, MAP_HEIGHT - 200), 'radius': random.randint(30, 80), 'type': random.choice(OBSTACLE_TYPES) })
    return obs

OBSTACLES = generate_obstacles()

@socketio.on('reset_match')
def handle_reset():
    global OBSTACLES, scores
    OBSTACLES = generate_obstacles()
    scores = {"red": 0, "blue": 0}
    for sid in players:
        team = players[sid]['team']
        players[sid]['hp'] = players[sid]['maxHp']
        players[sid]['isDead'] = False
        if team == 'red':
            players[sid]['x'], players[sid]['y'] = 100, MAP_HEIGHT / 2
        else:
            players[sid]['x'], players[sid]['y'] = MAP_WIDTH - 100, MAP_HEIGHT / 2
    socketio.emit('match_reset', {'scores': scores, 'obstacles': OBSTACLES, 'players': players})

@socketio.on('obstacle_destroyed')
def handle_obs_dest(data):
    obs_id = data.get('obs_id')
    global OBSTACLES
    OBSTACLES = [o for o in OBSTACLES if o['id'] != obs_id]
    socketio.emit('obstacle_destroyed', {'obs_id': obs_id})


@app.route('/spaceship')
@app.route('/spaceship/')
def index():
    return render_template('index.html')

@socketio.on('join_game')
def handle_join(data):
    passcode = data.get('passcode')
    if passcode != PASSCODE:
        emit('join_error', {'message': 'Invalid Passcode!'})
        return

    sid = request.sid
    name = data.get('name', 'Pilot')
    team = data.get('team', 'red')
    ship_class = data.get('shipClass', 'fighter')

    stats = SHIP_STATS.get(ship_class, SHIP_STATS['fighter'])

    if data.get('lastX') is not None and data.get('lastY') is not None:
        x, y = data.get('lastX'), data.get('lastY')
    elif team == 'red':
        x, y = 100, MAP_HEIGHT / 2
    else:
        x, y = MAP_WIDTH - 100, MAP_HEIGHT / 2

    players[sid] = {
        'id': sid,
        'name': name,
        'team': team,
        'shipClass': ship_class,
        'x': x,
        'y': y,
        'angle': 0,
        'hp': data.get('lastHp') if data.get('lastHp') is not None else stats['hp'],
        'maxHp': stats['hp'],
        'speed': stats['speed'],
        'damage': stats['damage'],
        'isDead': False,
        'coins': data.get('lastCoins', 0),
        'immuneUntil': time.time() + 5
    }

    join_room(team) # for team chat

    emit('game_init', {
        'myId': sid,
        'mapWidth': MAP_WIDTH,
        'mapHeight': MAP_HEIGHT,
        'players': players,
        'scores': scores,
        'obstacles': OBSTACLES
    })

    socketio.emit('player_joined', players[sid], skip_sid=sid)

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in players:
        del players[sid]
        socketio.emit('player_left', {'id': sid})

@socketio.on('player_move')
def handle_move(data):
    sid = request.sid
    if sid in players and not players[sid]['isDead']:
        players[sid]['x'] = data.get('x', players[sid]['x'])
        players[sid]['y'] = data.get('y', players[sid]['y'])
        players[sid]['angle'] = data.get('angle', players[sid]['angle'])
        socketio.emit('player_moved', {
            'id': sid,
            'x': players[sid]['x'],
            'y': players[sid]['y'],
            'angle': players[sid]['angle']
        }, skip_sid=sid)

@socketio.on('player_shoot')
def handle_shoot(data):
    sid = request.sid
    if sid in players and not players[sid]['isDead']:
        bullet_type = data.get('bullet_type', 'normal')
        if bullet_type == 'heavy':
            dmg = 100
        else:
            dmg = players[sid]['damage']

        bullet = {
            'id': str(uuid.uuid4()),
            'owner': sid,
            'team': players[sid]['team'],
            'x': data.get('x'),
            'y': data.get('y'),
            'angle': data.get('angle'),
            'speed': data.get('speed', 1000),
            'size': data.get('size'),
            'damage': dmg,
            'type': bullet_type
        }
        socketio.emit('bullet_spawned', bullet)

@socketio.on('bullet_hit')
def handle_hit(data):
    target_id = data.get('targetId')
    damage = data.get('damage', 10)

    if target_id in players and not players[target_id]['isDead']:
        if time.time() < players[target_id].get('immuneUntil', 0):
            return

        players[target_id]['hp'] -= damage
        if players[target_id]['hp'] <= 0:
            players[target_id]['hp'] = 0
            players[target_id]['isDead'] = True

            shooter_id = data.get('shooterId')
            coin_reward = 20 if players[target_id].get('isBot') else 50
            if shooter_id in players:
                players[shooter_id]['coins'] += coin_reward
                shooter_team = players[shooter_id]['team']
                if shooter_team in scores and not players[target_id].get('isBot'):
                    scores[shooter_team] += 1
                socketio.emit('coins_update', {'coins': players[shooter_id]['coins']}, to=shooter_id)

            socketio.emit('player_died', {'id': target_id, 'scores': scores})
            
            if players[target_id].get('isBot'):
                # remove the bot immediately from the game memory so it doesn't leak memory or stay rendered
                del players[target_id]
                socketio.emit('player_left', {'id': target_id})
            # waiting for request_respawn for normal players
        else:
            socketio.emit('player_damaged', {'id': target_id, 'hp': players[target_id]['hp']})

@socketio.on('request_respawn')
def handle_respawn(data):
    sid = request.sid
    if sid in players and players[sid]['isDead']:
        ship_class = data.get('shipClass', 'fighter')
        stats = SHIP_STATS.get(ship_class, SHIP_STATS['fighter'])

        team = players[sid]['team']
        players[sid]['isDead'] = False
        players[sid]['shipClass'] = ship_class
        players[sid]['maxHp'] = stats['hp']
        players[sid]['hp'] = stats['hp']
        players[sid]['speed'] = stats['speed']
        players[sid]['damage'] = stats['damage']
        players[sid]['immuneUntil'] = time.time() + 5

        if team == 'red':
            players[sid]['x'], players[sid]['y'] = 100, MAP_HEIGHT / 2
        else:
            players[sid]['x'], players[sid]['y'] = MAP_WIDTH - 100, MAP_HEIGHT / 2

        socketio.emit('player_respawned', players[sid])

# --- Chat System ---
@socketio.on('chat_message')
def handle_chat(data):
    sid = request.sid
    msg = data.get('text')
    channel = data.get('channel', 'global')

    if sid in players:
        name = players[sid]['name']
        team = players[sid]['team']
    else:
        name = "Spectator"
        team = "none"

    chat_data = {
        'sender': name,
        'team': team,
        'text': msg,
        'channel': channel
    }

    if channel == 'team' and team in ['red', 'blue']:
        socketio.emit('chat_message', chat_data, to=team)
    else:
        socketio.emit('chat_message', chat_data)

# --- God Mode Cheats ---
@socketio.on('apply_admin_cheats')
def handle_admin_cheats(data):
    sid = request.sid
    if data.get('password') == 'hahaha' and sid in players:
        if 'hp' in data:
            players[sid]['hp'] = int(data['hp'])
            if players[sid]['hp'] > players[sid]['maxHp']:
                players[sid]['maxHp'] = players[sid]['hp']
        if 'speed' in data:
            players[sid]['speed'] = int(data['speed'])
        if 'damage' in data:
            players[sid]['damage'] = int(data['damage'])
        if 'invisible' in data:
            players[sid]['isInvisible'] = bool(data['invisible'])
            
        socketio.emit('player_cheated', players[sid])

@socketio.on('admin_spawn_bot')
def handle_admin_spawn_bot(data):
    sid = request.sid
    if data.get('password') == 'hahaha' and sid in players:
        bot_id = f'bot_{uuid.uuid4()}'
        ship_class = random.choice(list(SHIP_STATS.keys()))
        stats = SHIP_STATS[ship_class]
        bot_team = random.choice(['red', 'blue'])
        players[bot_id] = {
            'id': bot_id,
            'name': f'Bot-{bot_id[:4]}',
            'team': bot_team,
            'shipClass': ship_class,
            'x': random.randint(100, MAP_WIDTH - 100),
            'y': random.randint(100, MAP_HEIGHT - 100),
            'angle': random.uniform(0, 3.14 * 2),
            'hp': stats['hp'],
            'maxHp': stats['hp'],
            'speed': stats['speed'] * 0.5, # give bot 50% speed
            'damage': stats['damage'],
            'isDead': False,
            'coins': 0,
            'isBot': True,
            'immuneUntil': 0,
            'spawnTime': time.time()
        }
        socketio.emit('player_joined', players[bot_id])

# --- Shop Purchases ---
@socketio.on('buy_upgrade')
def handle_buy_upgrade(data):
    sid = request.sid
    if sid in players:
        upgrade = data.get('upgrade')
        cost = 100
        if players[sid]['coins'] >= cost:
            players[sid]['coins'] -= cost
            if upgrade == 'heal':
                players[sid]['hp'] = players[sid]['maxHp']
            elif upgrade == 'damage':
                players[sid]['damage'] += 10
            elif upgrade == 'speed':
                players[sid]['speed'] += 50

            socketio.emit('upgrade_bought', {
                'id': sid,
                'coins': players[sid]['coins'],
                'hp': players[sid]['hp'],
                'maxHp': players[sid]['maxHp'],
                'speed': players[sid]['speed'],
                'damage': players[sid]['damage']
            })

import math
def bot_manager_loop():
    while True:
        eventlet.sleep(0.1)  # 10Hz tick rate
        for pid in list(players.keys()):
            p = players.get(pid)
            if not p or not p.get('isBot') or p.get('isDead'):
                continue
                
            # Random slight change in direction
            if random.random() < 0.1:
                p['angle'] += random.uniform(-0.5, 0.5)
            
            p['x'] += math.cos(p['angle']) * p['speed'] * 0.1
            p['y'] += math.sin(p['angle']) * p['speed'] * 0.1
            
            # Simple bounds bounce
            if p['x'] < 50 or p['x'] > MAP_WIDTH - 50 or p['y'] < 50 or p['y'] > MAP_HEIGHT - 50:
                p['angle'] += math.pi
                p['x'] = max(50, min(MAP_WIDTH - 50, p['x']))
                p['y'] = max(50, min(MAP_HEIGHT - 50, p['y']))
                
            socketio.emit('player_moved', {
                'id': pid,
                'x': p['x'],
                'y': p['y'],
                'angle': p['angle']
            })
            
            # Occasionally shoot randomly
            if random.random() < 0.05:  # ~1 shot per 2 seconds
                bullet = {
                    'id': str(uuid.uuid4()),
                    'owner': pid,
                    'team': p['team'],
                    'x': p['x'],
                    'y': p['y'],
                    'angle': p['angle'] + random.uniform(-0.1, 0.1),
                    'speed': 800,
                    'size': 5,
                    'damage': p['damage'],
                    'type': 'normal'
                }
                socketio.emit('bullet_spawned', bullet)

socketio.start_background_task(bot_manager_loop)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
