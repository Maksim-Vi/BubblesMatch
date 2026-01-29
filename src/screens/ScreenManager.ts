import { DIContainer } from "src/core/di/DIContainer";
import { ScreenManagerBase } from "./components/base/ScreenManagerBase";
import { Application } from "pixi.js";
import { LoadingSceneManager } from "./components/loadScreen/LoadingSceneManager";
import { LobbySceneManager } from "./components/lobbyScreen/LobbySceneManager";
import { GameSceneManager } from "./components/gameScreen/GameSceneManager";
import { FinishScreenManager } from "./components/finishScreen";

export enum SceneType {
    LoadingScreen,
    LobbyScreen,
    GameScreen,
    FinishScreen
}

export class SceneManager {
    private currentSceneType: SceneType | null = null;
    private currentScene: ScreenManagerBase | null = null;
    private finishScreenManager: FinishScreenManager | null = null;

    constructor(private app: Application, private diContainer: DIContainer) {}

    loadScene(key: SceneType) {
        if (this.currentScene) {
            this.currentScene.hideScene();
        }

        this.currentSceneType = key;

        switch (key) {
            case SceneType.LoadingScreen:{
                this.currentScene = this.diContainer.resolve<LoadingSceneManager>("LoadingSceneManager");
                (this.currentScene as LoadingSceneManager).loadScene();
                break;
            }
            case SceneType.LobbyScreen:{
                this.currentScene = this.diContainer.resolve<LobbySceneManager>("LobbySceneManager");
                (this.currentScene as LobbySceneManager).loadScene();
                break;
            }
            case SceneType.GameScreen:{
                this.currentScene = this.diContainer.resolve<GameSceneManager>("GameSceneManager");
                (this.currentScene as GameSceneManager).loadScene();
                // Initialize finish screen for game scene (it shows as overlay)
                this.initFinishScreen();
                break;
            }
            case SceneType.FinishScreen:{
                this.finishScreenManager = this.diContainer.resolve<FinishScreenManager>("FinishScreenManager");
                this.finishScreenManager.loadScene();
                break;
            }
        }
    }

    private initFinishScreen(): void {
        if (!this.finishScreenManager) {
            this.finishScreenManager = this.diContainer.resolve<FinishScreenManager>("FinishScreenManager");
            this.finishScreenManager.loadScene();
        }
    }

    getCurrentSceneType(): SceneType | null {
        return this.currentSceneType;
    }

    getCurrentScene(): ScreenManagerBase {
        return this.currentScene;
    }
}
