import { Container, Graphics } from "pixi.js";
import { View } from "src/core/mvc/View";
import { ScreenHelper } from "src/core/ScreenHelper";
import { Grid } from "src/common/Grid/Grid";
import { BubbleModel } from "./BubbleModel";

export class BubbleView extends View<BubbleModel> {
    private gridBackgroundContainer!: Container;
    private tilesContainer!: Container;

    constructor() {
        super();
        this.create();
    }

    create(): void {
        this.createBackground();
        this.createUI();
    }

    private createBackground(): void {
        const bg = new Graphics();
        bg.rect(0, 0, ScreenHelper.Width, ScreenHelper.Height);
        bg.fill(0x1a1a2e);
        this.addChild(bg);
    }

    private createUI(): void {

    }

    initializeGrid(grid: Grid): void {
        this.addChild(grid);
    }

    destroyView(): void {
        this.gridBackgroundContainer.removeChildren();
        this.tilesContainer.removeChildren();
        this.removeChildren();
    }
}
