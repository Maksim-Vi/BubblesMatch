import { TileColor } from "src/common/cell/Tile";
import { Model } from "src/core/mvc/Model";


export interface IObstacleColor { 
    color: TileColor; 
    count: number; 
}

export interface IObstacleConfig {
    collectScores: number,
    maxMoves: number; 
    collectColors: IObstacleColor[] | null; 
}

export interface IGridConfig {
    gridWidth: number;
    gridHeight: number;
    cellSize: number
    gap: number
}

export interface ILevelConfig {
    id: number;
    gridConfig: IGridConfig;
    maxItems: number; 
    colors: TileColor[]; 
    obstacles: IObstacleConfig; 
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
        const baseGridConfig: IGridConfig = {
            gridWidth: 8,
            gridHeight: 8,
            cellSize: 100, 
            gap: 2
        };

        this._levels = [
            {
                id: 1,
                gridConfig: { ...baseGridConfig, gridWidth: 8, gridHeight: 8 },
                maxItems: 64,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 5,
                    collectColors: null
                }
            },
            {
                id: 2,
                gridConfig: { ...baseGridConfig, gridWidth: 8, gridHeight: 8 },
                maxItems: 64,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 22,
                    collectColors: null
                }
            },
            {
                id: 3,
                gridConfig: { ...baseGridConfig, gridWidth: 9, gridHeight: 9 }, 
                maxItems: 81,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 20,
                    collectColors: null
                }
            },
            {
                id: 4,
                gridConfig: { ...baseGridConfig, gridWidth: 9, gridHeight: 9 },
                maxItems: 81,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 18,
                    collectColors: null
                }
            },
            {
                id: 5,
                gridConfig: { ...baseGridConfig, gridWidth: 9, gridHeight: 9 },
                maxItems: 81,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 15,
                    collectColors: null
                }
            },
            {
                id: 6,
                gridConfig: { ...baseGridConfig, gridWidth: 10, gridHeight: 10, cellSize: 80 },
                maxItems: 100, 
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 16,
                    collectColors: null
                }
            },
            {
                id: 7,
                gridConfig: { ...baseGridConfig, gridWidth: 10, gridHeight: 10, cellSize: 70 },
                maxItems: 100,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN, TileColor.ORANGE],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 14,
                    collectColors: null
                }
            },
            {
                id: 8,
                gridConfig: { ...baseGridConfig, gridWidth: 10, gridHeight: 10, cellSize: 70 },
                maxItems: 100,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN, TileColor.ORANGE],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 12,
                    collectColors: null
                }
            },
            {
                id: 9,
                gridConfig: { ...baseGridConfig, gridWidth: 11, gridHeight: 11, cellSize: 70 }, 
                maxItems: 121,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN, TileColor.ORANGE, TileColor.MULTI],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 13,
                    collectColors: null
                }
            },
            {
                id: 10,
                gridConfig: { ...baseGridConfig, gridWidth: 11, gridHeight: 11, cellSize: 70 },
                maxItems: 121,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN, TileColor.ORANGE, TileColor.MULTI],
                obstacles: {
                    collectScores: 1000,
                    maxMoves: 10,
                    collectColors: null
                }
            }
        ];
    }

    getLevel(levelId: number): ILevelConfig | null {
        // Тепер шукаємо за 'id', а не за індексом
        const level = this._levels.find(l => l.id === levelId);
        if (level) {
            return this.cloneLevel(level);
        }
        return null;
    }

    getAllLevels(): ILevelConfig[] {
        return this._levels.map(level => this.cloneLevel(level));
    }

    setCurrentLevel(levelId: number): boolean {
        const level = this.getLevel(levelId);
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
            gridConfig: { ...level.gridConfig },
            colors: [...level.colors],
            obstacles: { ...level.obstacles },
        };
    }

    addLevel(config: ILevelConfig): void {
        // Перевіряємо, чи рівень з таким ID вже існує
        if (this._levels.some(l => l.id === config.id)) {
            console.warn(`Level with ID ${config.id} already exists. Skipping addition.`);
            return;
        }
        this._levels.push(config);
        // Можливо, ви захочете відсортувати рівні за ID після додавання
        this._levels.sort((a, b) => a.id - b.id);
    }

    destroy(): void {
        this._levels = [];
        this._currentLevel = null;
    }
}