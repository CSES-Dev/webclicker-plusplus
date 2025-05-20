import { WebSocketServer } from "ws";

// Store all active connections
const connections = new Map();

export function initWebSocketServer(server) {
    const wss = new WebSocketServer({ noServer: true });

    // Handle upgrade requests
    server.on("upgrade", (request, socket, head) => {
        try {
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
    wss.on("connection", (ws, request, connectionParams = {}) => {
        const { sessionId, userId } = connectionParams;

        // Handle test connections
        if (!sessionId && !userId) {
            console.log("Test WebSocket connection established");

            // FIXED: Always use JSON format for all messages
            ws.send(
                JSON.stringify({
                    type: "connected",
                    message: "Connected to WebSocket test server",
                }),
            );

            ws.on("message", (message) => {
                console.log("Test message received:", message.toString());

                // Try to parse as JSON first
                // Replace both parts in your websocket.js file with this version:

                try {
                    // Parse the message to see if it's valid JSON
                    const jsonData = JSON.parse(message.toString());

                    // If it is, echo it back with proper JSON response
                    ws.send(
                        JSON.stringify({
                            type: "response_saved", // Change this from 'echo' to 'response_saved'
                            message: "Your message has been received",
                            data: jsonData,
                        }),
                    );
                } catch (e) {
                    // If not valid JSON, still respond with JSON format
                    ws.send(
                        JSON.stringify({
                            type: "response_saved", // Change this from 'echo' to 'response_saved'
                            message: "Your message has been received",
                            data: {
                                originalMessage: message.toString(),
                            },
                        }),
                    );
                }
            });

            return;
        }

        // Handle poll connections
        console.log(
            `Poll WebSocket connection established: SessionID=${sessionId}, UserID=${userId}`,
        );

        // Store the connection
        if (!connections.has(sessionId)) {
            connections.set(sessionId, new Map());
        }
        const sessionConnections = connections.get(sessionId);
        sessionConnections.set(userId, ws);

        // Send connection confirmation
        ws.send(
            JSON.stringify({
                type: "connected",
                message: "Connected to poll session",
            }),
        );

        ws.on("message", (message) => {
            try {
                // Log the raw message first
                console.log("Raw message received:", message.toString());

                // Try to parse the message
                const data = JSON.parse(message.toString());

                // Log all incoming messages to terminal
                console.log("\n===== STUDENT RESPONSE =====");
                console.log("Session ID:", sessionId);
                console.log("User ID:", userId);
                console.log("Message Data:", data);
                console.log("===========================\n");

                // If this is a student response
                if (data.type === "student_response") {
                    // Extract the data
                    const { questionId, optionIds } = data;

                    // Log to console for testing
                    console.log(
                        `Student response received: QuestionID=${questionId}, OptionIDs=${optionIds.join(", ")}`,
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
                        }),
                    );

                    // Broadcast to all clients in this session that a new response has been received
                    broadcastToSession(sessionId, {
                        type: "response_update",
                        questionId,
                        // We don't have actual counts, but for testing we can just increment
                        responseCount: Math.floor(Math.random() * 20) + 1, // Random count for testing
                    });
                }

                // If instructor is updating the active question
                else if (data.type === "active_question_update") {
                    console.log(`Active question updated: QuestionID=${data.questionId}`);

                    // Broadcast to all clients in this session
                    broadcastToSession(sessionId, {
                        type: "question_changed",
                        questionId: data.questionId,
                    });
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);

                // Even on error, respond with proper JSON
                ws.send(
                    JSON.stringify({
                        type: "error",
                        message: "Invalid message format",
                    }),
                );
            }
        });

        ws.on("error", (error) => {
            console.error("WebSocket connection error:", error);
        });

        ws.on("close", () => {
            console.log(`WebSocket connection closed: SessionID=${sessionId}, UserID=${userId}`);

            // Clean up the connection
            if (sessionId && userId) {
                const sessionConnections = connections.get(sessionId);
                if (sessionConnections) {
                    sessionConnections.delete(userId);

                    if (sessionConnections.size === 0) {
                        connections.delete(sessionId);
                    }
                }
            }
        });
    });

    return wss;
}

// Function to broadcast a message to all connections in a session
function broadcastToSession(sessionId, message) {
    const sessionConnections = connections.get(sessionId);
    if (!sessionConnections) return;

    console.log(`Broadcasting to session ${sessionId}:`, message);

    try {
        // Ensure message is a proper object before stringifying
        const messageObj =
            typeof message === "string"
                ? JSON.parse(message) // Convert string to object if it's JSON
                : message; // Use as is if it's already an object

        const messageStr = JSON.stringify(messageObj);

        for (const connection of sessionConnections.values()) {
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
                message: message,
            });

            for (const connection of sessionConnections.values()) {
                try {
                    connection.send(fallbackMsg);
                } catch (err) {
                    console.error("Error sending fallback broadcast:", err);
                }
            }
        }
    }
}
