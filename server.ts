import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(handle);
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("a user connected");

        socket.on("ping", (callback) => {
            callback();
        });

        socket.on("peers:count:request", () => {
            const connectedClients = io.engine.clientsCount;
            socket.emit("peers:count", connectedClients);
        });

        io.emit("peers:count", io.engine.clientsCount);

        socket.on("disconnect", () => {
            io.emit("peers:count", io.engine.clientsCount);
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`> Server listening on http://localhost:${PORT}`);
    });
});