import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(handle);
    const io = new Server(server);

    type GuestInfo = { name?: string; image?: string | null };
    type Room = { name: string; host: string; guests: Map<string, GuestInfo> };
    type JoinPayload = string | { code: string; name?: string; image?: string | null };

    const rooms = new Map<string, Room>();

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
                guests: new Map(),
            });
            socket.join(roomCode);
            console.log(`Room created: ${roomCode} - ${roomName}`);
            callback(roomCode);
        });

        socket.on("room:join", (payload: JoinPayload, callback) => {
            const ack = typeof callback === "function" ? callback : undefined;

            let roomCode: string | undefined;
            let guestName: string | undefined;
            let guestImage: string | null | undefined;

            if (typeof payload === "string") {
                roomCode = payload;
            } else if (payload && typeof payload === "object") {
                const record = payload as Record<string, unknown>;
                const maybeCode = record.code ?? record.roomCode;
                roomCode = typeof maybeCode === "string" ? maybeCode : undefined;
                guestName = typeof record.name === "string" ? record.name : undefined;
                const img = record.image;
                guestImage = typeof img === "string" ? img : img === null ? null : undefined;
            }

            if (!roomCode) {
                console.log(`Join request with invalid payload from ${socket.id}`, payload);
                ack?.({ success: false, error: "Invalid join payload" });
                return;
            }

            console.log(`Join request for room ${roomCode} from ${socket.id}`);
            const room = rooms.get(roomCode);
            if (!room) {
                ack?.({ success: false, error: "Room not found" });
                return;
            }
            if(socket.id !== room.host) {
                const existing = room.guests.get(socket.id) ?? {};
                const merged = { ...existing } as { name?: string; image?: string | null };
                if (typeof guestName === "string" && guestName.trim()) {
                    merged.name = guestName;
                }
                if (guestImage !== undefined) {
                    merged.image = guestImage;
                }
                room.guests.set(socket.id, merged);
            }
            
            socket.join(roomCode);
            
            io.to(roomCode).emit("room:guests:update", {
                count: room.guests.size,
                guests: Array.from(room.guests.entries()).map(([id, info]) => ({
                    id,
                    name: info.name,
                    image: info.image ?? null,
                })),
            });
            
            ack?.({ success: true, room: { name: room.name, guestCount: room.guests.size } });
            console.log(`Guest joined room ${roomCode}: ${socket.id}`);
        });

        socket.on("room:info", (roomCode: string, callback) => {
            console.log(`Info request for room ${roomCode} from ${socket.id}`);
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
                if (room.host === socket.id) {
                    rooms.delete(roomCode);
                    io.to(roomCode).emit("room:closed", { reason: "host_disconnected" });
                    io.in(roomCode).socketsLeave(roomCode);
                    console.log(`Room deleted (host left): ${roomCode}`);
                    return;
                }

                if (room.guests.has(socket.id)) {
                    room.guests.delete(socket.id);
                    socket.leave(roomCode);

                    io.to(roomCode).emit("room:guests:update", {
                        count: room.guests.size,
                        guests: Array.from(room.guests.entries()).map(([id, info]) => ({
                            id,
                            name: info.name,
                            image: info.image ?? null,
                        })),
                    });
                }
            });
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`> Server listening on http://localhost:${PORT}`);
    });
});