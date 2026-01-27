import {View} from "../../../core/mvc/View";
import * as PIXI from "pixi.js";
import GlobalDispatcher from "../../../events/GlobalDispatcher";
import { ScreenHelper } from "src/core/ScreenHelper";
import LoadingSceneModel from "./LoadingSceneModel";

export default class LoadingSceneView extends View<LoadingSceneModel> {

    private _background!: PIXI.Graphics;
    private _text!: PIXI.Text;

    create() {
        GlobalDispatcher.add("RESIZE_APP", this.resize, this);

        this.createBackground();
        this.createText();
        this.updateLayout();
    }

    private createBackground() {
        this._background = new PIXI.Graphics();
        this.addChild(this._background);
    }

    private createText() {
        this._text = new PIXI.Text("Loading 0%", {
            fontFamily: "Arial",
            fontSize: 50,
            fill: 0xffffff,
            align: "center"
        });
        this._text.anchor.set(0.5);
        this._text.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y);

        this.addChild(this._text);
    }

    public update(progress: number) {
        this._text.text = `Loading ${progress | 0}%`;
    }

    private updateLayout() {
        this._background.clear();
        this._background.beginFill(0x000333, 0.95);
        this._background.drawRect(0, 0, ScreenHelper.Width * 2, ScreenHelper.Height * 2);
        this._background.endFill();

        this._text.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y);
    }

    private resize() {
        this.updateLayout();
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }

    destroyView(): void {
        GlobalDispatcher.remove("RESIZE_APP", this.resize);
        this.destroy({ children: true });
    }
}