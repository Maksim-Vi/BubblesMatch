import { Container, Text, TextStyle } from "pixi.js";
import { View } from "src/core/mvc/View";
import { LeftTableModel } from "./LeftTableModel";
import { NineSlicePanel } from "src/common/ui";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import { ScreenHelper } from "src/core/ScreenHelper";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { RESIZE_APP } from "src/events/TypesDispatch";

export class LeftTableView extends View<LeftTableModel> {
    private _panel!: NineSlicePanel;
    private _scoreText!: Text;
    private _movesText!: Text;
    private _container!: Container;

    private readonly PANEL_WIDTH = 350;
    private readonly PANEL_HEIGHT = 700;
    private readonly PADDING = 100;
    private readonly MARGIN_LEFT = 50;

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
            this._panel = new NineSlicePanel({
                texture,
                width: this.PANEL_WIDTH,
                height: this.PANEL_HEIGHT,
                leftWidth: 0.1,
                topHeight: 0.1,
                rightWidth: 0.1,
                bottomHeight: 0.1
            });
            this._container.addChild(this._panel);
        }
    }

    private createScoreText(): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            fontWeight: 'bold',
            align: 'left',
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
        this._scoreText.position.set(this.PADDING, this.PADDING + 10);
        this._container.addChild(this._scoreText);
    }

    private createMovesText(): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            align: 'left',
            dropShadow: {
                color: 0x000000,
                blur: 2,
                distance: 1
            }
        });

        this._movesText = new Text({
            text: 'Moves: 0',
            style
        });
        this._movesText.position.set(this.PADDING, this.PADDING + 50);
        this._container.addChild(this._movesText);
    }

    private updateLayout = (): void => {
        // Center vertically on left side
        const centerY = ScreenHelper.Center.y - this.PANEL_HEIGHT / 2;
        this.position.set(this.MARGIN_LEFT, centerY);
    };

    updateScore(score: number): void {
        this._scoreText.text = `Score: ${score}`;
    }

    updateMoves(movesLeft: number, maxMoves: number): void {
        this._movesText.text = `Moves: ${movesLeft}/${maxMoves}`;
    }

    destroyView(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.updateLayout);
        this.destroy({ children: true });
    }
}
