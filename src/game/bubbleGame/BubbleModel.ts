import { Model } from "src/core/mvc/Model";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { BubbleGrid } from "./gridBubble/BubbleGrid";
import { ILevelConfig } from "src/store/LevelStore";
import { TileColor } from "src/common/cell/Tile";

export enum GameState {
    IDLE = "idle",
    PLAYER_INPUT = "player_input",
    GAME_OVER = "game_over",
    LEVEL_COMPLETE = "level_complete"
}

export interface IGameStats {
    score: number;
    movesLeft: number;
    level: number;
}

export class BubbleModel extends Model {

    private grid: BubbleGrid;
    private _levelConfig: ILevelConfig;
    private _state: GameState = GameState.IDLE;
    private _score: number = 0;
    private _multiplier: number = 1;
    private _spawnedItems: number = 0;
    private _movesLeft: number = 0;

    init(): void {
        this._state = GameState.IDLE;
        this._score = 0;
        this._multiplier = 1;
        this._spawnedItems = 0;
        this._movesLeft = 0;
    }

    initLevel(levelConfig: ILevelConfig): void {
        this._levelConfig = levelConfig;
        this._state = GameState.PLAYER_INPUT;
        this._score = 0;
        this._multiplier = 1;
        this._spawnedItems = 0;
        this._movesLeft = levelConfig.maxMoves;

        const gridConfig = this.levelConfig.gridConfig;

        this.grid = new BubbleGrid(gridConfig.gridWidth, gridConfig.gridHeight, gridConfig.cellSize, gridConfig.gap);
    }

    useMove(): void {
        if (this._movesLeft > 0) {
            this._movesLeft--;
        }
    }

    addMove(): void {
        this._movesLeft++;
    }

    get movesLeft(): number {
        return this._movesLeft;
    }

    get maxMoves(): number {
        return this._levelConfig?.maxMoves ?? 0;
    }

    hasMovesLeft(): boolean {
        return this._movesLeft > 0;
    }

    setGameState(state: GameState): void {
        this._state = state;
    }

    incrementSpawnedItems(): void {
        this._spawnedItems++;
    }

    get spawnedItems(): number {
        return this._spawnedItems;
    }

    get maxItems(): number {
        return this._levelConfig?.maxItems ?? Infinity;
    }

    canSpawnMore(): boolean {
        return this._spawnedItems < this.maxItems;
    }

    addScore(points: number): void {
        this._score += points;
    }

    setScore(value: number): void {
        this._score = value;
    }

    get score(): number {
        return this._score;
    }

    get multiplier(): number {
        return this._multiplier;
    }

    setMultiplier(value: number): void {
        this._multiplier = value;
    }

    public getTextureKeyForColor(color: TileColor): string {
        const colorMap: Record<TileColor, string> = {
            [TileColor.RED]: 'ico/1',
            [TileColor.YELLOW]: 'ico/2',
            [TileColor.PURPURE]: 'ico/3',
            [TileColor.BLUE]: 'ico/4',
            [TileColor.PING]: 'ico/5',
            [TileColor.GREEN]: 'ico/6',
            [TileColor.ORANGE]: 'ico/7',
            [TileColor.MULTI]: 'ico/8',
        };

        return colorMap[color] || 'ico/1';
    }

    public getTextureGrid(index: number): string {
        const map = ['grid/gridCell_1', 'grid/gridCell_2']

        return map[index] || 'grid/gridCell_1';
    }

    getGrid(): BubbleGrid {
        return this.grid;
    }

    get levelConfig(): ILevelConfig {
        return this._levelConfig;
    }
    
    get gameCurrentState(): GameState {
        return this._state;
    }

    destroy(): void {
        GlobalDispatcher.removeAllForContext(this);
    }
}
