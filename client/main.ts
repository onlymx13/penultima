"use strict";
import {Gamer, MIN_GAMER_COUNT} from "../include/include.js";
import {Color, Piece, PieceType, AbsolutePosition, RelativePosition} from "../include/pieces.js";
const RANK_COUNT = 8;
const FILE_COUNT = 8;
const CELL_SIZE = "50px";

const glyphs: Map<Color, Map<PieceType, string>> = new Map([
    [Color.White, new Map([
	    [PieceType.King, "\u2654"],
	    [PieceType.Queen, "\u2655"],
	    [PieceType.Rook, "\u2656"],
    	[PieceType.Bishop, "\u2657"],
    	[PieceType.Knight, "\u2658"],
    	[PieceType.Pawn, "\u2659"],
    ])],
    [Color.Black, new Map([
    	[PieceType.King, "\u265A"],
    	[PieceType.Queen, "\u265B"],
    	[PieceType.Rook, "\u265C"],
    	[PieceType.Bishop, "\u265D"],
    	[PieceType.Knight, "\u265E"],
    	[PieceType.Pawn, "\u265F"],
    ])],
]);

const blackSquareColor = "rgb(96, 64, 16)";
const whiteSquareColor = "rgb(208, 160, 80)";
const highlightedBlackSquareColor = "rgb(96, 64, 255)";
const highlightedWhiteSquareColor = "rgb(208, 160, 255)";

function absToRelPos(abspos: AbsolutePosition, player: Color): RelativePosition {
    // Absolute position uses ranks 1-8 and files 1-8 using White's bottom left square as (1, 1).
    // Relative position uses ranks and files 0-7 with the current player's top left square as (0, 0).
    if (player === Color.White) {
        return {x: abspos.file - 1, y: 8 - abspos.rank};
    } else {
        return {x: 8 - abspos.file, y: abspos.rank - 1};
    }
}

function relToAbsPos(relpos: RelativePosition, player: Color): AbsolutePosition {
    if (player === Color.White) {
        return {rank: 8 - relpos.y, file: relpos.x + 1};
    } else {
        return {rank: relpos.y + 1, file: 8 - relpos.x};
    }
}

declare var io: () => any;
const socket = io();

const helpButton = document.getElementById("help-button");
const helpText = document.getElementById("help");
if (helpText) {
    helpButton?.addEventListener("click", (event: MouseEvent) => {
        event.preventDefault();
        helpText.hidden = !helpText.hidden;
    });
}

socket.on("too few players", (playerCount: number) => {
    alert(`Bruh, everyone disconnected except ${playerCount} players. What noobs. Literally, just refresh the page. I'm too lazy to code this.`);
});

const startGameButton = document.getElementById("start-game");
socket.on("first player", () => {
    startGameButton!.style.display = "block";
    startGameButton?.addEventListener("click", (event: MouseEvent) => {
        socket.emit("start game");
    });
});

const undoButton = document.getElementById("undo-button");
(<HTMLButtonElement>undoButton)!.disabled = true;
undoButton?.addEventListener("click", (event: MouseEvent) => {
    socket.emit("undo");
});

socket.on("not enough players", (playerCount: number) => {
    alert(`Not enough players to start the game (have ${playerCount}, need ${MIN_GAMER_COUNT})`);
});

let myColor: Color;
let firstSquare: AbsolutePosition = {rank: 1, file: 1};
let pickingSecondSquare = false;

socket.on("you are", (playerType: Gamer, otherPlayer?: number, color?: Color) => {
    startGameButton!.style.display = "none";
    if (playerType === Gamer.Spectator) {
        console.log("spec");
        undoButton!.hidden = false;
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
        myColor = Color.White; //TODO: Allow spectators to flip the board whenever they want
    } else {
    	console.log("player");
        if (color !== undefined) // prevent error. Find a better way to do this, as I know color is always defined when it gets here.
            myColor = color;
    }
    // Set up chessboard
    const table = document.getElementById("chessboard");
    for (let i = 0; i < RANK_COUNT; i++) {
        const row = document.createElement("tr");
        const rankLabel = document.createElement("td");
        rankLabel.classList.add("rank-label");
        if (myColor === Color.White) {
            rankLabel.textContent = String(8 - i);
        } else {
            rankLabel.textContent = String(i + 1);
        }
        row.appendChild(rankLabel);
        for (let j = 0; j < FILE_COUNT; j++) {
            const cell = document.createElement("td");
            cell.classList.add("cell");
            cell.id = `cell${j},${i}`; // relative position
	        cell.style.backgroundColor = (i + j) % 2 ? blackSquareColor : whiteSquareColor;
            cell.style.height = CELL_SIZE;
	        cell.style.width = CELL_SIZE;
            const listener = cell.addEventListener("click", (event: MouseEvent) => {
                if (pickingSecondSquare) {
                    const firstPos = absToRelPos(firstSquare, myColor);
                    const newPos = {x: Number(cell.id.slice(4, 5)), y: Number(cell.id.slice(6, 7))};
                    const oldCell = document.getElementById("cell" + firstPos.x + "," + firstPos.y);
                    if (oldCell)
                       oldCell.style.backgroundColor = oldCell?.style.backgroundColor === highlightedBlackSquareColor ? blackSquareColor : whiteSquareColor;
                    if (newPos.x !== firstPos.x || newPos.y !== firstPos.y) { // Don't move a piece to the same square it's on.
                        socket.emit("move", firstSquare, relToAbsPos(newPos, myColor));
                    }
                    pickingSecondSquare = false;
                } else {
                    cell.style.backgroundColor = cell.style.backgroundColor === blackSquareColor ? highlightedBlackSquareColor : highlightedWhiteSquareColor;
                    firstSquare = relToAbsPos({x: Number(cell.id.slice(4, 5)), y: Number(cell.id.slice(6, 7))}, myColor);
                    pickingSecondSquare = true;
                }
            });
	        row.appendChild(cell);
        }
        table?.appendChild(row);
    }
    const row = document.createElement("tr");
    row.appendChild(document.createElement("td")); // bottom left corner has no label
    for (let i = 0; i < FILE_COUNT; i++) {
        const fileLabel = document.createElement("td");
        fileLabel.classList.add("file-label");
        fileLabel.textContent = "abcdefgh"[i];
        row.appendChild(fileLabel);
    }
    table?.appendChild(row);
    table!.style.display = "table";
});



socket.on("update pieces", (pieces : Piece[], undoAllowed : boolean) => {
    (<HTMLButtonElement>undoButton)!.disabled = !undoAllowed;
    for (let cell of document.getElementsByClassName("cell")) {
        cell.textContent = "";
    }
    for (let piece of pieces) {
        const pos = absToRelPos(piece.position, myColor);
        const cell = document.getElementById(`cell${pos.x},${pos.y}`);
        if (cell) {
            cell.textContent = glyphs.get(piece.color)?.get(piece.type) || "";
        }
    }
});
