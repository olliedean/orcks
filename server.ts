import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(handle);
    const io = new Server(server);

    const rooms = new Map<string, { name: string; host: string; guests: Set<string> }>();

    function generateRoomCode(): string {
        const bytes = new Uint8Array(4);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }

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

        socket.on("room:create", (roomName: string, callback) => {
            const roomCode = generateRoomCode();
            rooms.set(roomCode, {
                name: roomName,
                host: socket.id,
                guests: new Set([]),
            });
            socket.join(roomCode);
            console.log(`Room created: ${roomCode} - ${roomName}`);
            callback(roomCode);
        });

        socket.on("room:join", (roomCode: string, callback) => {
            const room = rooms.get(roomCode);
            if (!room) {
                callback({ success: false, error: "Room not found" });
                return;
            }
            room.guests.add(socket.id);
            socket.join(roomCode);
            
            // Notify everyone in the room
            io.to(roomCode).emit("room:guests:update", {
                count: room.guests.size,
                guests: Array.from(room.guests),
            });
            
            callback({ success: true, room: { name: room.name, guestCount: room.guests.size } });
            console.log(`Guest joined room ${roomCode}: ${socket.id}`);
        });

        socket.on("room:info", (roomCode: string, callback) => {
            const room = rooms.get(roomCode);
            if (!room) {
                callback({ success: false, error: "Room not found" });
                return;
            }
            callback({
                success: true,
                room: {
                    name: room.name,
                    guestCount: room.guests.size,
                    isHost: room.host === socket.id,
                },
            });
        });

        socket.on("disconnect", () => {
            io.emit("peers:count", io.engine.clientsCount);
            
            rooms.forEach((room, roomCode) => {
                if (room.guests.has(socket.id)) {
                    room.guests.delete(socket.id);
                    socket.leave(roomCode);
                    if (room.guests.size === 0) {
                        rooms.delete(roomCode);
                        console.log(`Room deleted: ${roomCode}`);
                    } else {
                        io.to(roomCode).emit("room:guests:update", {
                            count: room.guests.size,
                            guests: Array.from(room.guests),
                        });
                    }
                }
            });
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`> Server listening on http://localhost:${PORT}`);
    });
});