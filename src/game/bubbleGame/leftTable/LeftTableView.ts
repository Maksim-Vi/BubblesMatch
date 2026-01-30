import { Container } from "pixi.js";
import { View } from "src/core/mvc/View";
import { LeftTableModel } from "./LeftTableModel";
import { NineSlicePanel, UIText } from "src/common/ui";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import { ScreenHelper } from "src/core/ScreenHelper";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { RESIZE_APP } from "src/events/TypesDispatch";

export class LeftTableView extends View<LeftTableModel> {
    private _panel!: NineSlicePanel;
    private _scoreText!: UIText;
    private _scoreCountText!: UIText;
    private _movesLabel!: UIText;
    private _movesValue!: UIText;
    private _container!: Container;

    private readonly COLOR_WHITE = 0xffffff;
    private readonly COLOR_RED = 0xff3333;
    private readonly COLOR_LIGHT_GREEN = 0x90ee90;
    private readonly COLOR_GREEN = 0x32cd32;

    private readonly PANEL_WIDTH = 350;
    private readonly PANEL_HEIGHT = 800;
    private readonly MARGIN_LEFT = 30;

    constructor() {
        super();
        this.create();
    }

    create(): void {
        GlobalDispatcher.add(RESIZE_APP, this.updateLayout, this);

        this._container = new Container();
        this.addChild(this._container);

        this.createPanel();
        this.createScoreText();
        this.createMovesText();
        this.updateLayout();
    }

    private createPanel(): void {
        const texture = AssetsLoader.get('assets/frame_slice_1');
        if (texture) {
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
            this._container.addChild(this._panel);
        }
    }

    private createScoreText(): void {
        this._scoreText = new UIText({
            text: 'Score:',
            fontSize: 36,
            fill: this.COLOR_WHITE,
            stroke: { color: 0x000000, width: 4 },
            dropShadow: { color: 0x000000, blur: 4, distance: 2 },
            anchor: { x: 0.5, y: 0 },
            position: { x: this.PANEL_WIDTH / 2, y: 50 }
        });
        this._container.addChild(this._scoreText);

        this._scoreCountText = new UIText({
            text: '0 / 0',
            fontSize: 36,
            fill: this.COLOR_WHITE,
            stroke: { color: 0x000000, width: 4 },
            dropShadow: { color: 0x000000, blur: 4, distance: 2 },
            anchor: { x: 0.5, y: 0 },
            position: { x: this.PANEL_WIDTH / 2, y: 100 }
        });
        this._container.addChild(this._scoreCountText);
    }

    private createMovesText(): void {
        this._movesLabel = new UIText({
            text: 'Moves: ',
            fontSize: 32,
            fill: this.COLOR_WHITE,
            stroke: { color: 0x000000, width: 4 },
            dropShadow: { color: 0x000000, blur: 4, distance: 2 },
            anchor: { x: 1, y: 0 },
            position: { x: this.PANEL_WIDTH / 2, y: this.PANEL_HEIGHT - 120 }
        });
        this._container.addChild(this._movesLabel);

        this._movesValue = new UIText({
            text: '0/0',
            fontSize: 32,
            fill: this.COLOR_WHITE,
            stroke: { color: 0x000000, width: 4 },
            dropShadow: { color: 0x000000, blur: 4, distance: 2 },
            anchor: { x: 0, y: 0 },
            position: { x: this.PANEL_WIDTH / 2, y: this.PANEL_HEIGHT - 120 }
        });
        this._container.addChild(this._movesValue);
    }

    private updateLayout = (): void => {
        // Center vertically on left side
        const centerY = ScreenHelper.Center.y - this.PANEL_HEIGHT / 2;
        this.position.set(this.MARGIN_LEFT, centerY);
    };

    updateScore(score: number, needScore: number): void {
        this._scoreCountText.setText(`${score} / ${needScore}`);

        if (score >= needScore) {
            this._scoreCountText.setStyle({ fill: this.COLOR_GREEN });
        } else if (score >= needScore * 0.8) {
            this._scoreCountText.setStyle({ fill: this.COLOR_LIGHT_GREEN });
        } else {
            this._scoreCountText.setStyle({ fill: this.COLOR_WHITE });
        }
    }

    updateMoves(movesLeft: number, maxMoves: number): void {
        this._movesValue.setText(`${movesLeft}/${maxMoves}`);

        if (movesLeft <= 5) {
            this._movesValue.setStyle({ fill: this.COLOR_RED });
        } else {
            this._movesValue.setStyle({ fill: this.COLOR_WHITE });
        }
    }

    destroyView(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.updateLayout);
        this.destroy();
    }
}
