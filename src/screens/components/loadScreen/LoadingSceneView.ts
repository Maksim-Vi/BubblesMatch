import { View } from "../../../core/mvc/View";
import * as PIXI from "pixi.js";
import GlobalDispatcher from "../../../events/GlobalDispatcher";
import { ScreenHelper } from "src/core/ScreenHelper";
import LoadingSceneModel from "./LoadingSceneModel";
import { ScaledBackground } from "src/common/ui";
import { RESIZE_APP } from "src/events/TypesDispatch";

export default class LoadingSceneView extends View<LoadingSceneModel> {

    private _fallbackBg!: PIXI.Graphics;
    private _background!: ScaledBackground;
    private _text!: PIXI.Text;

    create() {
        GlobalDispatcher.add(RESIZE_APP, this.resize, this);

        this.createFallbackBackground();
        this.createBackground();
        this.createText();
        this.updateLayout();
    }

    private createFallbackBackground() {
        this._fallbackBg = new PIXI.Graphics();
        this._fallbackBg.rect(0, 0, ScreenHelper.Width * 2, ScreenHelper.Height * 2);
        this._fallbackBg.fill(0x1a1a2e);
        this.addChild(this._fallbackBg);
    }

    private createBackground() {
        this._background = new ScaledBackground();
        this._background.visible = false;
        this.addChild(this._background);
    }

    private createText() {
        this._text = new PIXI.Text({
            text: "Loading 0%",
            style: {
                fontFamily: "Arial",
                fontSize: 50,
                fill: 0xffffff,
                align: "center",
                dropShadow: {
                    color: 0x000000,
                    blur: 4,
                    distance: 2
                }
            }
        });
        this._text.anchor.set(0.5);
        this._text.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y);

        this.addChild(this._text);
    }

    public setBackground(texture: PIXI.Texture): void {
        this._background.setTexture(texture);
        this._background.visible = true;
        this._fallbackBg.visible = false;
    }

    public update(progress: number) {
        this._text.text = `Loading ${progress | 0}%`;
    }

    private updateLayout() {
        this._fallbackBg.clear();
        this._fallbackBg.rect(0, 0, ScreenHelper.Width * 2, ScreenHelper.Height * 2);
        this._fallbackBg.fill(0x1a1a2e);

        this._text.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y);
    }

    private resize = () => {
        this.updateLayout();
    };

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }

    destroyView(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.resize);
        this.destroy({ children: true });
    }
}
