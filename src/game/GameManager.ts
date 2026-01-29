import { Resolve } from "src/core/di/decorators";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { SHOW_FINISH_SCREEN, RESTART_GAME, GO_TO_LOBBY } from "src/events/TypesDispatch";
import { SceneManager, SceneType } from "src/screens/ScreenManager";

export class GameManager {

    @Resolve("SceneManager") private sceneManager: SceneManager

    constructor() {
        this.init();
    }

    init() {
        this.startGame();
        GlobalDispatcher.add(SHOW_FINISH_SCREEN, this.onShowFinishScreen, this);
        GlobalDispatcher.add(RESTART_GAME, this.onRestartGame, this);
        GlobalDispatcher.add(GO_TO_LOBBY, this.onGoToLobby, this);
    }

    startGame() {
        this.sceneManager.loadScene(SceneType.LoadingScreen);
    }

    onShowFinishScreen() {
        this.sceneManager.loadScene(SceneType.FinishScreen);
    }

    onRestartGame = () => {
        this.sceneManager.hideFinishScreen();
        this.sceneManager.loadScene(SceneType.GameScreen);
    }

    onGoToLobby = () => {
        this.sceneManager.hideFinishScreen();
        this.sceneManager.loadScene(SceneType.LobbyScreen);
    }

    changeScene(key: SceneType) {
        this.sceneManager.loadScene(key);
    }

    get currentSceneType() {
        return this.sceneManager.getCurrentSceneType();
    }
}
