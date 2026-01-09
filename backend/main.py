# backend/main.py (Atualização)
import socketio
import random
import string
from fastapi import FastAPI

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app_fastapi = FastAPI()
app = socketio.ASGIApp(sio, other_asgi_app=app_fastapi)

games = {}

def generate_room_code():
    """Gera um código único de 6 caracteres para a sala"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in games:
            return code 

async def broadcast_game_state(room_id):
    game = games.get(room_id)
    if not game:
        return

    players_list = []
    for sid, player_data in game['players'].items():
        players_list.append({
            'id': sid,
            'nickname': player_data['nickname'],
            'score': player_data['score'],
            # Nota: Não enviamos o 'character' aqui para evitar cheat no Inspecionar Elemento
        })

    state = {
        'roomId': room_id,
        'status': game['status'],
        'players': players_list
    }
    
    await sio.emit('update_game', state, room=room_id)

@sio.event
async def connect(sid, environ):
    print(f"✅ Conectado: {sid}")

@sio.event
async def create_room(sid, data):
    """Cria uma nova sala com código único"""
    nickname = data['nickname']
    
    room_code = generate_room_code()
    
    games[room_code] = {
        'status': 'waiting',
        'players': {},
        'owner': sid  # Marca quem criou a sala
    }
    
    await sio.enter_room(sid, room_code)
    
    games[room_code]['players'][sid] = {
        "nickname": nickname,
        "score": 1000,
        "character": None
    }
    
    print(f"🎮 Sala criada: {room_code} por {nickname}")
    
    # Envia o estado PRIMEIRO para garantir que o frontend receba antes de redirecionar
    await broadcast_game_state(room_code)
    
    # Depois envia a confirmação de criação (para evitar race condition)
    await sio.emit('room_created', {'roomCode': room_code}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"❌ Desconectado: {sid}")
    
    # Remove o jogador de todas as salas
    for room_id, game in list(games.items()):
        if sid in game['players']:
            nickname = game['players'][sid]['nickname']
            del game['players'][sid]
            print(f"🚪 {nickname} saiu da sala {room_id}")
            
            # Se a sala ficou vazia, remove ela
            if len(game['players']) == 0:
                del games[room_id]
                print(f"🗑️ Sala {room_id} removida (vazia)")
            else:
                # Se ainda tem jogadores, volta para 'waiting'
                game['status'] = 'waiting'
                await broadcast_game_state(room_id)

@sio.event
async def join_game(sid, data):
    room_id = data['roomId']
    nickname = data['nickname']
    
    if room_id not in games:
        games[room_id] = {
            'status': 'waiting',
            'players': {}
        }
    
    current_game = games[room_id]
    
    # Se já tem 2 jogadores, bloqueia
    if len(current_game['players']) >= 2:
        await sio.emit('error', {'message': 'Sala cheia!'}, to=sid)
        return

    await sio.enter_room(sid, room_id)
    
    current_game['players'][sid] = {
        "nickname": nickname,
        "score": 1000,
        "character": None 
    }

    if len(current_game['players']) == 2:
        current_game['status'] = 'playing'
        print(f"🎮 Sala {room_id}: Jogo Iniciado!")
        # AQUI entrará a lógica de sortear personagens no próximo passo

    # Envia o estado atualizado para todos na sala PRIMEIRO
    await broadcast_game_state(room_id)
    
    # Depois confirma a entrada (para evitar race condition)
    await sio.emit('join_success', {'roomId': room_id}, to=sid)

@sio.event
async def get_game_state(sid, data):
    """Permite que um cliente solicite o estado atual da sala"""
    room_id = data['roomId']
    print(f"📥 Cliente {sid} solicitou estado da sala: {room_id}")
    
    if room_id not in games:
        print(f"⚠️ Sala {room_id} não existe")
        await sio.emit('error', {'message': 'Sala não encontrada!'}, to=sid)
        return
    
    # Envia o estado apenas para quem solicitou
    game = games[room_id]
    players_list = []
    for player_sid, player_data in game['players'].items():
        players_list.append({
            'id': player_sid,
            'nickname': player_data['nickname'],
            'score': player_data['score'],
        })

    state = {
        'roomId': room_id,
        'status': game['status'],
        'players': players_list
    }
    
    print(f"📤 Enviando estado para {sid}:", state)
    await sio.emit('update_game', state, to=sid)

@sio.event
async def leave_game(sid, data):
    """Permite que um jogador saia voluntariamente da sala"""
    room_id = data['roomId']
    print(f"🚪 Cliente {sid} solicitou sair da sala: {room_id}")
    
    if room_id not in games:
        print(f"⚠️ Sala {room_id} não existe")
        return
    
    game = games[room_id]
    
    if sid in game['players']:
        nickname = game['players'][sid]['nickname']
        del game['players'][sid]
        await sio.leave_room(sid, room_id)
        print(f"👋 {nickname} saiu da sala {room_id}")
        
        # Se a sala ficou vazia, remove ela
        if len(game['players']) == 0:
            del games[room_id]
            print(f"🗑️ Sala {room_id} removida (vazia)")
        else:
            # Se ainda tem jogadores, volta para 'waiting'
            game['status'] = 'waiting'
            await broadcast_game_state(room_id)
        
        # Confirma para o cliente que ele saiu
        await sio.emit('leave_success', {'roomId': room_id}, to=sid)