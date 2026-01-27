import {Controller} from "../../../core/mvc/Controller";

import {DI} from "../../../core/di/DI";
import GlobalDispatcher, {IGDEvent} from "../../../events/GlobalDispatcher";
import AssetsLoader from "../../../assetsLoader/AssetsLoader";
import LoadingSceneModel from "./LoadingSceneModel";
import LoadingSceneView from "./LoadingSceneView";
import gsap from "gsap";
import { SceneManager, SceneType } from "../../ScreenManager";

export default class LoadingSceneController extends Controller<LoadingSceneModel, LoadingSceneView>{

    private sceneManager!: SceneManager;

    async init() {
        this.view.create();

        if (!this.sceneManager)
            this.sceneManager = DI.container.resolve<SceneManager>("SceneManager");

        GlobalDispatcher.add("ASSETS_LOAD_START", this.showScreen, this);
        GlobalDispatcher.add("ASSETS_LOAD_PROGRESS", this.updateText, this);

        this.startLoad();
    }



    async startLoad(){
        await Promise.all([
            AssetsLoader.loadAll()
        ]);

        this.hideScreen();
    }

    showScreen(){
        this.view.show();
    }

    updateText(data: IGDEvent<{ progress: number }>){
        this.view.update(data.params.progress);
    }

    hideScreen(){
        gsap.to(this.view, {
            duration: 1,
            alpha: 0,
            onComplete: () => {
                this.view.hide();
                this.sceneManager.loadScene(SceneType.LobbyScreen);
                this.destroy();
            }
        });
    }

    destroy(): void {
        GlobalDispatcher.remove("ASSETS_LOAD_START", this.showScreen);
        GlobalDispatcher.remove("ASSETS_LOAD_PROGRESS", this.updateText);

        this.view.destroyView()

    }
}
