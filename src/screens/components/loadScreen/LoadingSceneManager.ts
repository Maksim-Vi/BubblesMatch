import {Application} from "pixi.js";
import {ScreenManagerBase} from "../base/ScreenManagerBase";
import LoadingSceneController from "./LoadingSceneController";
import LoadingSceneView from "./LoadingSceneView";
import LoadingSceneModel from "./LoadingSceneModel";

export class LoadingSceneManager extends ScreenManagerBase {

    private loadingSceneController: LoadingSceneController = null;

    constructor(app: Application) {
        super(app);
        this.init();
    }

    override init() {
    }

    private createController(){
        this.loadingSceneController = new LoadingSceneController(new LoadingSceneModel(), new LoadingSceneView());
        this.loadingSceneController.init()
        this.addView(this.loadingSceneController.view)
    }

    public loadScene() {
        this.createController();
        this.loadingSceneController?.showScreen();
    }

    public hideScene() {
        this.destroy();
    }

    override destroy() {
        this.loadingSceneController?.destroy();
        this.loadingSceneController = null;
    }
}