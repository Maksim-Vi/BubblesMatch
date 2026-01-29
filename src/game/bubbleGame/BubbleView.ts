import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { View } from "src/core/mvc/View";
import { Grid } from "src/common/grid/Grid";
import { BubbleModel } from "./BubbleModel";
import { ScaledBackground } from "src/common/ui";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import { ScreenHelper } from "src/core/ScreenHelper";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { EXIT_GAME } from "src/events/TypesDispatch";

export class BubbleView extends View<BubbleModel> {
    private _background!: ScaledBackground;
    private _uiContainer!: Container;
    private _exitButton!: Container;

    constructor() {
        super();
        this.create();
    }

    create(): void {
        this.createBackground();
        this.createUIContainer();
        this.createExitButton();
    }

    private createBackground(): void {
        // Randomly select between bg_1 and bg_2
        const bgKey = Math.random() < 0.5 ? 'bg/bg_1' : 'bg/bg_2';
        const texture = AssetsLoader.get(bgKey);
        this._background = new ScaledBackground(texture);
        this.addChild(this._background);
    }

    private createUIContainer(): void {
        this._uiContainer = new Container();
        this.addChild(this._uiContainer);
    }

    private createExitButton(): void {
        this._exitButton = new Container();
        this._exitButton.eventMode = 'static';
        this._exitButton.cursor = 'pointer';

        const size = 50;
        const padding = 20;

        // Button background (circle)
        const bg = new Graphics();
        bg.beginFill(0xCC0000);
        bg.drawCircle(0, 0, size / 2);
        bg.endFill();
        this._exitButton.addChild(bg);

        // X symbol
        const xText = new Text('✕', new TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fontWeight: 'bold',
            fill: 0xFFFFFF
        }));
        xText.anchor.set(0.5);
        this._exitButton.addChild(xText);

        // Position in top right corner
        this._exitButton.position.set(
            ScreenHelper.Width - padding - size / 2,
            padding + size / 2
        );

        // Hover effects
        this._exitButton.on('pointerover', () => {
            this._exitButton.scale.set(1.1);
            bg.tint = 0xFF3333;
        });

        this._exitButton.on('pointerout', () => {
            this._exitButton.scale.set(1);
            bg.tint = 0xFFFFFF;
        });

        // Click handler
        this._exitButton.on('pointertap', () => {
            GlobalDispatcher.dispatch(EXIT_GAME);
        });

        this.addChild(this._exitButton);
    }

    get uiContainer(): Container {
        return this._uiContainer;
    }

    initializeGrid(grid: Grid): void {
        this.addChild(grid);
    }

    destroyView(): void {
        if (this._background) {
            this._background.destroy();
        }
        if (this._uiContainer) {
            this._uiContainer.removeChildren();
        }
        this.removeChildren();
    }
}
