import { Model } from "src/core/mvc/Model";

export class FinishScreenModel extends Model {
    private _score: number = 0;
    private _isWin: boolean = false;

    init(): void {
        this._score = 0;
        this._isWin = false;
    }

    setResult(isWin: boolean, score: number): void {
        this._isWin = isWin;
        this._score = score;
    }

    get score(): number {
        return this._score;
    }

    get isWin(): boolean {
        return this._isWin;
    }

    destroy(): void {}
}
