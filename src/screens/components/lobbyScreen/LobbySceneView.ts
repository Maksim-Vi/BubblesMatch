import { View } from "../../../core/mvc/View";
import * as PIXI from "pixi.js";
import GlobalDispatcher from "../../../events/GlobalDispatcher";
import { ScreenHelper } from "src/core/ScreenHelper";
import LobbySceneModel from "./LobbySceneModel";
import { ScaledBackground } from "src/common/ui";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import { START_GAME } from "src/events/TypesDispatch";

export default class LobbySceneView extends View<LobbySceneModel> {

    private _background!: ScaledBackground;
    private _text!: PIXI.Text;
    private playButton!: PIXI.Container;

    constructor() {
        super();
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
    }

    private createTitle(): void {
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 120,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: { color: 0x16213e, width: 8 },
            dropShadow: {
                color: 0x000000,
                blur: 4,
                angle: Math.PI / 6,
                distance: 6
            }
        });

        const title = new PIXI.Text({ text: 'Bubble Shooter', style: titleStyle });
        title.anchor.set(0.5);
        title.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y - 200);
        this.addChild(title);
    }

    private createPlayButton(): void {
        this.playButton = new PIXI.Container();

        const buttonBg = new PIXI.Graphics();
        buttonBg.roundRect(-150, -50, 300, 100, 20);
        buttonBg.fill(0xe94560);
        this.playButton.addChild(buttonBg);

        const buttonText = new PIXI.Text({
            text: 'PLAY GAME',
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0xffffff,
                fontWeight: 'bold'
            })
        });
        buttonText.anchor.set(0.5);
        this.playButton.addChild(buttonText);

        this.playButton.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y + 100);
        this.playButton.eventMode = 'static';
        this.playButton.cursor = 'pointer';

        this.playButton.on('pointerdown', () => {
            GlobalDispatcher.dispatch(START_GAME);
        });

        this.playButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.roundRect(-150, -50, 300, 100, 20);
            buttonBg.fill(0xff6b81);
        });

        this.playButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.roundRect(-150, -50, 300, 100, 20);
            buttonBg.fill(0xe94560);
        });

        this.addChild(this.playButton);
    }

    private createInstructions(): void {
        const instructionsStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fill: 0xffffff,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 800
        });

        const instructions = new PIXI.Text({
            text: 'Play to win!',
            style: instructionsStyle
        });
        instructions.anchor.set(0.5);
        instructions.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y + 300);
        this.addChild(instructions);
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
