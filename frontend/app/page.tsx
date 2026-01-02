"use client";
import { useSocket } from '@/hooks/useSocket';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Lobby() {
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'create' | 'join'>('create'); // Modo: criar ou entrar

  useEffect(() => {
    if (!socket) return;

    // Quando uma sala é criada com sucesso
    socket.on('room_created', (data) => {
      console.log("🎉 Sala criada com código:", data.roomCode);
      router.push(`/game/${data.roomCode}`);
    });

    // Quando entra em uma sala existente
    socket.on('join_success', (data) => {
      console.log("✅ Entrou na sala:", data.roomId);
      router.push(`/game/${data.roomId}`);
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      socket.off('room_created');
      socket.off('join_success');
      socket.off('error');
    };

  }, [socket, router]);

  const handleCreateRoom = () => {
    if (!nickname) {
      setError("Digite seu apelido!");
      return;
    }
    if (socket) {
      setError("");
      socket.emit('create_room', { nickname });
    }
  };

  const handleJoinRoom = () => {
    if (!nickname || !roomCode) {
      setError("Preencha todos os campos!");
      return;
    }
    if (socket) {
      setError("");
      socket.emit('join_game', { nickname, roomId: roomCode.toUpperCase() });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-2">🕵️ Quem Sou Eu?</h1>
        <p className="text-slate-400 text-center mb-8">Crie uma sala ou entre com um código.</p>

        {/* Status da Conexão */}
        <div className="flex justify-center mb-6">
          <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {isConnected ? 'Servidor Online' : 'Conectando ao servidor...'}
          </span>
        </div>

        {/* Tabs: Criar ou Entrar */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded font-semibold transition ${mode === 'create' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Criar Sala
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2 rounded font-semibold transition ${mode === 'join' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Entrar em Sala
          </button>
        </div>

        <div className="space-y-4">
          {/* Campo de Apelido (sempre visível) */}
          <div>
            <label className="block text-sm font-medium mb-1">Seu Apelido</label>
            <input
              type="text"
              placeholder="Ex: Batman"
              className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 focus:outline-none"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Modo: Entrar em Sala */}
          {mode === 'join' && (
            <div>
              <label className="block text-sm font-medium mb-1">Código da Sala</label>
              <input
                type="text"
                placeholder="Ex: ABC123"
                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 focus:outline-none uppercase"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Botão de Ação */}
          {mode === 'create' ? (
            <button
              onClick={handleCreateRoom}
              disabled={!isConnected}
              className="w-full bg-green-600 hover:bg-green-500 py-3 rounded font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎮 CRIAR SALA
            </button>
          ) : (
            <button
              onClick={handleJoinRoom}
              disabled={!isConnected}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚪 ENTRAR NA SALA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}