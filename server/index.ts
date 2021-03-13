"use strict";
import {Gamer, MIN_GAMER_COUNT} from "../include/include.js";
import {Color, Piece, defaultPieces, AbsolutePosition} from "../include/pieces.js";
import express from "express";
const app = express();
import {createServer} from "http";
const httpServer = createServer(app);
import {Server, Socket} from "socket.io";
const io = new Server(httpServer);

app.use("/client/main.js", express.static("build/client/main.js"));
app.use("/style.css", express.static("build/client/style.css"));
app.use("/include/include.js", express.static("build/include/include.js"));
app.use("/include/pieces.js", express.static("build/include/pieces.js"));
app.get('/', (req: any, res: any) => {
    res.sendFile("./client/index.html", { root: '.' });
});

var undoTree : Piece[][] = []; // smh, it's 1D and not a tree
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
    if (io.sockets.sockets.size === 0) {
        // Reset the game state entirely.
        undoTree = [];
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
            let whitePlayerId = "", blackPlayerId = "";
            let i = 0;
            for (let key of io.sockets.sockets.keys()) {
                if (i === playerOneIndex) {
                    whitePlayerId = io.sockets.sockets.get(key)!.id;
                } else if (i === playerTwoIndex) {
                    blackPlayerId = io.sockets.sockets.get(key)!.id;
                } else {
                    io.to(io.sockets.sockets.get(key)!.id).emit("you are", Gamer.Spectator);
                }
                i++;
            }
            io.to(whitePlayerId).emit("you are", Gamer.Player, blackPlayerId, Color.White);
            io.to(blackPlayerId).emit("you are", Gamer.Player, whitePlayerId, Color.Black);
        } else {
            socket.emit("not enough players", io.sockets.sockets.size);
        }
        undoTree[0] = defaultPieces;
        io.emit("update pieces", undoTree[0], false);
    });
    socket.on("move", (source: AbsolutePosition, dest: AbsolutePosition) => {
        if (undoTree[undoTree.length - 1] !== undefined) {
            undoTree.push(JSON.parse(JSON.stringify(undoTree[undoTree.length - 1]))); // Duplicate the last element, and now we'll modify it. Use JSON to avoid copying by reference.
        } else {
            console.log(undoTree);
            return;
        }
        // Pass 1: Capture
        //! clicking an empty square, then a filled square will remove the piece. Maybe pass this off as a "feature"?
        for (let i = 0; i < undoTree[undoTree.length - 1].length; i++) {
            if (undoTree[undoTree.length - 1][i].position.file === dest.file && undoTree[undoTree.length - 1][i].position.rank === dest.rank) {
                undoTree[undoTree.length - 1].splice(i--, 1); // Remove any piece on the destination square (capture)
                break; // Assume only one piece can be on that square, and capture only that one.
            }
        }
        // Pass 2: Move
        for (let i = 0; i < undoTree[undoTree.length - 1].length; i++) {
            if (undoTree[undoTree.length - 1][i].position.file === source.file && undoTree[undoTree.length - 1][i].position.rank === source.rank) {
                undoTree[undoTree.length - 1][i].position = dest;  
                break;
            }
        }
        io.emit("update pieces", undoTree[undoTree.length - 1], undoTree.length > 1);
    });
    socket.on("place", (piece: Piece) => {
        for (let i = 0; i < undoTree[undoTree.length - 1].length; i++) {
            if (undoTree[undoTree.length - 1][i].position.file === piece.position.file && undoTree[undoTree.length - 1][i].position.rank === piece.position.rank) {
                // If another piece is where this piece would go, do nothing.
                return;
            }
        }
        if (undoTree[undoTree.length - 1] !== undefined) {
            undoTree.push(JSON.parse(JSON.stringify(undoTree[undoTree.length - 1]))); // Duplicate the last element, and now we'll modify it. Use JSON to avoid copying by reference.
        } else {
            console.log(undoTree);
        }
        undoTree[undoTree.length - 1].push(piece);
        io.emit("update pieces", undoTree[undoTree.length - 1], undoTree.length > 1);
    });
    socket.on("undo", () => {
        if (undoTree.length > 1) {
            undoTree.pop();
            io.emit("update pieces", undoTree[undoTree.length - 1], undoTree.length > 1);
        }
    });
});

httpServer.listen(process.env.PORT || 3000, () => {
    console.log(`listening on port ${process.env.PORT || 3000}`);
});
