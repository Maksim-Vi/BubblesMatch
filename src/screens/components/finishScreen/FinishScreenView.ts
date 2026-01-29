import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { View } from "src/core/mvc/View";
import { FinishScreenModel } from "./FinishScreenModel";
import { NineSlicePanel, ScaledBackground } from "src/common/ui";
import { ScreenHelper } from "src/core/ScreenHelper";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { RESIZE_APP, RESTART_GAME, GO_TO_LOBBY } from "src/events/TypesDispatch";

export class FinishScreenView extends View<FinishScreenModel> {
    private _background!: ScaledBackground;
    private _overlay!: Graphics;
    private _panel!: NineSlicePanel;
    private _titleText!: Text;
    private _scoreText!: Text;
    private _container!: Container;
    private _restartButton!: Container;
    private _lobbyButton!: Container;

    private readonly PANEL_WIDTH = 1000;
    private readonly PANEL_HEIGHT = 600;
    private readonly BUTTON_WIDTH = 150;
    private readonly BUTTON_HEIGHT = 60;

    constructor() {
        super();
        this.create();
    }

    create(): void {
        GlobalDispatcher.add(RESIZE_APP, this.updateLayout, this);

        this.createBackground();
        this.createOverlay();
        this.createContainer();
        this.createPanel();
        this.createTitleText();
        this.createScoreText();
        this.createButtons();
        this.updateLayout();
    }

    private createBackground(): void {
        const bgKey = Math.random() < 0.5 ? 'bg/bg_1' : 'bg/bg_2';
        const texture = AssetsLoader.get(bgKey);
        this._background = new ScaledBackground(texture);
        this.addChild(this._background);
    }

    private createOverlay(): void {
        this._overlay = new Graphics();
        this._overlay.rect(0, 0, ScreenHelper.Width, ScreenHelper.Height);
        this._overlay.fill({ color: 0x000000, alpha: 0.5 });
        this.addChild(this._overlay);
    }

    private createContainer(): void {
        this._container = new Container();
        this.addChild(this._container);
    }

    private createPanel(): void {
        const texture = AssetsLoader.get('assets/frame_slice_1');
        if (texture) {
            // Corner borders in pixels - preserve decorative corners with gems
            const borderSize = 400;
            this._panel = new NineSlicePanel({
                texture,
                width: this.PANEL_WIDTH,
                height: this.PANEL_HEIGHT,
                leftWidth: borderSize,
                topHeight: borderSize,
                rightWidth: borderSize,
                bottomHeight: borderSize
            });
            this._panel.position.set(-this.PANEL_WIDTH / 2, -this.PANEL_HEIGHT / 2);
            this._container.addChild(this._panel);
        }
    }

    private createTitleText(): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 64,
            fill: 0xffffff,
            fontWeight: 'bold',
            align: 'center',
            stroke: {
                color: 0x000000,
                width: 6
            },
            dropShadow: {
                color: 0x000000,
                blur: 6,
                distance: 3
            }
        });

        this._titleText = new Text({
            text: 'Game Over',
            style
        });
        this._titleText.anchor.set(0.5);
        this._titleText.position.set(0, -this.PANEL_HEIGHT / 2 + 50 + 40);
        this._container.addChild(this._titleText);
    }

    private createScoreText(): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff,
            fontWeight: 'bold',
            align: 'center',
            stroke: {
                color: 0x000000,
                width: 5
            },
            dropShadow: {
                color: 0x000000,
                blur: 4,
                distance: 2
            }
        });

        this._scoreText = new Text({
            text: 'Score: 0',
            style
        });
        this._scoreText.anchor.set(0.5);
        this._scoreText.position.set(0, -this.PANEL_HEIGHT / 2 + 50 + 120);
        this._container.addChild(this._scoreText);
    }

    private createButtons(): void {
        this._restartButton = this.createButton('RESTART', 0x4ade80, () => {
            GlobalDispatcher.dispatch(RESTART_GAME);
        });
        this._restartButton.position.set(0, 60);
        this._container.addChild(this._restartButton);

        this._lobbyButton = this.createButton('LOBBY', 0x60a5fa, () => {
            GlobalDispatcher.dispatch(GO_TO_LOBBY);
        });
        this._lobbyButton.position.set(0, 140);
        this._container.addChild(this._lobbyButton);
    }

    private createButton(text: string, color: number, onClick: () => void): Container {
        const button = new Container();

        const buttonBg = new Graphics();
        buttonBg.roundRect(-this.BUTTON_WIDTH / 2, -this.BUTTON_HEIGHT / 2, this.BUTTON_WIDTH, this.BUTTON_HEIGHT, 12);
        buttonBg.fill(color);
        button.addChild(buttonBg);

        const buttonText = new Text({
            text,
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 28,
                fill: 0xffffff,
                fontWeight: 'bold'
            })
        });
        buttonText.anchor.set(0.5);
        button.addChild(buttonText);

        button.eventMode = 'static';
        button.cursor = 'pointer';

        const hoverColor = this.lightenColor(color, 0.2);

        button.on('pointerdown', onClick);

        button.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.roundRect(-this.BUTTON_WIDTH / 2, -this.BUTTON_HEIGHT / 2, this.BUTTON_WIDTH, this.BUTTON_HEIGHT, 12);
            buttonBg.fill(hoverColor);
        });

        button.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.roundRect(-this.BUTTON_WIDTH / 2, -this.BUTTON_HEIGHT / 2, this.BUTTON_WIDTH, this.BUTTON_HEIGHT, 12);
            buttonBg.fill(color);
        });

        return button;
    }

    private lightenColor(color: number, amount: number): number {
        const r = Math.min(255, ((color >> 16) & 0xFF) + Math.round(255 * amount));
        const g = Math.min(255, ((color >> 8) & 0xFF) + Math.round(255 * amount));
        const b = Math.min(255, (color & 0xFF) + Math.round(255 * amount));
        return (r << 16) | (g << 8) | b;
    }

    updateResult(isWin: boolean, score: number): void {
        this._titleText.text = isWin ? 'You Win!' : 'Game Over';
        this._titleText.style.fill = isWin ? 0x4ade80 : 0xf87171;
        this._scoreText.text = `Score: ${score}`;
    }

    private updateLayout = (): void => {
        this._overlay.clear();
        this._overlay.rect(0, 0, ScreenHelper.Width, ScreenHelper.Height);
        this._overlay.fill({ color: 0x000000, alpha: 0.5 });

        this._container.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y);
    };

    destroyView(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.updateLayout);
        this.destroy({ children: true });
    }
}
