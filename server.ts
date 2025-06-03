import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initWebSocketServer } from "./lib/websocket";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

void app
    .prepare()
    .then(() => {
        const server = createServer((req, res) => {
            // Fix for no-non-null-assertion: Add check for req.url
            const parsedUrl = req.url ? parse(req.url, true) : null;

            // Handle case when parsedUrl is null
            if (!parsedUrl) {
                res.writeHead(400);
                res.end("Bad Request: Missing URL");
                return;
            }

            // Let the WebSocket server handle WebSocket requests
            if (parsedUrl.pathname?.startsWith("/ws")) {
                res.writeHead(426);
                res.end();
                return;
            }

            void handle(req, res, parsedUrl);
        });

        // Initialize WebSocket server
        const _wss = initWebSocketServer(server);

        // Fix for no-floating-promises: Add void operator to indicate promise is intentionally not awaited
        void server.listen(3000, () => {
            console.log("> Ready on http://localhost:3000");
        });
    })
    .catch((error: unknown) => {
        console.error("Error preparing Next.js app:", error);
        process.exit(1);
    });
