import * as PIXI from 'pixi.js';
import { Grid } from 'src/common/Grid/Grid';
import { BubbleTile } from '../tileBubble/BubbleTile';
import { TileColor } from 'src/common/cell/Tile';

export class BubbleGrid extends Grid {
    
    private _grid: (BubbleTile | null)[][];

    constructor(rows: number, cols: number, cellSize = 64, gap = 4) {
      super(rows, cols, cellSize, gap);
    }

    public createBG(){
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, this.gridWidth, this.gridHeight);
        bg.fill(0x1a1a2e);
        this.addChild(bg);
    }

    get gridWidth(): number {
        return this.cols * (this.cellSize + this.gap) - this.gap;
    }

    get gridHeight(): number {
        return this.rows * (this.cellSize + this.gap) - this.gap;
    }

    override buildEmptyGrid(): (BubbleTile | null)[][] {
        this._grid = [];

        for (let row = 0; row < this.rows; row++) {
            this._grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this._grid[row][col] = null;
            }
        }

        return this._grid;
    }

    public setTile(row: number, col: number, tile: BubbleTile | null): void {
        if (this.isValidPosition(row, col)) {
            if (tile) {
                this._grid[row][col] = tile;

                tile.row = row;
                tile.col = col;

                tile.x = col * (this.cellSize + this.gap);
                tile.y = row * (this.cellSize + this.gap);

                this.addChild(tile);
            }
        }
    }

    public getTile(row: number, col: number): BubbleTile | null {
        if (this.isValidPosition(row, col)) {
            return this._grid[row][col];
        }
        
        return null;
    }

    public isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    get grid(){
        return this._grid;
    }
    // public getRandomColor(list: BubbleTile[]): TileColor {
    //     return list[Math.floor(Math.random() * list.length)];
    // }
}
