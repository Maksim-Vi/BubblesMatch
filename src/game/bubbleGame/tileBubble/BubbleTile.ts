import * as PIXI from 'pixi.js';
import { ITileData, Tile } from 'src/common/cell/Tile';
import { Item } from '../Item/Item';

export class BubbleTile extends Tile {
    private _item: Item | null = null;
    private static readonly ITEM_MARGIN = 5;

    constructor(data: ITileData, texture?: PIXI.Texture) {
        super(data, texture);
    }

    public setItem(item: Item): void {
        if (this._item) {
            this.removeItem();
        }

        this._item = item;
        this.fitItemToTile(item);
        item.position.set(this.data.sizeTile / 2, this.data.sizeTile / 2);
        this.addChild(item);
    }

    private fitItemToTile(item: Item): void {
        const margin = this.data.margin ? this.data.margin : BubbleTile.ITEM_MARGIN;
        const availableSize = this.data.sizeTile - margin * 2;
        const bounds = item.getLocalBounds();
        const itemSize = Math.max(bounds.width, bounds.height);

        if (itemSize > 0) {
            const scale = availableSize / itemSize;
            item.scale.set(scale);
        }
    }

    public removeItem(): Item | null {
        if (!this._item) {
            return null;
        }

        const item = this._item;
        this.removeChild(item);
        this._item = null;
        return item;
    }

    public getItem(): Item | null {
        return this._item;
    }

    public hasItem(): boolean {
        return this._item !== null;
    }
}