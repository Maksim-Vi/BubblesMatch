import { Resolve } from "src/core/di/decorators";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { SHOW_FINISH_SCREEN } from "src/events/TypesDispatch";
import { SceneManager, SceneType } from "src/screens/ScreenManager";

export class GameManager {
    
    @Resolve("SceneManager") private sceneManager: SceneManager

    constructor() {
        this.init();
    }

    init() {
        this.startGame();
        GlobalDispatcher.add(SHOW_FINISH_SCREEN, this.onShowFinishScreen, this);

    }

    startGame() {
        this.sceneManager.loadScene(SceneType.LoadingScreen);
    }

    onShowFinishScreen() {
        this.sceneManager.loadScene(SceneType.FinishScreen);
    }

    changeScene(key: SceneType) {
        this.sceneManager.loadScene(key);
    }

    get currentSceneType() {
        return this.sceneManager.getCurrentSceneType();
    }
}
