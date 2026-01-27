import {Application} from "pixi.js";
import {ScreenManagerBase} from "../base/ScreenManagerBase";

import LobbySceneController from "./LobbySceneController";
import LobbySceneModel from "./LobbySceneModel";
import LobbySceneView from "./LobbySceneView";

export class LobbySceneManager extends ScreenManagerBase {

    private lobbySceneController: LobbySceneController = null;

    constructor(app: Application) {
        super(app);
        this.init();
    }

    override init() {
    }

    private createController(){
        this.lobbySceneController = new LobbySceneController(new LobbySceneModel(), new LobbySceneView());
        this.lobbySceneController.init()
        this.addView(this.lobbySceneController.view)
    }

    public loadScene() {
        this.createController();
        this.lobbySceneController?.showScreen();
    }

    public hideScene() {
        this.destroy();
    }

    override destroy() {
        this.lobbySceneController?.destroy();
        this.lobbySceneController = null;
    }
}