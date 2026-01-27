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

    private state: GameState = GameState.IDLE;

    init(): void {
        this.state = GameState.IDLE;
    }

    initLevel(levelConfig: ILevelConfig): void {
        this._levelConfig = levelConfig;
        this.state = GameState.IDLE;
      
        const gridConfig = this.levelConfig.gridConfig;

        this.grid = new BubbleGrid(gridConfig.gridWidth, gridConfig.gridHeight, gridConfig.cellSize, gridConfig.gap);
    }

    public getTextureKeyForColor(color: TileColor): string {
        const colorMap: Record<TileColor, string> = {
            [TileColor.RED]: 'ico/1',
            [TileColor.YELLOW]: 'ico/2',
            [TileColor.PURPURE]: 'ico/3',
        };

        return colorMap[color] || 'ico/1';
    }

    getGrid(): BubbleGrid {
        return this.grid;
    }

    get levelConfig(): ILevelConfig {
        return this._levelConfig;
    }
    
    get gameCurrentState(): GameState {
        return this.state;
    }

    destroy(): void {
        GlobalDispatcher.removeAllForContext(this);
    }
}
