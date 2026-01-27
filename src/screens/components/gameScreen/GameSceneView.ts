import {View} from "../../../core/mvc/View";
import GameSceneModel from "./GameSceneModel";

export default class GameSceneView extends View<GameSceneModel> {

    constructor() {
        super();
        this.create();
    }

    create(): void {}

    show(): void {
        this.visible = true;
    }

    hide(): void {
        this.visible = false;
    }

    destroyView(): void {
        this.destroy({ children: true });
    }
}