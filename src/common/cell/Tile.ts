import * as PIXI from 'pixi.js';

export enum TileColor{
    RED = 0,
    YELLOW = 1,
    PURPURE = 2,
    BLUE = 3,
}

export enum BoostType {
}

export interface ITileData {
    color: TileColor;
    row: number;
    col: number;
    sizeTile:  number;
    margin?:  number;
}

export class Tile extends PIXI.Container {
   
    private _data: ITileData;
    private _content: any | null = null;

    constructor(data: ITileData, texture?: PIXI.Texture) {
        super();
        this._data = data;

        if (texture) {
            this.createSprite(texture);
        } else {
            this.createEmpty();
        }

        this.eventMode = 'static';
        this.cursor = 'pointer';
    }

    setTexture(texture?: PIXI.Texture): void {
        this.clearContent();

        if (texture) {
            this.createSprite(texture);
        } else {
            this.createEmpty();
        }
    }

    private createSprite(texture: PIXI.Texture): void {
        const sprite = new PIXI.Sprite(texture);
    
        sprite.width = this._data.sizeTile;
        sprite.height = this._data.sizeTile;

        this._content = sprite;
        this.addChild(sprite);
    }

    private createEmpty(): void {
        const g = new PIXI.Graphics();
        g.beginFill(0x3399ff);
        g.drawRect(0, 0, this._data.sizeTile, this._data.sizeTile);
        g.endFill();

        this._content = g;
        this.addChild(g);
    }

    private clearContent(): void {
        if (!this._content) return;

        this.removeChild(this._content);
        this._content.destroy();
        this._content = null;
    }

    get data(): ITileData {
        return this._data;
    }

    get tileColor(): TileColor {
        return this._data.color;
    }

    get row(): number {
        return this._data.row;
    }

    get col(): number {
        return this._data.col;
    }

    set row(value: number) {
        this._data.row = value;
    }

    set col(value: number) {
        this._data.col = value;
    }
}
