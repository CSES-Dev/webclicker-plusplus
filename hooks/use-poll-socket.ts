import { useEffect, useRef } from "react";
import type { WebSocketMessage } from "@/lib/websocket";

interface UsePollSocketProps {
    courseSessionId: number;
    userId: string;
    onMessage: (data: WebSocketMessage) => void;
    onConnect: () => void;
    onDisconnect: () => void;
}

export function usePollSocket({
    courseSessionId,
    userId,
    onMessage,
    onConnect,
    onDisconnect,
}: UsePollSocketProps) {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!courseSessionId || !userId) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(
            `${protocol}//${window.location.host}/ws/poll?sessionId=${courseSessionId}&userId=${userId}`,
        );
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection established");
            onConnect();
        };

        ws.onmessage = (event) => {
            try {
                if (typeof event.data === "string") {
                    const data = JSON.parse(event.data) as WebSocketMessage;
                    onMessage(data);
                }
            } catch (err) {
                console.error("Error processing message:", err);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            onDisconnect();
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, [courseSessionId, userId, onConnect, onDisconnect, onMessage]);

    return wsRef;
}
