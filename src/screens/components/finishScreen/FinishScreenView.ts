import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { View } from "src/core/mvc/View";
import { FinishScreenModel } from "./FinishScreenModel";
import { NineSlicePanel } from "src/common/ui";
import { ScreenHelper } from "src/core/ScreenHelper";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { RESIZE_APP } from "src/events/TypesDispatch";

export class FinishScreenView extends View<FinishScreenModel> {
    private _overlay!: Graphics;
    private _panel!: NineSlicePanel;
    private _titleText!: Text;
    private _scoreText!: Text;
    private _container!: Container;

    private readonly PANEL_WIDTH = 400;
    private readonly PANEL_HEIGHT = 300;

    constructor() {
        super();
        this.create();
    }

    create(): void {
        GlobalDispatcher.add(RESIZE_APP, this.updateLayout, this);

        this.createOverlay();
        this.createContainer();
        this.createPanel();
        this.createTitleText();
        this.createScoreText();
        this.updateLayout();
    }

    private createOverlay(): void {
        this._overlay = new Graphics();
        this._overlay.rect(0, 0, ScreenHelper.Width, ScreenHelper.Height);
        this._overlay.fill({ color: 0x000000, alpha: 0.7 });
        this.addChild(this._overlay);
    }

    private createContainer(): void {
        this._container = new Container();
        this.addChild(this._container);
    }

    private createPanel(): void {
        const texture = AssetsLoader.get('assets/frame_slice_1');
        if (texture) {
            this._panel = new NineSlicePanel({
                texture,
                width: this.PANEL_WIDTH,
                height: this.PANEL_HEIGHT,
                leftWidth: 22,
                topHeight: 22,
                rightWidth: 22,
                bottomHeight: 22
            });
            this._panel.position.set(-this.PANEL_WIDTH / 2, -this.PANEL_HEIGHT / 2);
            this._container.addChild(this._panel);
        }
    }

    private createTitleText(): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff,
            fontWeight: 'bold',
            align: 'center',
            dropShadow: {
                color: 0x000000,
                blur: 4,
                distance: 2
            }
        });

        this._titleText = new Text({
            text: 'Game Over',
            style
        });
        this._titleText.anchor.set(0.5);
        this._titleText.position.set(0, -60);
        this._container.addChild(this._titleText);
    }

    private createScoreText(): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xffffff,
            align: 'center',
            dropShadow: {
                color: 0x000000,
                blur: 2,
                distance: 1
            }
        });

        this._scoreText = new Text({
            text: 'Score: 0',
            style
        });
        this._scoreText.anchor.set(0.5);
        this._scoreText.position.set(0, 20);
        this._container.addChild(this._scoreText);
    }

    updateResult(isWin: boolean, score: number): void {
        this._titleText.text = isWin ? 'You Win!' : 'Game Over';
        this._titleText.style.fill = isWin ? 0x4ade80 : 0xf87171;
        this._scoreText.text = `Score: ${score}`;
    }

    private updateLayout = (): void => {
        this._overlay.clear();
        this._overlay.rect(0, 0, ScreenHelper.Width, ScreenHelper.Height);
        this._overlay.fill({ color: 0x000000, alpha: 0.7 });

        this._container.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y);
    };

    destroyView(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.updateLayout);
        this.destroy({ children: true });
    }
}
