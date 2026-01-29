import { Container } from "pixi.js";
import { View } from "src/core/mvc/View";
import { Grid } from "src/common/grid/Grid";
import { BubbleModel } from "./BubbleModel";
import { ScaledBackground } from "src/common/ui";
import AssetsLoader from "src/assetsLoader/AssetsLoader";

export class BubbleView extends View<BubbleModel> {
    private _background!: ScaledBackground;
    private _uiContainer!: Container;

    constructor() {
        super();
        this.create();
    }

    create(): void {
        this.createBackground();
        this.createUIContainer();
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
