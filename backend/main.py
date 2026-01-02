import socketio
from fastapi import FastAPI

#Servidor
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
socket_app = socketio.ASGIApp(sio, app)
app.mount("/", socket_app)

@sio.event
async def connect(sid, environ):
    print(f"Cliente conectado: {sid}")
    await sio.emit('message', {'message': 'Conectado ao Python com sucesso !'}, to=sid)

@sio.event
async def ping_server(sid, data):
    print(f"Ping recebido: {data}")
    await sio.emit('pong_server', {'message': 'Pong de volta !'}, to=sid)