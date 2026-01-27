import * as PIXI from 'pixi.js';
import { TileColor } from 'src/common/cell/Tile';

export class Item extends PIXI.Container {
    private _color: TileColor;
    private _sprite: PIXI.Sprite | null = null;

    constructor(color: TileColor, texture: PIXI.Texture) {
        super();
        this._color = color;

        if (texture) {
            this.createSprite(texture);
        }

        this.eventMode = 'static';
        this.cursor = 'pointer';
    }

    get color(): TileColor {
        return this._color;
    }

    setTexture(texture?: PIXI.Texture): void {
        this.clearSprite();
        if (texture) {
            this.createSprite(texture);
        }
    }

    private createSprite(texture: PIXI.Texture): void {
        this._sprite = new PIXI.Sprite(texture);
        this._sprite.anchor.set(0.5);
        this.addChild(this._sprite);
    }

    private clearSprite(): void {
        if (this._sprite) {
            this.removeChild(this._sprite);
            this._sprite.destroy();
            this._sprite = null;
        }
    }

    destroy(): void {
        this.clearSprite();
        super.destroy();
    }
}