"use strict";

export enum Color {
    White,
    Black,
}
export enum PieceType {
    King,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,
}

export interface AbsolutePosition {
    rank: number; // 1-indexed, 1-8
    file: number; // 1-indexed, 1-8
}

export interface RelativePosition {
    x: number; // 0-indexed, 0-7
    y: number; // 0-indexed, 0-7
}

export interface Piece {
    color: Color;
    type: PieceType;
    position: AbsolutePosition;
}

export const defaultPieces: Piece[] = [
    // This is the default state of a chessboard in vanilla chess. Maybe add support for changing this if the custom rules require it.
    {color: Color.White, type: PieceType.Rook,   position: {rank: 1, file: 1}},
    {color: Color.White, type: PieceType.Knight, position: {rank: 1, file: 2}},
    {color: Color.White, type: PieceType.Bishop, position: {rank: 1, file: 3}},
    {color: Color.White, type: PieceType.Queen,  position: {rank: 1, file: 4}},
    {color: Color.White, type: PieceType.King,   position: {rank: 1, file: 5}},
    {color: Color.White, type: PieceType.Bishop, position: {rank: 1, file: 6}},
    {color: Color.White, type: PieceType.Knight, position: {rank: 1, file: 7}},
    {color: Color.White, type: PieceType.Rook,   position: {rank: 1, file: 8}},

    {color: Color.White, type: PieceType.Pawn,   position: {rank: 2, file: 1}},
    {color: Color.White, type: PieceType.Pawn,   position: {rank: 2, file: 2}},
    {color: Color.White, type: PieceType.Pawn,   position: {rank: 2, file: 3}},
    {color: Color.White, type: PieceType.Pawn,   position: {rank: 2, file: 4}},
    {color: Color.White, type: PieceType.Pawn,   position: {rank: 2, file: 5}},
    {color: Color.White, type: PieceType.Pawn,   position: {rank: 2, file: 6}},
    {color: Color.White, type: PieceType.Pawn,   position: {rank: 2, file: 7}},
    {color: Color.White, type: PieceType.Pawn,   position: {rank: 2, file: 8}},

    {color: Color.Black, type: PieceType.Rook,   position: {rank: 8, file: 1}},
    {color: Color.Black, type: PieceType.Knight, position: {rank: 8, file: 2}},
    {color: Color.Black, type: PieceType.Bishop, position: {rank: 8, file: 3}},
    {color: Color.Black, type: PieceType.Queen,  position: {rank: 8, file: 4}},
    {color: Color.Black, type: PieceType.King,   position: {rank: 8, file: 5}},
    {color: Color.Black, type: PieceType.Bishop, position: {rank: 8, file: 6}},
    {color: Color.Black, type: PieceType.Knight, position: {rank: 8, file: 7}},
    {color: Color.Black, type: PieceType.Rook,   position: {rank: 8, file: 8}},

    {color: Color.Black, type: PieceType.Pawn,   position: {rank: 7, file: 1}},
    {color: Color.Black, type: PieceType.Pawn,   position: {rank: 7, file: 2}},
    {color: Color.Black, type: PieceType.Pawn,   position: {rank: 7, file: 3}},
    {color: Color.Black, type: PieceType.Pawn,   position: {rank: 7, file: 4}},
    {color: Color.Black, type: PieceType.Pawn,   position: {rank: 7, file: 5}},
    {color: Color.Black, type: PieceType.Pawn,   position: {rank: 7, file: 6}},
    {color: Color.Black, type: PieceType.Pawn,   position: {rank: 7, file: 7}},
    {color: Color.Black, type: PieceType.Pawn,   position: {rank: 7, file: 8}},
];