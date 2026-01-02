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

    if (!gameState) return <div className="text-white p-10">Carregando sala...</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-white p-4">
            {/* Header com título e botão de sair */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Sala: {roomId}</h1>
                <button
                    onClick={handleLeaveRoom}
                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-semibold transition flex items-center gap-2"
                >
                    🚪 Sair da Sala
                </button>
            </div>

            {/* Card com código da sala */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg border-2 border-blue-500 shadow-lg">
                <p className="text-sm text-blue-200 mb-2 text-center">Compartilhe este código com seu amigo:</p>
                <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-bold tracking-widest font-mono bg-slate-900 px-6 py-3 rounded border-2 border-blue-400">
                        {roomId}
                    </span>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(roomId);
                            alert('Código copiado!');
                        }}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-semibold transition"
                    >
                        📋 Copiar
                    </button>
                </div>
            </div>

            {/* Status do Jogo */}
            <div className="text-center mb-8">
                {gameState.status === 'waiting' ? (
                    <div className="bg-yellow-600 p-2 rounded animate-pulse">
                        ⏳ Aguardando oponente...
                    </div>
                ) : (
                    <div className="bg-green-600 p-2 rounded">
                        🎮 Jogo em Andamento!
                    </div>
                )}
            </div>

            {/* Lista de Jogadores (Debug por enquanto) */}
            <div className="space-y-4">
                {gameState.players.map((p) => (
                    <div key={p.id} className={`p-4 rounded border ${p.id === myId ? 'border-blue-500 bg-slate-800' : 'border-gray-600'}`}>
                        <div className="font-bold text-lg">{p.nickname} {p.id === myId && "(Você)"}</div>
                        <div className="text-2xl font-mono text-yellow-400">{p.score} pts</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
