import * as PIXI from 'pixi.js';
import { Tile } from '../cell/Tile';

export class Grid extends PIXI.Container {

    public rows: number;
    public cols: number;
    public cellSize: number;
    public gap: number;

    constructor(rows: number, cols: number, cellSize = 64, gap = 4) {
      super();
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.gap = gap;

        this.buildEmptyGrid();
    }

    protected buildEmptyGrid(): (Tile | null)[][] {
        const grid: (Tile | null)[][] = [];
        
        for (let row = 0; row < this.rows; row++) {
            grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                grid[row][col] = null;
            }
        }

        return grid;
    }

    // build() {
    //     this.removeChildren();

    //     for (let row = 0; row < this.rows; row++) {
    //     for (let col = 0; col < this.cols; col++) {
    //         const cell = this.createCell(row, col);

    //         cell.x = col * (this.cellSize + this.gap);
    //         cell.y = row * (this.cellSize + this.gap);

    //         this.addChild(cell);
    //     }
    //     }
    // }

    createCell(row: number, col: number): PIXI.Graphics {
        const g = new PIXI.Graphics();

        g.beginFill(0x3399ff);
        g.drawRect(0, 0, this.cellSize, this.cellSize);
        g.endFill();

        return g;
    }
}
