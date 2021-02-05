"use strict";
import {Gamer, MIN_GAMER_COUNT} from "../include/include.js";
const RANK_COUNT = 8;
const FILE_COUNT = 8;
const CELL_SIZE = "30px";
enum Color {
    White,
    Black,
}
enum Piece {
    King,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,
}
const glyphs: Map<Color, Map<Piece, string>> = new Map([
    [Color.White, new Map([
	    [Piece.King, "\u2654"],
	    [Piece.Queen, "\u2655"],
	    [Piece.Rook, "\u2656"],
    	[Piece.Bishop, "\u2657"],
    	[Piece.Knight, "\u2658"],
    	[Piece.Pawn, "\u2659"],
    ])],
    [Color.Black, new Map([
    	[Piece.King, "\u265A"],
    	[Piece.Queen, "\u265B"],
    	[Piece.Rook, "\u265C"],
    	[Piece.Bishop, "\u265D"],
    	[Piece.Knight, "\u265E"],
    	[Piece.Pawn, "\u265F"],
    ])],
]);

declare var io: () => any;
const socket = io();

socket.on("too few players", (playerCount: number) => {
    alert(`Bruh, everyone disconnected except ${playerCount} players. What noobs. Literally, just refresh the page. I'm too lazy to code this.`);
});

const startGameButton = document.getElementById("start-game");
socket.on("first player", () => {
    startGameButton!.hidden = false;
    startGameButton?.addEventListener("click", (event: MouseEvent) => {
        socket.emit("start game");
    });
});

socket.on("not enough players", (playerCount: number) => {
    alert(`Not enough players to start the game (have ${playerCount}, need ${MIN_GAMER_COUNT})`);
});

socket.on("you are", (playerType: Gamer, otherPlayer?: number) => {
    startGameButton!.hidden = true;
    if (playerType === Gamer.Spectator) {
        console.log("spec");
        const messageForm = document.getElementById("message-form");
        const messageInput = document.getElementById("message-input");
        const messages = document.getElementById("messages");
        document.getElementById("spectator-chat")!.hidden = false;
        messageForm?.addEventListener("submit", event => {
            event.preventDefault();
            if ((<HTMLInputElement>messageInput)?.value) {
                socket.emit("spectator message", (<HTMLInputElement>messageInput).value);
                (<HTMLInputElement>messageInput).value = '';
            }
        });
        socket.on("spectator message", (content: string) => {
            const li = document.createElement("li");
            li.textContent = content;
            messages?.appendChild(li);
            window.scrollTo(0, document.body.scrollHeight);
        });
    } else {
    	console.log("player");
    }
});

// Set up chessboard
const table = document.getElementById("chessboard");
for (let i = 0; i < RANK_COUNT; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < FILE_COUNT; j++) {
        let cell = document.createElement("td");
	    cell.style.backgroundColor = (i + j) % 2 ? "#000000" : "#FFFFFF";
        cell.style.height = CELL_SIZE;
	    cell.style.width = CELL_SIZE;
	    row.appendChild(cell);
    }
    table?.appendChild(row);
}
