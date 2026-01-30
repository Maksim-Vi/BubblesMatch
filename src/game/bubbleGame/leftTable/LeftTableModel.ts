import { Model } from "src/core/mvc/Model";

export class LeftTableModel extends Model {
    private _score: number = 0;
    private _needScores: number = 0;
    private _movesLeft: number = 0;
    private _maxMoves: number = 0;

    init(): void {
        this._score = 0;
        this._needScores = 0;
        this._movesLeft = 0;
        this._maxMoves = 0;
    }

    setInitialData(maxMoves: number, needScores: number): void {
        this._maxMoves = maxMoves;
        this._movesLeft = maxMoves;
        this._score = 0;
        this._needScores = needScores;
    }
 
    set needScores(value: number) {
        this._needScores = value;
    }

    get needScores(): number {
        return this._needScores
    }

    get score(): number {
        return this._score;
    }

    set score(value: number) {
        this._score = value;
    }

    get movesLeft(): number {
        return this._movesLeft;
    }

    set movesLeft(value: number) {
        this._movesLeft = value;
    }

    get maxMoves(): number {
        return this._maxMoves;
    }

    destroy(): void {}
}
