import { Application } from "pixi.js";
import { ScreenManagerBase } from "../base/ScreenManagerBase";
import { Resolve } from "src/core/di/decorators";
import { LevelStore } from "src/store/LevelStore";
import { GameStore } from "src/store/GameStore";

import LobbySceneController from "./LobbySceneController";
import LobbySceneModel from "./LobbySceneModel";
import LobbySceneView from "./LobbySceneView";
import LevelsWindowController from "../../../levelsWindow/LevelsWindowController";
import LevelsWindowModel from "../../../levelsWindow/LevelsWindowModel";

export class LobbySceneManager extends ScreenManagerBase {

    @Resolve("LevelStore") private levelStore: LevelStore;
    @Resolve("GameStore") private gameStore: GameStore;

    private lobbySceneController: LobbySceneController | null = null;
    private levelsWindowController: LevelsWindowController | null = null;

    constructor(app: Application) {
        super(app);
        this.init();
    }

    override init() {
    }

    private createController() {
        const levelsOptions = {
            levels: this.levelStore.getAllLevels(),
            unlockedLevel: this.gameStore.unlockedLevel,
            currentLevel: this.gameStore.currentLevel,
        };

        const model = new LobbySceneModel();
        const view = new LobbySceneView(levelsOptions);

        this.lobbySceneController = new LobbySceneController(model, view);
        this.lobbySceneController.init();
        this.addView(this.lobbySceneController.view);

        const levelsModel = new LevelsWindowModel();
        this.levelsWindowController = new LevelsWindowController(levelsModel, view as any);
        this.levelsWindowController.init();
    }

    public loadScene() {
        this.createController();
        this.lobbySceneController?.showScreen();
    }

    public hideScene() {
        this.destroy();
    }

    override destroy() {
        this.levelsWindowController?.destroy();
        this.levelsWindowController = null;
        this.lobbySceneController?.destroy();
        this.lobbySceneController = null;
    }
}
