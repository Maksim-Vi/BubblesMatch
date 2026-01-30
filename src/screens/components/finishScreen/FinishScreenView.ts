import { Container, Graphics } from "pixi.js";
import "@pixi/layout";
import { View } from "src/core/mvc/View";
import { FinishScreenModel } from "./FinishScreenModel";
import { NineSlicePanel, ScaledBackground, UIText, UIButton, UIContainer, IUITextOptions } from "src/common/ui";
import { ScreenHelper } from "src/core/ScreenHelper";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { RESIZE_APP, RESTART_GAME, GO_TO_LOBBY } from "src/events/TypesDispatch";

export class FinishScreenView extends View<FinishScreenModel> {
    private _background!: ScaledBackground;
    private _overlay!: Graphics;
    private _panel!: NineSlicePanel;
    private _titleText!: UIText;
    private _scoreText!: UIText;
    private _container!: Container;
    private _restartButton!: UIButton;
    private _lobbyButton!: UIButton;
    private _buttonsContainer!: UIContainer;

    private readonly PANEL_WIDTH = 850;
    private readonly PANEL_HEIGHT = 600;
    private readonly BUTTON_WIDTH = 250;
    private readonly BUTTON_HEIGHT = 80;
    private readonly BUTTON_GAP = 40;

    private readonly DEFAULT_TEXT_STYLE: Partial<IUITextOptions> = {
        fontFamily: 'VAGRounded',
        fill: 0xffffff,
        fontWeight: 'bold',
        anchor: 0.5,
        stroke: { color: 0x000000, width: 5 },
        dropShadow: { color: 0x000000, blur: 4, distance: 2 },
    };

    private readonly BUTTON_NINE_SLICE = {
        left: 110,
        top: 110,
        right: 110,
        bottom: 110,
    };

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
        this.createTexts();
        this.createButtons();
        this.updateLayout();
    }

    private createBackground(): void {
        const bgKey = Math.random() < 0.5 ? 'bg/bg_1' : 'bg/bg_2';
        this._background = new ScaledBackground(AssetsLoader.get(bgKey));
        this.addChild(this._background);
    }

    private createOverlay(): void {
        this._overlay = new Graphics();
        this.addChild(this._overlay);
    }

    private createContainer(): void {
        this._container = new Container();
        this.addChild(this._container);
    }

    private createPanel(): void {
        const texture = AssetsLoader.get('assets/frame_slice_1');
        if (!texture) return;

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

    private createStyledText(text: string, fontSize: number, position: { x: number; y: number }): UIText {
        const uiText = new UIText({
            ...this.DEFAULT_TEXT_STYLE,
            text,
            fontSize,
            stroke: { ...this.DEFAULT_TEXT_STYLE.stroke, width: Math.round(fontSize / 10) },
            dropShadow: { ...this.DEFAULT_TEXT_STYLE.dropShadow, blur: Math.round(fontSize / 10) },
            maxWidth: this.PANEL_WIDTH - 100,
        });
        uiText.position.set(position.x, position.y);
        this._container.addChild(uiText);
        return uiText;
    }

    private createTexts(): void {
        this._titleText = this.createStyledText('Game Over', 64, { x: 0, y: -this.PANEL_HEIGHT / 2 + 120 });
        this._scoreText = this.createStyledText('Score: 0', 48, { x: 0, y: -20 });
    }

    private createStyledButton(textureKey: string, text: string, onClick: () => void): UIButton {
        return new UIButton({
            texture: AssetsLoader.get(textureKey),
            width: this.BUTTON_WIDTH,
            height: this.BUTTON_HEIGHT,
            text,
            nineSlice: this.BUTTON_NINE_SLICE,
            anchor: { x: 0, y: 0 },
            textOptions: {
                fontSize: 28,
                fontFamily: 'VAGRounded',
            },
            onClick,
        });
    }

    private createButtons(): void {
        this._buttonsContainer = new UIContainer({
            width: this.BUTTON_WIDTH * 2 + this.BUTTON_GAP,
            height: this.BUTTON_HEIGHT,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: this.BUTTON_GAP,
        });
        this._buttonsContainer.position.set(
            -(this.BUTTON_WIDTH * 2 + this.BUTTON_GAP) / 2,
            this.PANEL_HEIGHT / 2 - this.BUTTON_HEIGHT - 120
        );
        this._container.addChild(this._buttonsContainer);

        this._restartButton = this.createStyledButton(
            'assets/buttons/button_gold',
            'RESTART',
            () => GlobalDispatcher.dispatch(RESTART_GAME)
        );
        this._buttonsContainer.addLayoutChild(this._restartButton);

        this._lobbyButton = this.createStyledButton(
            'assets/buttons/button_red',
            'LOBBY',
            () => GlobalDispatcher.dispatch(GO_TO_LOBBY)
        );
        this._buttonsContainer.addLayoutChild(this._lobbyButton);
    }

    updateResult(isWin: boolean, score: number): void {
        this._titleText.setText(isWin ? 'You Win!' : 'Game Over');
        this._titleText.setStyle({ fill: isWin ? 0x4ade80 : 0xf87171 });
        this._scoreText.setText(`Score: ${score}`);
    }

    private updateLayout = (): void => {
        this._overlay.clear();
        this._overlay.rect(
            ScreenHelper.TopLeft.x,
            ScreenHelper.TopLeft.y,
            ScreenHelper.ViewportWidth,
            ScreenHelper.ViewportHeight
        );
        this._overlay.fill({ color: 0x000000, alpha: 0.5 });
        this._container.position.set(ScreenHelper.ViewportCenter.x, ScreenHelper.ViewportCenter.y);
    };

    destroyView(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.updateLayout);
        this.destroy({ children: true });
    }
}
