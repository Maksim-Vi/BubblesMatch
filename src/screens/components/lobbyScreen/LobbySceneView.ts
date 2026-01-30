import { View } from "../../../core/mvc/View";
import GlobalDispatcher from "../../../events/GlobalDispatcher";
import { ScreenHelper } from "src/core/ScreenHelper";
import LobbySceneModel from "./LobbySceneModel";
import { IUITextOptions, ScaledBackground, UIButton, UIContainer, UIText } from "src/common/ui";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import { START_GAME } from "src/events/TypesDispatch";
import { Graphics } from "pixi.js";

export default class LobbySceneView extends View<LobbySceneModel> {

    private _background!: ScaledBackground;
    private playButton!: UIButton;
    private _container!: UIContainer;

    private readonly BUTTON_WIDTH = 500;
    private readonly BUTTON_HEIGHT = 100;

    private readonly DEFAULT_TEXT_STYLE: Partial<IUITextOptions> = {
        fontFamily: 'VAGRounded',
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 5 },
        dropShadow: { color: 0x000000, blur: 4, distance: 2 },
    };

    private readonly BUTTON_NINE_SLICE = {
        left: 100,
        top: 100,
        right: 100,
        bottom: 100,
    };

    constructor() {
        super();
        this.width = ScreenHelper.Width;
        this.height = ScreenHelper.Height;

        this.create();
    }

    create(): void {
        this.createBackground();
        this.createTitle();
        this.createPlayButton();
        this.createInstructions();
    }

    private createBackground(): void {
        const texture = AssetsLoader.get('bg/bg_loading');
        this._background = new ScaledBackground(texture);
        this.addChild(this._background);

        this._container = new UIContainer({
            width: ScreenHelper.Width,
            height: ScreenHelper.Height,
            flexDirection: "column",
            justifyContent: 'center',
            alignItems: 'center',
            gap: 80
        });

        this._container.position.set(0, 0);

        this.addChild(this._container);
    }

    private createTitle(): void {
        const uiText = this.createStyledText('Bubble Shooter', 64);
        this._container.addLayoutChild(uiText);
    }

    private createInstructions(): void {
        const uiText = this.createStyledText('Play to win!', 32);
        this._container.addLayoutChild(uiText);
    }

    private createPlayButton(): void {
        this.playButton = this.createStyledButton(
            'assets/buttons/button_red',
            'LOBBY',
            () => GlobalDispatcher.dispatch(START_GAME)
        );

        this._container.addLayoutChild(this.playButton);
    }

    private createStyledText(text: string, fontSize: number, position?: { x: number; y: number }): UIText {
        const uiText = new UIText({
            ...this.DEFAULT_TEXT_STYLE,
            text,
            fontSize,
            stroke: { ...this.DEFAULT_TEXT_STYLE.stroke, width: Math.round(fontSize / 10) },
            dropShadow: { ...this.DEFAULT_TEXT_STYLE.dropShadow, blur: Math.round(fontSize / 10) },
            maxWidth: 500,
        });
        if (position) {
            uiText.position.set(position.x, position.y);
        }
        return uiText;
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
