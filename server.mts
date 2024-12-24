import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler()
app.prepare().then(() => {
    const httpServer = createServer(handle)
    const io = new Server(httpServer)
    io.on("connection",(socket) => {
        console.log(`User Connected: ${socket.id}`);
        
        socket.on("join-room",({room, username}) => {
            socket.join(room);
            console.log(`User ${username} joined room ${room}`);
            socket.to(room).emit("user-joined", `${username} joined room`);
        })

        socket.on("message",({room, message, sender}) => {
            console.log(`Message from ${sender} in room ${room}: ${message}`);
            socket.to(room).emit("message", {sender, message});
        })
        
        socket.on("disconnect",() => {
            console.log(`User Disconnected ${socket.id}`);
        })
    })
        
    httpServer.listen(port,() => {
        
    })
})
