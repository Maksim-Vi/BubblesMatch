import { View } from "../../../core/mvc/View";
import GlobalDispatcher from "../../../events/GlobalDispatcher";
import { ScreenHelper } from "src/core/ScreenHelper";
import LobbySceneModel from "./LobbySceneModel";
import { IUITextOptions, ScaledBackground, UIContainer, UIText } from "src/common/ui";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import { RESIZE_APP } from "src/events/TypesDispatch";
import LevelsWindowView, { ILevelsWindowOptions } from "../../../levelsWindow/LevelsWindowView";

export default class LobbySceneView extends View<LobbySceneModel> {

    private _background!: ScaledBackground;
    private _container!: UIContainer;
    private _levelsWindow!: LevelsWindowView;

    private readonly DEFAULT_TEXT_STYLE: Partial<IUITextOptions> = {
        fontFamily: 'VAGRounded',
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 5 },
        dropShadow: { color: 0x000000, blur: 4, distance: 2 },
    };

    private _levelsOptions!: ILevelsWindowOptions;

    constructor(levelsOptions: ILevelsWindowOptions) {
        super();
        this._levelsOptions = levelsOptions;
        this.width = ScreenHelper.Width;
        this.height = ScreenHelper.Height;

        this.create();
    }

    create(): void {
        GlobalDispatcher.add(RESIZE_APP, this.updateLayout, this);

        this.createBackground();
        this.createTitle();
        this.createLevelsWindow();
        this.updateLayout();
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
            gap: 40
        });

        this._container.position.set(0, 0);

        this.addChild(this._container);
    }

    private createTitle(): void {
        const uiText = this.createStyledText('Bubble Shooter', 64);
        this._container.addLayoutChild(uiText);
    }

    private createLevelsWindow(): void {
        this._levelsWindow = new LevelsWindowView(this._levelsOptions);
        this._levelsWindow.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y + 50);
        this.addChild(this._levelsWindow);
    }

    private createStyledText(text: string, fontSize: number): UIText {
        const uiText = new UIText({
            ...this.DEFAULT_TEXT_STYLE,
            text,
            fontSize,
            stroke: { ...this.DEFAULT_TEXT_STYLE.stroke, width: Math.round(fontSize / 10) },
            dropShadow: { ...this.DEFAULT_TEXT_STYLE.dropShadow, blur: Math.round(fontSize / 10) },
            maxWidth: 500,
        });
        return uiText;
    }

    private updateLayout = (): void => {
        this._levelsWindow.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y + 50);
    }

    updateLevels(options: ILevelsWindowOptions): void {
        this._levelsOptions = options;
        this._levelsWindow.updateLevels(options);
    }

    show(): void {
        this.visible = true;
    }

    hide(): void {
        this.visible = false;
    }

    destroyView(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.updateLayout);
        this.destroy({ children: true });
    }
}
