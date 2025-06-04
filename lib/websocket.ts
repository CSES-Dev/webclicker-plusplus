import { Server as HttpServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import prisma from "./prisma";

//  connection parameters
type ConnectionParams = {
    sessionId?: string;
    userId?: string;
};

// Define proper types for WebSocket messages
export type WebSocketMessageType =
    | "connected"
    | "response_saved"
    | "question_changed"
    | "response_update"
    | "error"
    | "echo"
    | "binary"
    | "student_response"
    | "poll_paused"
    | "active_question_update";

export interface WebSocketMessageBase {
    type: WebSocketMessageType;
    message?: string;
}

export interface QuestionChangedMessage extends WebSocketMessageBase {
    type: "question_changed";
    questionId: number;
}

export interface ResponseSavedMessage extends WebSocketMessageBase {
    type: "response_saved";
    message?: string;
    data?: {
        questionId?: number;
        optionIds?: number[];
        originalMessage?: string;
    };
}

export interface StudentResponseMessage extends WebSocketMessageBase {
    type: "student_response";
    questionId: number;
    optionIds: number[];
}

export interface ResponseUpdateMessage extends WebSocketMessageBase {
    type: "response_update";
    questionId: number;
    responseCount: number;
    optionCounts: Record<number, number>;
}

export interface PollPausedMessage extends WebSocketMessageBase {
    type: "poll_paused";
    paused: boolean;
}

export interface ConnectedMessage extends WebSocketMessageBase {
    type: "connected";
}

export interface ErrorMessage extends WebSocketMessageBase {
    type: "error";
}

export interface ActiveQuestionUpdateMessage extends WebSocketMessageBase {
    type: "active_question_update";
    questionId: number;
    courseSessionId?: number;
}

// Union type for all message types
export type WebSocketMessage =
    | QuestionChangedMessage
    | ResponseSavedMessage
    | StudentResponseMessage
    | PollPausedMessage
    | ActiveQuestionUpdateMessage
    | ConnectedMessage
    | ErrorMessage
    | WebSocketMessageBase;

export type StartSessionWebSocketMessage = {
    type: string;
    questionId?: number;
    optionCounts?: Record<number, number>;
    responseCount?: number;
}

type AuthenticatedConnection = {
    userId: string;
    sessionId: string;
    ws: WebSocket;
};

const connections = new Map<string, Map<string, AuthenticatedConnection>>();

async function validateUserSession(userId: string, sessionId: string): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                courses: {
                    where: {
                        course: {
                            sessions: {
                                some: { id: parseInt(sessionId) },
                            },
                        },
                    },
                },
            },
        });
        return !!user && user.courses.length > 0;
    } catch (err) {
        console.error("Error validating user session:", err);
        return false;
    }
}

function broadcastToSession(sessionId: string, message: WebSocketMessage): void {
    const sessConns = connections.get(sessionId);
    if (!sessConns) return;

    const msgStr = JSON.stringify(message);
    for (const { ws } of sessConns.values()) {
        try {
            ws.send(msgStr);
        } catch (err) {
            console.error("Error broadcasting to client:", err);
        }
    }
}

// Add type guard functions
function isStudentResponseMessage(data: unknown): data is StudentResponseMessage {
    return (
        typeof data === "object" &&
        data !== null &&
        "type" in data &&
        data.type === "student_response" &&
        "questionId" in data &&
        typeof data.questionId === "number" &&
        "optionIds" in data &&
        Array.isArray((data as StudentResponseMessage).optionIds)
    );
}

function isActiveQuestionUpdateMessage(data: unknown): data is ActiveQuestionUpdateMessage {
    return (
        typeof data === "object" &&
        data !== null &&
        "type" in data &&
        data.type === "active_question_update" &&
        "questionId" in data &&
        typeof data.questionId === "number"
    );
}

function isPollPausedMessage(data: unknown): data is PollPausedMessage {
    return (
        typeof data === "object" &&
        data !== null &&
        "type" in data &&
        data.type === "poll_paused" &&
        "paused" in data &&
        typeof data.paused === "boolean"
    );
}

