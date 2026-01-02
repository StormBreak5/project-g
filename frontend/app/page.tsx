"use client";
import { useSocket } from '@/hooks/useSocket';
import { useState, useEffect } from 'react';

export default function Home() {
  const { socket, isConnected } = useSocket();
  const [msg, setMsg] = useState("Aguardando...");

  useEffect(() => {
    if (!socket) return;
    socket.on('pong_client', (data) => setMsg(data.text));
    socket.on('message', (data) => console.log(data));
  }, [socket]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
      <h1 className="text-2xl font-bold">Teste de Conexão</h1>
      <div className={`px-4 py-2 rounded ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
        {isConnected ? 'Conectado' : 'Desconectado'}
      </div>
      <button
        onClick={() => socket?.emit('ping_server', 'Olá!')}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        Testar Ping
      </button>
      <p>Resposta: <span className="text-yellow-400">{msg}</span></p>
    </div>
  );
}