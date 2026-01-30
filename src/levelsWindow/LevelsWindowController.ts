import GlobalDispatcher, { IGDEvent } from "src/events/GlobalDispatcher";
import { Controller } from "src/core/mvc/Controller";
import { Resolve } from "src/core/di/decorators";
import { GameManager } from "src/game/GameManager";
import { GameStore } from "src/store/GameStore";
import { LevelStore } from "src/store/LevelStore";
import LevelsWindowModel from "./LevelsWindowModel";
import LevelsWindowView from "./LevelsWindowView";
import { SELECT_LEVEL, PLAY_CURRENT_LEVEL, START_GAME } from "src/events/TypesDispatch";

export default class LevelsWindowController extends Controller<LevelsWindowModel, LevelsWindowView> {
    @Resolve("GameManager") private gameManager: GameManager;
    @Resolve("GameStore") private gameStore: GameStore;
    @Resolve("LevelStore") private levelStore: LevelStore;

    init(): void {
        GlobalDispatcher.add(SELECT_LEVEL, this.onLevelSelect, this);
        GlobalDispatcher.add(PLAY_CURRENT_LEVEL, this.onPlayCurrentLevel, this);
    }

    private onLevelSelect = (event: IGDEvent<{ levelId: number }>): void => {
        const levelId = event.params.levelId;

        if (this.gameStore.isLevelUnlocked(levelId)) {
            this.gameStore.currentLevel = levelId;
            this.levelStore.setCurrentLevel(levelId);
            GlobalDispatcher.dispatch(START_GAME);
        }
    }

    private onPlayCurrentLevel = (): void => {
        const currentLevel = this.gameStore.currentLevel;
        this.levelStore.setCurrentLevel(currentLevel);
        GlobalDispatcher.dispatch(START_GAME);
    }

    destroy(): void {
        GlobalDispatcher.remove(SELECT_LEVEL, this.onLevelSelect);
        GlobalDispatcher.remove(PLAY_CURRENT_LEVEL, this.onPlayCurrentLevel);
        this.view.destroyView();
        this.model.destroy();
    }
}
