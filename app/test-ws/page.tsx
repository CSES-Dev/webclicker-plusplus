"use client";

import { useEffect, useState } from "react";

export default function TestWebSocket() {
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:3000/ws");

        socket.onopen = () => {
            console.log("Connected to WebSocket");
            setMessages((prev: string[]) => [...prev, "Connected to WebSocket"]);
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            console.log("Received:", event.data);
            setMessages((prev: string[]) => [...prev, String(event.data)]);
        };

        socket.onclose = () => {
            console.log("Disconnected from WebSocket");
            setMessages((prev: string[]) => [...prev, "Disconnected from WebSocket"]);
            setIsConnected(false);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            setMessages((prev: string[]) => [...prev, "WebSocket error occurred"]);
        };

        setWs(socket);

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, []);

    const sendMessage = () => {
        if (ws && ws.readyState === WebSocket.OPEN && inputMessage) {
            ws.send(inputMessage);
            setInputMessage("");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>

            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div
                        className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <span>{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                    }}
                    className="border p-2 mr-2"
                    placeholder="Type a message..."
                    disabled={!isConnected}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={!isConnected}
                >
                    Send
                </button>
            </div>

            <div className="border p-4 rounded">
                <h2 className="font-bold mb-2">Messages:</h2>
                <div className="space-y-2">
                    {messages.map((msg, index) => (
                        <div key={index} className="p-2 bg-gray-100 rounded">
                            {msg}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
