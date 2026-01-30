import { TileColor } from "src/common/cell/Tile";
import { Model } from "src/core/mvc/Model";

export interface IGridConfig {
    gridWidth: number;
    gridHeight: number;
    cellSize: number
    gap: number
}

export interface ILevelConfig {
    id: number;
    gridConfig: IGridConfig;
    maxItems: number; // Максимальна кількість елементів, які можуть бути заспавнені
    maxMoves: number; // Максимальна кількість ходів
    colors: TileColor[]; // Доступні кольори для цього рівня
    description: string; // Додамо опис для рівня
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
            gridWidth: 8, // Почнемо з меншої сітки для перших рівнів
            gridHeight: 8,
            cellSize: 80, // Трохи менші клітинки, щоб поміститися на екрані
            gap: 2
        };

        this._levels = [
            {
                id: 1,
                gridConfig: { ...baseGridConfig, gridWidth: 8, gridHeight: 8 },
                maxItems: 64, // 8x8 сітка
                maxMoves: 25,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE],
                description: "Ласкаво просимо! Навчіться збирати кульки. Спробуйте очистити якомога більше!"
            },
            {
                id: 2,
                gridConfig: { ...baseGridConfig, gridWidth: 8, gridHeight: 8 },
                maxItems: 64,
                maxMoves: 22,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE],
                description: "З'явився новий колір! Будьте уважнішими."
            },
            {
                id: 3,
                gridConfig: { ...baseGridConfig, gridWidth: 9, gridHeight: 9 }, // Збільшуємо сітку
                maxItems: 81, // 9x9 сітка
                maxMoves: 20,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE],
                description: "Поле стало більшим! Більше місця для стратегії."
            },
            {
                id: 4,
                gridConfig: { ...baseGridConfig, gridWidth: 9, gridHeight: 9 },
                maxItems: 81,
                maxMoves: 18,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN],
                description: "Ще один колір! Подумайте, перш ніж робити хід."
            },
            {
                id: 5,
                gridConfig: { ...baseGridConfig, gridWidth: 9, gridHeight: 9 },
                maxItems: 81,
                maxMoves: 15,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN],
                description: "Ходів стає менше! Кожен хід на вагу золота."
            },
            {
                id: 6,
                gridConfig: { ...baseGridConfig, gridWidth: 10, gridHeight: 10, cellSize: 75 }, // Ще більша сітка
                maxItems: 100, // 10x10 сітка
                maxMoves: 16, // Дамо трохи більше ходів через розмір
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN],
                description: "Гігантське поле! Це справжнє випробування."
            },
            {
                id: 7,
                gridConfig: { ...baseGridConfig, gridWidth: 10, gridHeight: 10, cellSize: 75 },
                maxItems: 100,
                maxMoves: 14,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN, TileColor.ORANGE],
                description: "На горизонті помаранчевий! Спробуйте утриматися від випадкових ходів."
            },
            {
                id: 8,
                gridConfig: { ...baseGridConfig, gridWidth: 10, gridHeight: 10, cellSize: 75 },
                maxItems: 100,
                maxMoves: 12,
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN, TileColor.ORANGE],
                description: "Ви на межі! Кожен хід має бути продуманим."
            },
            {
                id: 9,
                gridConfig: { ...baseGridConfig, gridWidth: 11, gridHeight: 11, cellSize: 70 }, // Ще більша, або зміна форми
                maxItems: 121, // 11x11 сітка
                maxMoves: 13, // Трохи більше ходів через складність
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN, TileColor.ORANGE, TileColor.MULTI],
                description: "Справжній виклик для майстрів! Максимальна кількість кольорів."
            },
            {
                id: 10,
                gridConfig: { ...baseGridConfig, gridWidth: 11, gridHeight: 11, cellSize: 70 },
                maxItems: 121,
                maxMoves: 10, // Дуже складно
                colors: [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE, TileColor.BLUE, TileColor.GREEN, TileColor.ORANGE, TileColor.MULTI],
                description: "Великий фінал! Тільки найрозумніші зможуть це пройти!"
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
            gridConfig: { ...level.gridConfig }, // Глибоке копіювання gridConfig
            colors: [...level.colors],
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