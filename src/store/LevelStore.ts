import { TileColor } from "src/common/cell/Tile";
import { Model } from "src/core/mvc/Model";

export interface IGridConfig{  
    gridWidth: number;
    gridHeight: number;
    cellSize: number
    gap: number
}

export interface ILevelConfig {
    id: number;
    gridConfig: IGridConfig;
    maxItems: number;
    maxMoves: number;
    colors: TileColor[];
}

export class LevelStore extends Model {
    private _levels: ILevelConfig[] = [];
    private _currentLevel: ILevelConfig | null = null;

    constructor() {
        super();

        this.init();
    }

    init(): void {
        this.initializeLevels();
    }

    private initializeLevels(): void {
        this._levels = [
            {
                id: 0,
                gridConfig: {
                    gridWidth: 7,
                    gridHeight: 7,
                    cellSize: 82,
                    gap: 3
                },
                maxItems: 500,
                maxMoves: 50,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE],
            },
        ];
    }

    getLevel(levelIndex: number): ILevelConfig | null {
        if (levelIndex >= 0 && levelIndex < this._levels.length) {
            return this.cloneLevel(this._levels[levelIndex]);
        }
        return null;
    }

    getAllLevels(): ILevelConfig[] {
        return this._levels.map(level => this.cloneLevel(level));
    }

    setCurrentLevel(levelIndex: number): boolean {
        const level = this.getLevel(levelIndex);
        if (level) {
            this._currentLevel = level;
            return true;
        }
        return false;
    }

    get currentLevel(): ILevelConfig | null {
        return this._currentLevel;
    }

    get totalLevels(): number {
        return this._levels.length;
    }

    private cloneLevel(level: ILevelConfig): ILevelConfig {
        return {
            ...level,
            colors: [...level.colors],
        };
    }

    addLevel(config: ILevelConfig): void {
        this._levels.push(config);
    }

    destroy(): void {
        this._levels = [];
        this._currentLevel = null;
    }
}
