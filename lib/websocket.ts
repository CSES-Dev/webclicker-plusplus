import { Server as HttpServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

// Define connection parameters type
type ConnectionParams = {
    sessionId?: string;
    userId?: string;
};

// Define message types
type StudentResponseMessage = {
    type: "student_response";
    questionId: number;
    optionIds: number[];
};

type ActiveQuestionUpdateMessage = {
    type: "active_question_update";
    questionId: number;
    courseSessionId?: number;
};

type ResponseSavedMessage = {
    type: "response_saved";
    message: string;
    data?: {
        questionId?: number;
        optionIds?: number[];
        originalMessage?: string;
    };
};

type ResponseUpdateMessage = {
    type: "response_update";
    questionId: number;
    responseCount: number;
};

type QuestionChangedMessage = {
    type: "question_changed";
    questionId: number;
};

type ConnectedMessage = {
    type: "connected";
    message: string;
};

type ErrorMessage = {
    type: "error";
    message: string;
};

type TextMessage = {
    type: "text";
    message: string;
};

// Union type for all message types
type WebSocketMessage =
    | StudentResponseMessage
    | ActiveQuestionUpdateMessage
    | ResponseSavedMessage
    | ResponseUpdateMessage
    | QuestionChangedMessage
    | ConnectedMessage
    | ErrorMessage
    | TextMessage;

// Type for unknown parsed data
type UnknownData = Record<string, unknown>;

// Store all active connections
const connections = new Map<string, Map<string, WebSocket>>();

// Function declaration moved to fix "used before defined" error
function broadcastToSession(sessionId: string, message: WebSocketMessage): void {
    const sessConnections = connections.get(sessionId);
    if (!sessConnections) return;

    console.log(`Broadcasting to session ${sessionId}`);

    try {
        // Ensure message is a proper object before stringifying
        const messageObj: WebSocketMessage =
            typeof message === "string"
                ? (JSON.parse(message) as WebSocketMessage) // Convert string to object if it's JSON
                : message; // Use as is if it's already an object

        const messageStr = JSON.stringify(messageObj);

        for (const connection of sessConnections.values()) {
            try {
                connection.send(messageStr);
            } catch (err) {
                console.error("Error sending broadcast to client:", err);
            }
        }
    } catch (error) {
        console.error("Error broadcasting message:", error);

        // Fallback if message isn't valid JSON
        if (typeof message === "string") {
            const fallbackMsg = JSON.stringify({
                type: "text",
                message,
            } as TextMessage);

            for (const connection of sessConnections.values()) {
                try {
                    connection.send(fallbackMsg);
                } catch (err) {
                    console.error("Error sending fallback broadcast:", err);
                }
            }
        }
    }
}

export function initWebSocketServer(server: HttpServer): WebSocketServer {
    const wss = new WebSocketServer({ noServer: true });

    // Handle upgrade requests
    server.on("upgrade", (request: IncomingMessage, socket, head) => {
        try {
            if (!request.url) {
                socket.destroy();
                return;
            }

            const { pathname, searchParams } = new URL(
                request.url,
                `http://${request.headers.host}`,
            );

            if (pathname === "/ws") {
                // For test endpoint - keep this for backward compatibility
                wss.handleUpgrade(request, socket, head, (ws) => {
                    wss.emit("connection", ws, request);
                });
            } else if (pathname === "/ws/poll") {
                // For poll connections
                const sessionId = searchParams.get("sessionId");
                const userId = searchParams.get("userId");

                wss.handleUpgrade(request, socket, head, (ws) => {
                    wss.emit("connection", ws, request, { sessionId, userId });
                });
            } else {
                socket.destroy();
            }
        } catch (error) {
            console.error("Error in WebSocket upgrade:", error);
            socket.destroy();
        }
    });

    // Handle WebSocket connections
    wss.on(
        "connection",
        (ws: WebSocket, request: IncomingMessage, connectionParams: ConnectionParams = {}) => {
            const { sessionId, userId } = connectionParams;

            // Handle test connections
            if (!sessionId && !userId) {
                // FIXED: Always use JSON format for all messages
                ws.send(
                    JSON.stringify({
                        type: "connected",
                        message: "Connected to WebSocket test server",
                    } as ConnectedMessage),
                );

                ws.on("message", (message: Buffer) => {
                    try {
                        // Parse the message to see if it's valid JSON
                        const jsonData = JSON.parse(message.toString()) as UnknownData;

                        // If it is, echo it back with proper JSON response
                        ws.send(
                            JSON.stringify({
                                type: "response_saved",
                                message: "Your message has been received",
                                data: jsonData,
                            } as ResponseSavedMessage),
                        );
                    } catch (_parseError) {
                        // If not valid JSON, still respond with JSON format
                        ws.send(
                            JSON.stringify({
                                type: "response_saved",
                                message: "Your message has been received",
                                data: {
                                    originalMessage: message.toString(),
                                },
                            } as ResponseSavedMessage),
                        );
                    }
                });

                return;
            }

            // Handle poll connections
            console.log(`WebSocket connection: SessionID=${sessionId}, UserID=${userId}`);

            // Store the connection - Check for null/undefined
            if (sessionId && userId) {
                if (!connections.has(sessionId)) {
                    connections.set(sessionId, new Map());
                }
                const sessionConnections = connections.get(sessionId);
                if (sessionConnections) {
                    sessionConnections.set(userId, ws);
                }

                // Send connection confirmation
                ws.send(
                    JSON.stringify({
                        type: "connected",
                        message: "Connected to poll session",
                    } as ConnectedMessage),
                );

                ws.on("message", (message: Buffer) => {
                    try {
                        // Try to parse the message
                        const data = JSON.parse(message.toString()) as UnknownData;

                        // If this is a student response
                        if (data.type === "student_response") {
                            // Type checking and extraction
                            const typedData = data as StudentResponseMessage;
                            const questionId = typedData.questionId;
                            const optionIds = typedData.optionIds;

                            // Validate required fields
                            if (typeof questionId !== "number" || !Array.isArray(optionIds)) {
                                throw new Error("Invalid student_response format");
                            }

                            // Single essential log for student response
                            console.log(
                                `Student response: Session=${sessionId}, Question=${questionId}, Options=${optionIds.join(", ")}`,
                            );

                            // Send confirmation back to student
                            ws.send(
                                JSON.stringify({
                                    type: "response_saved",
                                    message: "Your answer has been recorded",
                                    data: {
                                        questionId,
                                        optionIds,
                                    },
                                } as ResponseSavedMessage),
                            );

                            // Broadcast to all clients in this session that a new response has been received
                            broadcastToSession(sessionId, {
                                type: "response_update",
                                questionId,
                                // We don't have actual counts, but for testing we can just increment
                                responseCount: Math.floor(Math.random() * 20) + 1, // Random count for testing
                            } as ResponseUpdateMessage);
                        }

                        // If instructor is updating the active question
                        else if (data.type === "active_question_update") {
                            // Type checking
                            const typedData = data as ActiveQuestionUpdateMessage;
                            const questionId = typedData.questionId;

                            // Validate required fields
                            if (typeof questionId !== "number") {
                                throw new Error("Invalid active_question_update format");
                            }

                            console.log(`Active question updated: QuestionID=${questionId}`);

                            // Broadcast to all clients in this session
                            broadcastToSession(sessionId, {
                                type: "question_changed",
                                questionId,
                            } as QuestionChangedMessage);
                        }
                    } catch (error) {
                        console.error("Error processing WebSocket message:", error);

                        // Even on error, respond with proper JSON
                        ws.send(
                            JSON.stringify({
                                type: "error",
                                message: "Invalid message format",
                            } as ErrorMessage),
                        );
                    }
                });

                ws.on("error", (error) => {
                    console.error("WebSocket connection error:", error);
                });

                ws.on("close", () => {
                    console.log(`WebSocket connection closed: SessionID=${sessionId}`);

                    // Clean up the connection
                    const localSessionConnections = connections.get(sessionId);
                    if (localSessionConnections) {
                        localSessionConnections.delete(userId);

                        if (localSessionConnections.size === 0) {
                            connections.delete(sessionId);
                        }
                    }
                });
            }
        },
    );

    return wss;
}
