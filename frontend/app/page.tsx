"use client";
import { useSocket } from '@/hooks/useSocket';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Lobby() {
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'create' | 'join'>('create');

  useEffect(() => {
    if (!socket) return;

    let roomCodeToJoin: string | null = null;
    let hasReceivedState = false;

    // Quando uma sala é criada com sucesso
    socket.on('room_created', (data) => {
      console.log("🎉 Sala criada com código:", data.roomCode);
      roomCodeToJoin = data.roomCode;

      // Aguarda um pouco para garantir que o estado chegou
      // Se já recebeu o update_game, redireciona imediatamente
      if (hasReceivedState) {
        console.log("✅ Estado já recebido, redirecionando...");
        router.push(`/game/${data.roomCode}`);
      } else {
        // Aguarda até 1 segundo pelo estado, depois redireciona de qualquer forma
        console.log("⏳ Aguardando estado da sala...");
        setTimeout(() => {
          console.log("⏰ Timeout - redirecionando mesmo sem estado");
          router.push(`/game/${data.roomCode}`);
        }, 1000);
      }
    });

    // Listener para receber o estado da sala
    socket.on('update_game', (data) => {
      console.log("📡 Estado recebido:", data);
      hasReceivedState = true;

      // Se já recebeu room_created e está aguardando, redireciona agora
      if (roomCodeToJoin && roomCodeToJoin === data.roomId) {
        console.log("✅ Estado confirmado, redirecionando...");
        router.push(`/game/${roomCodeToJoin}`);
        roomCodeToJoin = null;
      }
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
      socket.off('update_game');
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
        <Card className="glass-effect card-custom shadow-2xl">
          <CardHeader className="text-center card-header-custom">
            <CardTitle className="text-5xl md:text-6xl font-bold mb-6 tracking-wide text-gradient uppercase leading-tight" style={{
              letterSpacing: '0.1em',
              textShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
            }}>
              QUEM<br />SOU EU?
            </CardTitle>
            <CardDescription className="text-base text-[var(--text-muted)]">Desafie seus amigos.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 card-content-custom">
            {/* Tabs: Criar ou Entrar */}
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'create' | 'join')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[var(--bg-surface)] tabs-list-custom">
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 tabs-trigger-custom"
                >
                  Criar Sala
                </TabsTrigger>
                <TabsTrigger
                  value="join"
                  className="data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 tabs-trigger-custom"
                >
                  Entrar em Sala
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6 mt-8">
                <AnimatePresence mode="wait">
                  {mode === 'create' && (
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {/* Campo de Apelido */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <Label htmlFor="nickname-create" className="label-custom text-[var(--text-base)]">
                          Seu Apelido
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--primary-neon)] z-10" />
                          <Input
                            id="nickname-create"
                            type="text"
                            placeholder="Digite seu apelido"
                            className="input-custom bg-[var(--bg-surface)] border-zinc-800 focus:border-[var(--primary-neon)] focus:ring-[var(--primary-neon)]/20"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={20}
                          />
                        </div>
                      </div>

                      {/* Mensagem de erro */}
                      {error && (
                        <div style={{ marginBottom: '1.5rem' }} className="bg-red-500/10 border-2 border-red-500/30 text-[var(--error)] px-5 py-4 rounded-xl text-sm text-center font-medium">
                          {error}
                        </div>
                      )}

                      {/* Botão de Criar */}
                      <Button
                        onClick={handleCreateRoom}
                        disabled={!isConnected || !nickname}
                        className="w-full button-custom gradient-primary hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:hover:scale-100 active:scale-[0.98] font-bold uppercase tracking-wider transition-all"
                      >
                        ENTRAR
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="join" className="space-y-6 mt-8">
                <AnimatePresence mode="wait">
                  {mode === 'join' && (
                    <motion.div
                      key="join"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {/* Campo de Apelido */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <Label htmlFor="nickname-join" className="label-custom text-[var(--text-base)]">
                          Seu Apelido
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--primary-neon)] z-10" />
                          <Input
                            id="nickname-join"
                            type="text"
                            placeholder="Digite seu apelido"
                            className="input-custom bg-[var(--bg-surface)] border-zinc-800 focus:border-[var(--primary-neon)] focus:ring-[var(--primary-neon)]/20"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={20}
                          />
                        </div>
                      </div>

                      {/* Campo de Código da Sala */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <Label htmlFor="room-code" className="label-custom text-[var(--text-base)]">
                          Código da Sala
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--primary-neon)] z-10" />
                          <Input
                            id="room-code"
                            type="text"
                            placeholder="Digite o código"
                            className="input-custom bg-[var(--bg-surface)] border-zinc-800 focus:border-[var(--primary-neon)] focus:ring-[var(--primary-neon)]/20 uppercase"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            maxLength={6}
                          />
                        </div>
                      </div>

                      {/* Mensagem de erro */}
                      {error && (
                        <div style={{ marginBottom: '1.5rem' }} className="bg-red-500/10 border-2 border-red-500/30 text-[var(--error)] px-5 py-4 rounded-xl text-sm text-center font-medium">
                          {error}
                        </div>
                      )}

                      {/* Botão de Entrar */}
                      <Button
                        onClick={handleJoinRoom}
                        disabled={!isConnected || !nickname || !roomCode}
                        className="w-full button-custom gradient-primary hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:hover:scale-100 active:scale-[0.98] font-bold uppercase tracking-wider transition-all"
                      >
                        ENTRAR
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>

            {/* Status Online (rodapé) */}
            <div className="flex items-center justify-center pt-4 ">
              <Badge variant="outline" className="border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)] px-4 py-2 badge-padding-margin">
                <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse mr-2"></div>
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
}