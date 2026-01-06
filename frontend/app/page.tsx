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
  const [mode, setMode] = useState<'create' | 'join'>('create');

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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#09090B] to-pink-900/20"></div>

      {/* Efeitos de luz de fundo */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      {/* Container principal */}
      <div className="relative w-full max-w-md z-10">
        {/* Card principal */}
        <div className="glass-effect rounded-3xl p-10 shadow-2xl">

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wide text-gradient uppercase leading-tight" style={{
              letterSpacing: '0.1em',
              textShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
            }}>
              QUEM<br />SOU EU?
            </h1>
            <p className="text-[var(--text-muted)] text-base">Desafie seus amigos.</p>
          </div>


          {/* Tabs: Criar ou Entrar */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all ${mode === 'create'
                ? 'gradient-primary text-white shadow-lg shadow-purple-500/30'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-zinc-800 border border-zinc-800'
                }`}
            >
              Criar Sala
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all ${mode === 'join'
                ? 'gradient-primary text-white shadow-lg shadow-purple-500/30'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-zinc-800 border border-zinc-800'
                }`}
            >
              Entrar em Sala
            </button>
          </div>

          {/* Formulário */}
          <div className="space-y-5">
            {/* Campo de Apelido */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-neon)] z-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Seu Apelido"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--bg-surface)] border border-zinc-800 text-[var(--text-base)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary-neon)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-neon)]/20 transition-all"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
            </div>

            {/* Campo de Código da Sala (apenas no modo "join") */}
            {mode === 'join' && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-neon)] z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Nome da Sala"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--bg-surface)] border border-zinc-800 text-[var(--text-base)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary-neon)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-neon)]/20 transition-all uppercase"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-[var(--error)] px-4 py-3 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* Botão de Ação */}
            <div className="pt-2">
              {mode === 'create' ? (
                <button
                  onClick={handleCreateRoom}
                  disabled={!isConnected || !nickname}
                  className="w-full gradient-primary py-4 rounded-xl font-bold text-white uppercase tracking-wider transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]"
                >
                  ENTRAR
                </button>
              ) : (
                <button
                  onClick={handleJoinRoom}
                  disabled={!isConnected || !nickname || !roomCode}
                  className="w-full gradient-primary py-4 rounded-xl font-bold text-white uppercase tracking-wider transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]"
                >
                  ENTRAR
                </button>
              )}
            </div>
          </div>

          {/* Status Online (rodapé) */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[var(--text-muted)] text-xs">
            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}