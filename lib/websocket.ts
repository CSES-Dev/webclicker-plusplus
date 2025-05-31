import { Server as HttpServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import prisma from "./prisma";

//  connection parameters
type ConnectionParams = {
    sessionId?: string;
    userId?: string;
};

//  message
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
    optionCounts: Record<number, number>;
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

type PausePollMessage = {
    type: "pause_poll";
    paused: boolean;
};

type WebSocketMessage =
    | StudentResponseMessage
    | ActiveQuestionUpdateMessage
    | ResponseSavedMessage
    | ResponseUpdateMessage
    | QuestionChangedMessage
    | ConnectedMessage
    | ErrorMessage
    | TextMessage
    | PausePollMessage
    | { type: "poll_paused"; paused: boolean };

type UnknownData = Record<string, unknown>;

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

export function initWebSocketServer(server: HttpServer): WebSocketServer {
    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", async (req, socket, head) => {
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
    });

    wss.on("connection", (ws: WebSocket, _req: IncomingMessage, params: ConnectionParams = {}) => {
        const { sessionId, userId } = params;
        if (!sessionId || !userId) {
            ws.close(1008, "Missing session or user ID");
            return;
        }

        // register
        if (!connections.has(sessionId)) connections.set(sessionId, new Map());
        connections.get(sessionId)!.set(userId, { userId, sessionId, ws });

        // confirm
        ws.send(
            JSON.stringify({
                type: "connected",
                message: "Connected to poll session",
            } as ConnectedMessage),
        );

        ws.on("message", async (raw) => {
            try {
                const data = JSON.parse(raw.toString()) as UnknownData;

                if (data.type === "student_response") {
                    const { questionId, optionIds } = data as StudentResponseMessage;

                    if (typeof questionId !== "number" || !Array.isArray(optionIds)) {
                        throw new Error("Invalid student_response format");
                    }

                    // 1) delete old answers
                    const deleteResult = await prisma.response.deleteMany({
                        where: { userId, questionId },
                    });

                    // 2) bulk insert new answers
                    const createResult = await prisma.response.createMany({
                        data: optionIds.map((optId) => ({
                            userId,
                            questionId,
                            optionId: optId,
                        })),
                        skipDuplicates: true,
                    });

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
                } else if (data.type === "active_question_update") {
                    const { questionId } = data as ActiveQuestionUpdateMessage;
                    broadcastToSession(sessionId, {
                        type: "question_changed",
                        questionId,
                    } as QuestionChangedMessage);
                } else if (data.type === "pause_poll") {
                    const { paused } = data as PausePollMessage;
                    broadcastToSession(sessionId, { type: "poll_paused", paused });
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
        });

        ws.on("close", () => {
            const sessConns = connections.get(sessionId)!;
            sessConns.delete(userId);
            if (sessConns.size === 0) connections.delete(sessionId);
        });

        ws.on("error", (e) => {
            console.error("WS error:", e);
        });
    });

    return wss;
}
