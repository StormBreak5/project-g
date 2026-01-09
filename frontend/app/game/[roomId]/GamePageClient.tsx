"use client";
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Copy, Check, Loader2, Clock, User } from 'lucide-react';

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
                <Card className="relative z-10 glass-effect border-2 border-zinc-800/50 text-center">
                    <CardContent className="pt-8 pb-8 px-8">
                        <Loader2 className="w-16 h-16 text-[var(--primary-neon)] animate-spin mx-auto mb-6" />
                        <p className="text-[var(--text-muted)] text-base">Carregando sala...</p>
                    </CardContent>
                </Card>
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
            <div className="relative z-10 max-w-4xl mx-auto w-full space-y-8">

                {/* Header com título e botão de sair */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gradient">Sala: {roomId}</h1>
                    <Button
                        onClick={handleLeaveRoom}
                        variant="destructive"
                        className="flex items-center gap-2 h-11 px-5"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair
                    </Button>
                </div>

                {/* Card com código da sala */}
                <Card className="glass-effect border-2 border-zinc-800/50">
                    <CardHeader className="text-center pb-4 pt-6">
                        <CardDescription className="text-base">Compartilhe este código com seu amigo:</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-5">
                            <div className="gradient-primary px-10 py-5 rounded-xl shadow-lg">
                                <span className="text-3xl md:text-4xl font-bold tracking-widest font-mono text-white">
                                    {roomId}
                                </span>
                            </div>
                            <Button
                                onClick={handleCopyCode}
                                variant="outline"
                                className="bg-[var(--bg-surface)] border-2 border-zinc-700 hover:bg-zinc-800 flex items-center gap-2 h-12 px-6 font-semibold"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-5 w-5" />
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-5 w-5" />
                                        Copiar
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Status do Jogo */}
                <div className="text-center">
                    {gameState.status === 'waiting' ? (
                        <Badge variant="outline" className="border-2 border-yellow-500/30 bg-yellow-500/20 text-yellow-400 px-7 py-3.5 text-base font-semibold">
                            <Loader2 className="animate-spin h-5 w-5 mr-2.5" />
                            Aguardando oponente...
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-2 border-[var(--success)]/30 bg-[var(--success)]/20 text-[var(--success)] px-7 py-3.5 text-base font-semibold">
                            <Clock className="h-5 w-5 mr-2.5" />
                            Jogo em Andamento!
                        </Badge>
                    )}
                </div>

                {/* Lista de Jogadores */}
                <div className="grid md:grid-cols-2 gap-5">
                    {gameState.players.map((p, index) => (
                        <Card
                            key={p.id}
                            className={`glass-effect border-2 border-zinc-800/50 transition-all hover:scale-[1.02] ${p.id === myId ? 'border-2 border-[var(--primary-neon)] shadow-lg shadow-purple-500/20' : ''
                                }`}
                        >
                            <CardContent className="pt-7 pb-7 px-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-md ${index === 0 ? 'gradient-primary' : 'bg-zinc-800'
                                            }`}>
                                            {p.nickname.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg flex items-center gap-2.5">
                                                {p.nickname}
                                                {p.id === myId && (
                                                    <Badge variant="secondary" className="bg-[var(--primary-neon)]/20 text-[var(--primary-neon)] border border-[var(--primary-neon)]/30 px-2.5 py-0.5">
                                                        Você
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-[var(--text-muted)] mt-1">Jogador {index + 1}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t-2 border-zinc-800">
                                    <span className="text-[var(--text-muted)] text-sm font-medium">Pontuação</span>
                                    <span className="text-2xl font-bold text-gradient">{p.score} pts</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

