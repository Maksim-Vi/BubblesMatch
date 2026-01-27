import { Resolve } from "src/core/di/decorators";
import { SceneManager, SceneType } from "src/screens/ScreenManager";

export class GameManager {
    
    @Resolve("SceneManager") private sceneManager: SceneManager

    constructor() {
        this.init();
    }

    init() {
        this.startGame();
    }

    startGame() {
        this.sceneManager.loadScene(SceneType.LoadingScreen);
    }

    changeScene(key: SceneType) {
        this.sceneManager.loadScene(key);
    }

    get currentSceneType() {
        return this.sceneManager.getCurrentSceneType();
    }
}
