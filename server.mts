import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handle);
    const io = new Server(httpServer);

    // Video Call Rooms Tracking
    const videoRooms: { [roomId: string]: string[]; } = {};

    io.on("connection", (socket) => {
        console.log(`User Connected: ${socket.id}`);

        // Existing chat room logic
        socket.on("join-room", ({ room, username }) => {
            socket.join(room);
            console.log(`User ${username} joined room ${room}`);
            socket.to(room).emit("user-joined", `${username} joined room`);
        });

        socket.on("message", ({ room, message, sender }) => {
            console.log(`Message from ${sender} in room ${room}: ${message}`);
            socket.to(room).emit("message", { sender, message });
        });

        // WebRTC Video Call Signaling
        socket.on("join-video-room", ({ roomId, username }) => {
            // Limit room to 10 participants
            if (!videoRooms[roomId]) {
                videoRooms[roomId] = [];
            }

            if (videoRooms[roomId].length < 10) {
                videoRooms[roomId].push(socket.id);
                socket.join(roomId);

                // Broadcast to others in the room
                socket.to(roomId).emit("new-peer", {
                    peerId: socket.id,
                    username
                });
            } else {
                socket.emit("room-full", { roomId });
            }
        });

        // WebRTC Signaling Events
        socket.on("offer", (data) => {
            socket.to(data.to).emit("offer", {
                offer: data.offer,
                from: socket.id
            });
        });

        socket.on("answer", (data) => {
            socket.to(data.to).emit("answer", {
                answer: data.answer,
                from: socket.id
            });
        });

        socket.on("ice-candidate", (data) => {
            socket.to(data.to).emit("ice-candidate", {
                candidate: data.candidate,
                from: socket.id
            });
        });

        socket.on("leave-video-room", ({ roomId }) => {
            if (videoRooms[roomId]) {
                videoRooms[roomId] = videoRooms[roomId].filter(id => id !== socket.id);
                socket.to(roomId).emit("peer-left", { peerId: socket.id });
                socket.leave(roomId);
            }
        });

        socket.on("disconnect", () => {
            // Clean up video rooms on disconnect
            for (const roomId in videoRooms) {
                videoRooms[roomId] = videoRooms[roomId].filter(id => id !== socket.id);
                socket.to(roomId).emit("peer-left", { peerId: socket.id });
            }
            console.log(`User Disconnected ${socket.id}`);
        });
    });

    httpServer.listen(port, () => { });
});
