"use strict";
import {Gamer, MIN_GAMER_COUNT} from "../include/include.js";
import express from "express";
const app = express();
import {createServer} from "http";
const httpServer = createServer(app);
import {Server, Socket} from "socket.io";
const io = new Server(httpServer);
import fs from "fs";

app.use("/client/main.js", express.static("build/client/main.js"));
app.use("/style.css", express.static("build/client/style.css"));
app.use("/include/include.js", express.static("build/include/include.js"));
app.get('/', (req: any, res: any) => {
    res.sendFile("./client/index.html", { root: '.' });
});

io.on("connection", (socket: Socket) => {
    console.log("a gamer connected :)");
    if (io.sockets.sockets.size === 1) {
        socket.emit("first player");
    }
    socket.on('disconnect', () => {
        console.log("a gamer disconnected :(");
	if (io.sockets.sockets.size < MIN_GAMER_COUNT) {
            io.emit("too few players", io.sockets.sockets.size);
	}
    });
    socket.on("spectator message", (content: string) => {
        io.emit("spectator message", content);
    });
    socket.on("start game", () => {
        if (io.sockets.sockets.size >= MIN_GAMER_COUNT) { // Don't start game with too few players
            console.log("Starting game!");
            const playerOneIndex = Math.floor(Math.random() * io.sockets.sockets.size);
            let playerTwoIndex;
            do {
                playerTwoIndex = Math.floor(Math.random() * io.sockets.sockets.size);
            } while (playerTwoIndex === playerOneIndex);
            let playerOneId = "", playerTwoId = "";
            let i = 0;
            for (let key of io.sockets.sockets.keys()) {
                if (i === playerOneIndex) {
                    playerOneId = io.sockets.sockets.get(key)!.id;
                } else if (i === playerTwoIndex) {
                    playerTwoId = io.sockets.sockets.get(key)!.id;
                } else {
                    io.to(io.sockets.sockets.get(key)!.id).emit("you are", Gamer.Spectator);
                }
                i++;
            }
            io.to(playerOneId).emit("you are", Gamer.Player, playerTwoId);
            io.to(playerTwoId).emit("you are", Gamer.Player, playerOneId);
            //io.emit("Spectators discussion time", io.sockets.sockets.size);
        } else {
            socket.emit("not enough players", io.sockets.sockets.size);
        }
    });
});

httpServer.listen(3000, () => {
    console.log("listening on *:3000");
});