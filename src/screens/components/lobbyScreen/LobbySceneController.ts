import GlobalDispatcher from "src/events/GlobalDispatcher";
import {Controller} from "../../../core/mvc/Controller";
import { Resolve } from "src/core/di/decorators";
import { SceneType } from "src/screens/ScreenManager";
import { GameManager } from "src/game/GameManager";
import LobbySceneModel from "./LobbySceneModel";
import LobbySceneView from "./LobbySceneView";
import { START_GAME } from "src/events/TypesDispatch";

export default class LobbySceneController extends Controller<LobbySceneModel, LobbySceneView>{

    @Resolve("GameManager") private gameManager: GameManager;

    async init() {
        GlobalDispatcher.add(START_GAME, this.startGame, this);
    }

    startGame(){
        console.log("Start Game");
        this.gameManager.changeScene(SceneType.GameScreen);
    }

    showScreen(){
        this.view.show();
    }

    hideScreen(){
        this.view.hide();
    }

    destroy(): void {
        GlobalDispatcher.remove(START_GAME, this.startGame);
        this.view.destroyView();
        this.model.destroy();
    }
}
