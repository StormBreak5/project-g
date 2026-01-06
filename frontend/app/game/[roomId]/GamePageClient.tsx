"use client";
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useRouter } from 'next/navigation';

interface Player {
    id: string;
    nickname: string;
    score: number;
}

interface GameState {
    roomId: string;
    status: 'waiting' | 'playing';
    players: Player[];
}

export default function GamePageClient({ roomId }: { roomId: string }) {
    const { socket } = useSocket();
    const router = useRouter();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [myId, setMyId] = useState<string>("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasReceivedStateRef = useRef(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!socket) {
            console.log("⚠️ Socket ainda não está disponível");
            return;
        }

        console.log("✅ Socket conectado, ID:", socket.id);
        setMyId(socket.id || "");
        hasReceivedStateRef.current = false;

        // Ouve atualizações do servidor
        socket.on('update_game', (data: GameState) => {
            console.log("📡 Estado atualizado recebido:", data);
            setGameState(data);
            hasReceivedStateRef.current = true;

            // Cancela o timeout se o estado chegar antes
            if (timeoutRef.current) {
                console.log("⏹️ Cancelando timeout (estado recebido)");
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        });

        // Ouve confirmação de saída
        socket.on('leave_success', (data) => {
            console.log("👋 Saiu da sala:", data.roomId);
            router.push('/'); // Redireciona para a página inicial
        });

        // Ouve erros do servidor (ex: sala não existe)
        socket.on('error', (data) => {
            console.error("❌ Erro:", data.message);
            if (data.message === 'Sala não encontrada!') {
                console.log("↩️ Redirecionando para a página inicial...");
                router.push('/');
            }
        });

        // Solicita o estado atual da sala ao entrar (com delay para evitar race condition)
        // Isso é útil caso o usuário dê F5 ou entre diretamente pela URL
        timeoutRef.current = setTimeout(() => {
            if (!hasReceivedStateRef.current) {
                console.log("📤 Solicitando estado da sala (timeout):", roomId);
                socket.emit('get_game_state', { roomId: roomId });
            } else {
                console.log("✅ Estado já recebido, timeout ignorado");
            }
        }, 500);

        // Cleanup: remove os listeners quando o componente desmontar
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            socket.off('update_game');
            socket.off('leave_success');
            socket.off('error');
        };

    }, [socket, roomId, router]);

    const handleLeaveRoom = () => {
        if (socket) {
            console.log("🚪 Solicitando sair da sala:", roomId);
            socket.emit('leave_game', { roomId });
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!gameState) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#09090B] to-pink-900/20"></div>
                <div className="relative z-10 glass-effect rounded-3xl p-8 text-center">
                    <div className="w-16 h-16 border-4 border-[var(--primary-neon)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)]">Carregando sala...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8 relative overflow-hidden">
            {/* Background com gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#09090B] to-pink-900/20"></div>

            {/* Efeitos de luz de fundo */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

            {/* Container principal */}
            <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6">

                {/* Header com título e botão de sair */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gradient">Sala: {roomId}</h1>
                    <button
                        onClick={handleLeaveRoom}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-[var(--error)] px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sair
                    </button>
                </div>

                {/* Card com código da sala */}
                <div className="glass-effect rounded-2xl p-6 md:p-8">
                    <p className="text-sm text-[var(--text-muted)] mb-3 text-center">Compartilhe este código com seu amigo:</p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <div className="gradient-primary px-8 py-4 rounded-xl">
                            <span className="text-3xl md:text-4xl font-bold tracking-widest font-mono text-white">
                                {roomId}
                            </span>
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="bg-[var(--bg-surface)] hover:bg-zinc-800 border border-zinc-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    Copiar
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Status do Jogo */}
                <div className="text-center">
                    {gameState.status === 'waiting' ? (
                        <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-6 py-3 rounded-xl animate-pulse">
                            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="2" x2="12" y2="6"></line>
                                <line x1="12" y1="18" x2="12" y2="22"></line>
                                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                <line x1="2" y1="12" x2="6" y2="12"></line>
                                <line x1="18" y1="12" x2="22" y2="12"></line>
                                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                            </svg>
                            Aguardando oponente...
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-[var(--success)] px-6 py-3 rounded-xl">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Jogo em Andamento!
                        </div>
                    )}
                </div>

                {/* Lista de Jogadores */}
                <div className="grid md:grid-cols-2 gap-4">
                    {gameState.players.map((p, index) => (
                        <div
                            key={p.id}
                            className={`glass-effect rounded-2xl p-6 transition-all hover:scale-[1.02] ${p.id === myId ? 'border-2 border-[var(--primary-neon)] shadow-lg shadow-purple-500/20' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${index === 0 ? 'gradient-primary' : 'bg-zinc-800'
                                        }`}>
                                        {p.nickname.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {p.nickname}
                                            {p.id === myId && (
                                                <span className="text-xs bg-[var(--primary-neon)]/20 text-[var(--primary-neon)] px-2 py-1 rounded-full">
                                                    Você
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)]">Jogador {index + 1}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                <span className="text-[var(--text-muted)] text-sm">Pontuação</span>
                                <span className="text-2xl font-bold text-gradient">{p.score} pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

