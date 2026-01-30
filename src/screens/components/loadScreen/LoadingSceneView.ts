import { View } from "../../../core/mvc/View";
import { Graphics, Texture as PIXITexture } from "pixi.js";
import GlobalDispatcher from "../../../events/GlobalDispatcher";
import { ScreenHelper } from "src/core/ScreenHelper";
import LoadingSceneModel from "./LoadingSceneModel";
import { ScaledBackground, UIText } from "src/common/ui";
import { RESIZE_APP } from "src/events/TypesDispatch";

export default class LoadingSceneView extends View<LoadingSceneModel> {

    private _fallbackBg!: Graphics;
    private _background!: ScaledBackground;
    private _text!: UIText;

    create() {
        GlobalDispatcher.add(RESIZE_APP, this.resize, this);

        this.createFallbackBackground();
        this.createBackground();
        this.createText();
        this.updateLayout();
    }

    private createFallbackBackground() {
        this._fallbackBg = new Graphics();
        this.addChild(this._fallbackBg);
        this.updateFallbackBg();
    }

    private updateFallbackBg() {
        this._fallbackBg.clear();
        this._fallbackBg.rect(
            ScreenHelper.TopLeft.x,
            ScreenHelper.TopLeft.y,
            ScreenHelper.ViewportWidth,
            ScreenHelper.ViewportHeight
        );
        this._fallbackBg.fill(0x1a1a2e);
    }

    private createBackground() {
        this._background = new ScaledBackground();
        this._background.visible = false;
        this.addChild(this._background);
    }

    private createText() {
        this._text = new UIText({
            text: "Loading 0%",
            fontSize: 50,
            fill: 0xffffff,
            dropShadow: { color: 0x000000, blur: 4, distance: 2 },
            anchor: 0.5,
            position: { x: ScreenHelper.ViewportCenter.x, y: ScreenHelper.ViewportCenter.y }
        });

        this.addChild(this._text);
    }

    public setBackground(texture: PIXITexture): void {
        this._background.setTexture(texture);
        this._background.visible = true;
        this._fallbackBg.visible = false;
    }

    public update(progress: number) {
        this._text.setText(`Loading ${progress | 0}%`);
    }

    private updateLayout() {
        this.updateFallbackBg();
        this._text.setPosition(ScreenHelper.ViewportCenter.x, ScreenHelper.ViewportCenter.y);
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
