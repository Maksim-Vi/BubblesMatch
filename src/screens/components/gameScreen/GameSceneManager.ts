import {Application} from "pixi.js";
import {ScreenManagerBase} from "../base/ScreenManagerBase";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import GameSceneModel from "./GameSceneModel";
import GameSceneView from "./GameSceneView";
import GameSceneController, { GameType } from "./GameSceneController";
import { BubbleGameManager } from "src/game/bubbleGame/BubbleGameManager";

export class GameSceneManager extends ScreenManagerBase {

    private gameSceneController: GameSceneController = null;

    constructor(app: Application) {
        super(app);
        this.init();
    }

    override init() {
        this.eventListeners();
    }

    private eventListeners(): void {
        GlobalDispatcher.add("START_GAME", this.onStartGame, this);
    }

    private async createController(){
        this.gameSceneController = new GameSceneController(new GameSceneModel(), new GameSceneView());
        await this.gameSceneController.init()
        this.addView(this.gameSceneController.view)
    }

    private onStartGame(): void {
        this.gameSceneController?.onStartGame(GameType.bubbleGame);
    }

    public async loadScene() {
        await this.createController();
        this.gameSceneController?.showScreen();
        this.gameSceneController?.onStartGame(GameType.bubbleGame);
    }

    public hideScene() {
        this.destroy();
    }

    override destroy() {
        GlobalDispatcher.removeAllForContext(this);
        this.gameSceneController?.destroy();
        this.gameSceneController = null;
    }
}