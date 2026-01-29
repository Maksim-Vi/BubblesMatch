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
     * Runs multiple passes until no more moves are made (stable state)
     */
    public applyGravity(): GravityMove[] {
        const allMoves: GravityMove[] = [];
        let hasChanges = true;

        while (hasChanges) {
            hasChanges = false;

            // Process columns from right to left
            for (let col = this.grid.cols - 1; col >= 0; col--) {
                const columnMoves = this.applyGravityToColumn(col);
                if (columnMoves.length > 0) {
                    hasChanges = true;
                    allMoves.push(...columnMoves);
                }
            }
        }

        return allMoves;
    }

    private applyGravityToColumn(col: number): GravityMove[] {
        const moves: GravityMove[] = [];

        // Start from second-to-last row and work up
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
     * Shift items right - each item moves to the rightmost empty cell in its row
     * Runs multiple passes until no more moves are made (stable state)
     */
    public shiftRight(): GravityMove[] {
        const allMoves: GravityMove[] = [];
        let hasChanges = true;

        while (hasChanges) {
            hasChanges = false;

            // Process rows from bottom to top
            for (let row = this.grid.rows - 1; row >= 0; row--) {
                const rowMoves = this.shiftRowRight(row);
                if (rowMoves.length > 0) {
                    hasChanges = true;
                    allMoves.push(...rowMoves);
                }
            }
        }

        return allMoves;
    }

    private shiftRowRight(row: number): GravityMove[] {
        const moves: GravityMove[] = [];

        // Process columns from right to left (second-to-last to first)
        for (let col = this.grid.cols - 2; col >= 0; col--) {
            const tile = this.grid.getTile(row, col);
            if (!tile || !tile.hasItem()) continue;

            // Find the rightmost empty cell to the right of this one
            let targetCol = col;
            for (let checkCol = col + 1; checkCol < this.grid.cols; checkCol++) {
                const rightTile = this.grid.getTile(row, checkCol);
                if (rightTile && !rightTile.hasItem()) {
                    targetCol = checkCol;
                } else {
                    break;
                }
            }

            // Move item if there's an empty cell to the right
            if (targetCol !== col) {
                const targetTile = this.grid.getTile(row, targetCol);
                if (targetTile) {
                    const item = tile.removeItem();
                    if (item) {
                        targetTile.setItem(item);
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: row,
                            toCol: targetCol
                        });
                    }
                }
            }
        }

        return moves;
    }

    /**
     * Get all empty cells (for spawning new items)
     * Returns cells from right to left, BOTTOM to TOP within each column
     */
    public getEmptyCells(): EmptyCell[] {
        const emptyCells: EmptyCell[] = [];

        // Process from right to left
        for (let col = this.grid.cols - 1; col >= 0; col--) {
            // Get empty cells from BOTTOM to TOP (fill lowest first)
            for (let row = this.grid.rows - 1; row >= 0; row--) {
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
     * Runs until completely stable (no more moves possible)
     */
    public applyFullGravity(): { gravityMoves: GravityMove[]; shiftMoves: GravityMove[] } {
        const gravityMoves: GravityMove[] = [];
        const shiftMoves: GravityMove[] = [];

        let hasChanges = true;
        while (hasChanges) {
            hasChanges = false;

            // Apply gravity (items fall down)
            const gMoves = this.applyGravity();
            if (gMoves.length > 0) {
                hasChanges = true;
                gravityMoves.push(...gMoves);
            }

            // Shift right (items move to rightmost empty cell in their row)
            const sMoves = this.shiftRight();
            if (sMoves.length > 0) {
                hasChanges = true;
                shiftMoves.push(...sMoves);
            }
        }

        return { gravityMoves, shiftMoves };
    }
}
