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
            <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#09090B] to-pink-900/20"></div>
                <Card className="relative z-10 glass-effect shadow-2xl text-center" style={{ minWidth: '300px' }}>
                    <CardContent className="pt-12 pb-12 px-10">
                        <Loader2 className="w-16 h-16 text-[var(--primary-neon)] animate-spin mx-auto" style={{ marginBottom: '1.5rem' }} />
                        <p className="text-[var(--text-muted)] text-base">Carregando sala...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background com gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#09090B] to-pink-900/20"></div>

            {/* Efeitos de luz de fundo */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

            {/* Container principal */}
            <div className="relative w-full max-w-4xl z-10">
                <Card className="glass-effect card-custom shadow-2xl">
                    <CardHeader className="card-header-custom">
                        {/* Header com título e botão de sair */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-4xl md:text-5xl font-bold text-gradient uppercase tracking-wide" style={{ marginBottom: '0.5rem' }}>
                                    Sala de Jogo
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Código: <span className="font-mono font-bold text-[var(--primary-neon)]">{roomId}</span>
                                </CardDescription>
                            </div>
                            <Button
                                onClick={handleLeaveRoom}
                                variant="destructive"
                                className="button-custom-sm bg-red-600/20 border-2 border-red-500/30 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-all"
                            >
                                <LogOut className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                                Sair da Sala
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="card-content-custom space-y-8">
                        {/* Card com código da sala */}
                        <div className="gradient-primary p-1 rounded-xl">
                            <div className="bg-[var(--bg-surface)] rounded-lg" style={{ padding: '1.5rem' }}>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-[var(--text-muted)] text-sm uppercase tracking-wide font-semibold" style={{ marginBottom: '0.75rem' }}>
                                            Compartilhe este código
                                        </p>
                                        <div className="inline-flex items-center gap-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50" style={{ padding: '1rem 1.5rem' }}>
                                            <Copy className="h-5 w-5 text-[var(--primary-neon)]" />
                                            <span className="text-3xl md:text-4xl font-bold font-mono text-gradient" style={{ letterSpacing: '0.3em' }}>
                                                {roomId}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleCopyCode}
                                        className="button-custom gradient-primary hover:opacity-90 hover:scale-105 font-bold transition-all"
                                        style={{ paddingLeft: '2rem', paddingRight: '2rem' }}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-5 w-5" style={{ marginRight: '0.5rem' }} />
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-5 w-5" style={{ marginRight: '0.5rem' }} />
                                                Copiar Código
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Status do Jogo */}
                        <div className="flex justify-center" style={{ marginTop: '1.5rem' }}>
                            {gameState.status === 'waiting' ? (
                                <Badge variant="outline" className="badge-custom border-yellow-500/30 bg-yellow-500/20 text-yellow-400">
                                    <Loader2 className="animate-spin h-5 w-5" style={{ marginRight: '0.5rem' }} />
                                    Aguardando oponente...
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="badge-custom border-[var(--success)]/30 bg-[var(--success)]/20 text-[var(--success)]">
                                    <Clock className="h-5 w-5" style={{ marginRight: '0.5rem' }} />
                                    Jogo em Andamento!
                                </Badge>
                            )}
                        </div>

                        {/* Seção de Jogadores */}
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                                <User className="h-6 w-6 text-[var(--primary-neon)]" />
                                Jogadores
                                <span className="text-[var(--text-muted)] text-lg font-normal">({gameState.players.length}/2)</span>
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {gameState.players.map((p, index) => (
                                    <Card
                                        key={p.id}
                                        className={`glass-effect border-2 transition-all duration-300 hover:scale-[1.02] ${p.id === myId
                                            ? 'border-[var(--primary-neon)] shadow-xl shadow-purple-500/30 animate-glow'
                                            : 'border-zinc-800/50 hover:border-zinc-700'
                                            }`}
                                    >
                                        <CardContent style={{ padding: '1.5rem' }}>
                                            <div className="flex items-start justify-between" style={{ marginBottom: '1.5rem' }}>
                                                <div className="flex items-center gap-4">
                                                    {/* Avatar com gradiente */}
                                                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${index === 0 ? 'gradient-primary' : 'bg-gradient-to-br from-zinc-700 to-zinc-800'
                                                        }`}>
                                                        <span className="relative z-10 text-white">
                                                            {p.nickname.charAt(0).toUpperCase()}
                                                        </span>
                                                        {p.id === myId && (
                                                            <div className="absolute inset-0 rounded-full animate-pulse bg-purple-500/30"></div>
                                                        )}
                                                    </div>

                                                    {/* Info do jogador */}
                                                    <div>
                                                        <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                                                            <h3 className="font-bold text-xl text-white">{p.nickname}</h3>
                                                            {p.id === myId && (
                                                                <Badge className="gradient-primary text-white border-0 text-xs font-bold" style={{ padding: '0.25rem 0.75rem' }}>
                                                                    VOCÊ
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-[var(--text-muted)] font-medium">
                                                            Jogador {index + 1}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Estatísticas */}
                                            <div className="space-y-3">
                                                <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[var(--primary-neon)]"></div>
                                                        <span className="text-[var(--text-muted)] text-sm font-semibold uppercase tracking-wide">Pontuação</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-bold text-gradient">{p.score}</span>
                                                        <span className="text-sm text-[var(--text-muted)] font-medium">pts</span>
                                                    </div>
                                                </div>

                                                {/* Barra de progresso visual */}
                                                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full gradient-primary transition-all duration-500"
                                                        style={{ width: `${Math.min((p.score / 1000) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Slot vazio para segundo jogador */}
                                {gameState.players.length < 2 && (
                                    <Card className="glass-effect border-2 border-dashed border-zinc-800/50">
                                        <CardContent className="flex items-center justify-center" style={{ padding: '3rem 1.5rem', minHeight: '200px' }}>
                                            <div className="text-center">
                                                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto" style={{ marginBottom: '1rem' }}>
                                                    <User className="h-8 w-8 text-zinc-600" />
                                                </div>
                                                <p className="text-[var(--text-muted)] font-medium">Aguardando jogador...</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
