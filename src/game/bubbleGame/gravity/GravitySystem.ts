export interface IGravityCell {
    hasItem(): boolean;
    getItem(): unknown | null;
    setItem(item: unknown): void;
    removeItem(): unknown | null;
}

export interface IGravityGrid<T extends IGravityCell> {
    rows: number;
    cols: number;
    getTile(row: number, col: number): T | null;
    isValidPosition(row: number, col: number): boolean;
}

export interface GravityMove {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

export interface EmptyCell {
    row: number;
    col: number;
}

export class GravitySystem<T extends IGravityCell> {
    private grid: IGravityGrid<T>;

    constructor(grid: IGravityGrid<T>) {
        this.grid = grid;
    }

    public setGrid(grid: IGravityGrid<T>): void {
        this.grid = grid;
    }

    /**
     * Apply gravity - items fall down to fill empty cells below
     * Returns list of moves that were made
     */
    public applyGravity(): GravityMove[] {
        const moves: GravityMove[] = [];

        // Process each column from bottom to top
        for (let col = 0; col < this.grid.cols; col++) {
            moves.push(...this.applyGravityToColumn(col));
        }

        return moves;
    }

    private applyGravityToColumn(col: number): GravityMove[] {
        const moves: GravityMove[] = [];

        // Start from second-to-last row and go up
        for (let row = this.grid.rows - 2; row >= 0; row--) {
            const tile = this.grid.getTile(row, col);
            if (!tile || !tile.hasItem()) continue;

            // Find the lowest empty cell below this one
            let targetRow = row;
            for (let checkRow = row + 1; checkRow < this.grid.rows; checkRow++) {
                const belowTile = this.grid.getTile(checkRow, col);
                if (belowTile && !belowTile.hasItem()) {
                    targetRow = checkRow;
                } else {
                    break;
                }
            }

            // Move item if there's a lower empty cell
            if (targetRow !== row) {
                const targetTile = this.grid.getTile(targetRow, col);
                if (targetTile) {
                    const item = tile.removeItem();
                    if (item) {
                        targetTile.setItem(item);
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: targetRow,
                            toCol: col
                        });
                    }
                }
            }
        }

        return moves;
    }

    /**
     * Shift columns right to fill empty columns
     * Returns list of moves that were made
     */
    public shiftRight(): GravityMove[] {
        const moves: GravityMove[] = [];

        // Find empty columns and shift non-empty columns right
        let writeCol = this.grid.cols - 1;

        for (let readCol = this.grid.cols - 1; readCol >= 0; readCol--) {
            if (!this.isColumnEmpty(readCol)) {
                if (writeCol !== readCol) {
                    // Move entire column from readCol to writeCol
                    moves.push(...this.moveColumn(readCol, writeCol));
                }
                writeCol--;
            }
        }

        return moves;
    }

    private isColumnEmpty(col: number): boolean {
        for (let row = 0; row < this.grid.rows; row++) {
            const tile = this.grid.getTile(row, col);
            if (tile && tile.hasItem()) {
                return false;
            }
        }
        return true;
    }

    private moveColumn(fromCol: number, toCol: number): GravityMove[] {
        const moves: GravityMove[] = [];

        for (let row = 0; row < this.grid.rows; row++) {
            const fromTile = this.grid.getTile(row, fromCol);
            const toTile = this.grid.getTile(row, toCol);

            if (fromTile && toTile && fromTile.hasItem()) {
                const item = fromTile.removeItem();
                if (item) {
                    toTile.setItem(item);
                    moves.push({
                        fromRow: row,
                        fromCol: fromCol,
                        toRow: row,
                        toCol: toCol
                    });
                }
            }
        }

        return moves;
    }

    /**
     * Get all empty cells (for spawning new items)
     * Returns cells from top to bottom, left to right
     */
    public getEmptyCells(): EmptyCell[] {
        const emptyCells: EmptyCell[] = [];

        for (let col = 0; col < this.grid.cols; col++) {
            for (let row = 0; row < this.grid.rows; row++) {
                const tile = this.grid.getTile(row, col);
                if (tile && !tile.hasItem()) {
                    emptyCells.push({ row, col });
                }
            }
        }

        return emptyCells;
    }

    /**
     * Apply full gravity cycle: gravity down + shift right
     * Returns all moves made
     */
    public applyFullGravity(): { gravityMoves: GravityMove[]; shiftMoves: GravityMove[] } {
        const gravityMoves = this.applyGravity();
        const shiftMoves = this.shiftRight();

        return { gravityMoves, shiftMoves };
    }
}
