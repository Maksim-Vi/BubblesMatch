import { Container, Graphics } from "pixi.js";
import { View } from "src/core/mvc/View";
import LevelsWindowModel from "./LevelsWindowModel";
import { NineSlicePanel, UIButton, UIText, IUITextOptions, ScrollBox, ScaledBackground } from "src/common/ui";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { SELECT_LEVEL, PLAY_CURRENT_LEVEL } from "src/events/TypesDispatch";
import { ILevelConfig } from "src/store/LevelStore";

export interface ILevelsWindowOptions {
    levels: ILevelConfig[];
    unlockedLevel: number;
    currentLevel: number;
}

export default class LevelsWindowView extends View<LevelsWindowModel> {
    private _background!: NineSlicePanel | ScaledBackground;
    private _scrollBox!: ScrollBox;
    private _levelsGrid!: Container;
    private _playButton!: UIButton;
    private _levelButtons: UIButton[] = [];

    private _options: ILevelsWindowOptions;

    private readonly PANEL_WIDTH = 650;
    private readonly PANEL_HEIGHT = 650;

    private readonly GRID_COLS = 3;
    private readonly CELL_SIZE = 120;
    private readonly CELL_GAP = 20;
    private readonly SCROLL_HEIGHT = 400;

    private readonly BUTTON_WIDTH = 200;
    private readonly BUTTON_HEIGHT = 60;

    private readonly DEFAULT_TEXT_STYLE: Partial<IUITextOptions> = {
        fontFamily: 'VAGRounded',
        fill: 0xffffff,
        fontWeight: 'bold',
        anchor: 0.5,
        stroke: { color: 0x000000, width: 4 },
        dropShadow: { color: 0x000000, blur: 3, distance: 2 },
    };

    private readonly BUTTON_NINE_SLICE = {
        left: 120,
        top: 120,
        right: 120,
        bottom: 120,
    };

    constructor(options: ILevelsWindowOptions) {
        super();
        this._options = options;
        this.create();
    }

    create(): void {
        this.createBackground();
        this.createTitle();
        this.createScrollableGrid();
        this.createPlayButton();
    }

    private createBackground(): void {
        const texture = AssetsLoader.get('assets/levels_bg');
        if (!texture) {
            const fallback = new Graphics();
            fallback.roundRect(0, 0, this.PANEL_WIDTH, this.PANEL_HEIGHT, 20);
            fallback.fill({ color: 0x2a2a5a, alpha: 0.95 });
            this.addChild(fallback);
            return;
        }

        this._background = new ScaledBackground(texture);
        this._background.setSize(this.PANEL_WIDTH, this.PANEL_HEIGHT);
        this._background.anchor.set(1);
        this._background.position.set(this.PANEL_WIDTH / 2, this.PANEL_HEIGHT / 2);
        this.addChild(this._background);
    }

    private createTitle(): void {
        const title = new UIText({
            ...this.DEFAULT_TEXT_STYLE,
            text: 'SELECT LEVEL',
            fontSize: 36,
        });
        title.position.set(0, -this.PANEL_HEIGHT / 2 - 50);
        this.addChild(title);
    }

    private createScrollableGrid(): void {
        const scrollWidth = this.GRID_COLS * (this.CELL_SIZE + this.CELL_GAP) - this.CELL_GAP;

        this._scrollBox = new ScrollBox({
            width: scrollWidth + 20,
            height: this.SCROLL_HEIGHT,
        });
        this._scrollBox.position.set(-scrollWidth / 2 - 10, -this.PANEL_HEIGHT / 2 + 100);
        this.addChild(this._scrollBox);

        this._levelsGrid = new Container();
        this._scrollBox.addScrollContent(this._levelsGrid);

        this.createLevelButtons();
    }

    private createLevelButtons(): void {
        const levels = this._options.levels;

        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const col = i % this.GRID_COLS;
            const row = Math.floor(i / this.GRID_COLS);

            const x = col * (this.CELL_SIZE + this.CELL_GAP) + 10;
            const y = row * (this.CELL_SIZE + this.CELL_GAP) + 10;

            const isUnlocked = level.id <= this._options.unlockedLevel;
            const isCurrent = level.id === this._options.currentLevel;

            const button = this.createLevelButton(level.id, isUnlocked, isCurrent);
            button.position.set(x, y);
            this._levelsGrid.addChild(button);
            this._levelButtons.push(button);
        }
    }

    private createLevelButton(levelId: number, isUnlocked: boolean, isCurrent: boolean): UIButton {
        let textureKey = 'assets/buttons/button_red';
        if (!isUnlocked) {
            textureKey = 'assets/buttons/button_blue';
        } else if (isCurrent) {
            textureKey = 'assets/buttons/button_gold';
        }

        const texture = AssetsLoader.get(textureKey);

        const button = new UIButton({
            texture,
            width: this.CELL_SIZE,
            height: this.CELL_SIZE,
            text: isUnlocked ? String(levelId) : '?',
            nineSlice: this.BUTTON_NINE_SLICE,
            anchor: { x: 0, y: 0 },
            textOptions: {
                fontSize: 32,
                fontFamily: 'VAGRounded',
            },
            onClick: isUnlocked ? () => this.onLevelSelect(levelId) : undefined,
        });

        if (!isUnlocked) {
            button.alpha = 0.6;
        }

        return button;
    }

    private onLevelSelect(levelId: number): void {
        GlobalDispatcher.dispatch(SELECT_LEVEL, { levelId });
    }

    private createPlayButton(): void {
        const texture = AssetsLoader.get('assets/buttons/button_gold');

        this._playButton = new UIButton({
            texture,
            width: this.BUTTON_WIDTH,
            height: this.BUTTON_HEIGHT,
            text: 'PLAY',
            nineSlice: this.BUTTON_NINE_SLICE,
            anchor: { x: 0.5, y: 0.5 },
            textOptions: {
                fontSize: 24,
                fontFamily: 'VAGRounded',
            },
            onClick: () => GlobalDispatcher.dispatch(PLAY_CURRENT_LEVEL),
        });
        this._playButton.position.set(0, this.PANEL_HEIGHT / 2 + 50);
        this.addChild(this._playButton);
    }

    updateLevels(options: ILevelsWindowOptions): void {
        this._options = options;

        this._levelButtons.forEach(btn => btn.destroy());
        this._levelButtons = [];
        this._levelsGrid.removeChildren();

        this.createLevelButtons();
    }

    destroyView(): void {
        this._levelButtons = [];
        this.destroy({ children: true });
    }
}