export function initWebSocketServer(server: HttpServer): WebSocketServer {
    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
        void (async () => {
            try {
                if (!req.url) return socket.destroy();
                const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);

                if (pathname === "/ws/poll") {
                    const sessionId = searchParams.get("sessionId");
                    const userId = searchParams.get("userId");
                    if (!sessionId || !userId) return socket.destroy();

                    if (!(await validateUserSession(userId, sessionId))) {
                        return socket.destroy();
                    }

                    wss.handleUpgrade(req, socket, head, (ws) => {
                        wss.emit("connection", ws, req, { sessionId, userId });
                    });
                } else {
                    socket.destroy();
                }
            } catch (err) {
                console.error("Upgrade error:", err);
                socket.destroy();
            }
        })();
    });

    wss.on("connection", (ws: WebSocket, _req: IncomingMessage, params: ConnectionParams = {}) => {
        const { sessionId, userId } = params;
        if (!sessionId || !userId) {
            ws.close(1008, "Missing session or user ID");
            return;
        }

        // register
        if (!connections.has(sessionId)) connections.set(sessionId, new Map());
        const sessionConnections = connections.get(sessionId);
        if (sessionConnections) {
            sessionConnections.set(userId, { userId, sessionId, ws });
        }

        // confirm
        ws.send(
            JSON.stringify({
                type: "connected",
                message: "Connected to poll session",
            } as ConnectedMessage),
        );

        ws.on("message", (raw) => {
            void (async () => {
                try {
                    let rawString: string;
                    if (raw instanceof Buffer) {
                        rawString = raw.toString();
                    } else if (typeof raw === "string") {
                        rawString = raw;
                    } else {
                        throw new Error("Unsupported message format");
                    }
                    
                    // Parse and validate the data with unknown type first
                    const parsedData = JSON.parse(rawString) as unknown;

                    // Now use our type guards to safely handle the data
                    if (isStudentResponseMessage(parsedData)) {
                        const { questionId, optionIds } = parsedData;

                        // 1) delete old answers
                        const _deleteResult = await prisma.response.deleteMany({
                            where: { userId, questionId },
                        });
                        console.log(_deleteResult);

                        // 2) bulk insert new answers
                        const _createResult = await prisma.response.createMany({
                            data: optionIds.map((optId) => ({
                                userId,
                                questionId,
                                optionId: optId,
                            })),
                            skipDuplicates: true,
                        });
                        console.log(_createResult);

                        // 3) re-aggregate and broadcast
                        const groups = await prisma.response.groupBy({
                            by: ["optionId"],
                            where: { questionId },
                            _count: { optionId: true },
                        });

                        const optionCounts = groups.reduce<Record<number, number>>((acc, g) => {
                            acc[g.optionId] = g._count.optionId;
                            return acc;
                        }, {});

                        const total = Object.values(optionCounts).reduce((sum, c) => sum + c, 0);

                        // confirmation
                        ws.send(
                            JSON.stringify({
                                type: "response_saved",
                                message: "Your answer has been recorded",
                                data: { questionId, optionIds },
                            } as ResponseSavedMessage),
                        );

                        // broadcast update
                        broadcastToSession(sessionId, {
                            type: "response_update",
                            questionId,
                            responseCount: total,
                            optionCounts,
                        } as ResponseUpdateMessage);
                    } else if (isActiveQuestionUpdateMessage(parsedData)) {
                        console.log("Broadcasting question change:", parsedData.questionId);
                        // Ensure all clients get the question change notification
                        const message: QuestionChangedMessage = {
                            type: "question_changed",
                            questionId: parsedData.questionId,
                        };
                        broadcastToSession(sessionId, message);
                    } else if (isPollPausedMessage(parsedData)) {
                        broadcastToSession(sessionId, { type: "poll_paused", paused: parsedData.paused });
                    } else {
                        console.warn("Received unhandled message type:", parsedData);
                        ws.send(
                            JSON.stringify({
                                type: "error",
                                message: "Unhandled message type",
                            } as ErrorMessage),
                        );
                    }
                } catch (err) {
                    console.error("WS message error:", err);
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            message: "Invalid message format",
                        } as ErrorMessage),
                    );
                }
            })();
        });

        ws.on("close", () => {
            const sessConns = connections.get(sessionId);
            if (sessConns) {
                sessConns.delete(userId);
                if (sessConns.size === 0) connections.delete(sessionId);
            }
        });

        ws.on("error", (e) => {
            console.error("WS error:", e);
        });
    });

    return wss;
}
