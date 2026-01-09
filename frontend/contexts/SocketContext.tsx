"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Cria uma única instância do socket que persiste entre navegações
        const socketInstance = io(SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: true,
        });

        socketInstance.on("connect", () => {
            console.log("🔌 Socket conectado:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("🔌 Socket desconectado");
            setIsConnected(false);
        });

        setSocket(socketInstance);

        // Cleanup: só desconecta quando o app inteiro for desmontado
        return () => {
            console.log("🔌 Desconectando socket (app desmontado)");
            socketInstance.disconnect();
        };
    }, []); // Array vazio = executa apenas uma vez

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
