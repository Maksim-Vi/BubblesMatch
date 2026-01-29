import { TileColor } from "src/common/cell/Tile";
import { BubbleGrid } from "../gridBubble/BubbleGrid";
import { BubbleTile } from "../tileBubble/BubbleTile";

export interface MatchResult {
    tiles: BubbleTile[];
    color: TileColor;
    count: number;
}

export class MatchFinder {
    private static readonly DIRECTIONS = [
        { row: -1, col: 0 },  // up
        { row: 1, col: 0 },   // down
        { row: 0, col: -1 },  // left
        { row: 0, col: 1 }    // right
    ];

    public static findConnectedTiles(grid: BubbleGrid, startTile: BubbleTile): MatchResult | null {
        const item = startTile.getItem();
        if (!item) return null;

        const targetColor = item.color;
        const connectedTiles: BubbleTile[] = [];
        const visited = new Set<string>();

        const queue: BubbleTile[] = [startTile];
        visited.add(`${startTile.row},${startTile.col}`);

        while (queue.length > 0) {
            const current = queue.shift()!;
            connectedTiles.push(current);

            for (const dir of this.DIRECTIONS) {
                const newRow = current.row + dir.row;
                const newCol = current.col + dir.col;
                const key = `${newRow},${newCol}`;

                if (visited.has(key)) continue;

                const neighbor = grid.getTile(newRow, newCol);
                if (!neighbor) continue;

                const neighborItem = neighbor.getItem();
                if (!neighborItem || neighborItem.color !== targetColor) continue;

                visited.add(key);
                queue.push(neighbor);
            }
        }

        return {
            tiles: connectedTiles,
            color: targetColor,
            count: connectedTiles.length
        };
    }

    public static hasAnyMatch(grid: BubbleGrid, minCount: number = 2): boolean {
        const visited = new Set<string>();

        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const key = `${row},${col}`;
                if (visited.has(key)) continue;

                const tile = grid.getTile(row, col);
                if (!tile) continue;

                const item = tile.getItem();
                if (!item) continue;

                const result = this.findConnectedTiles(grid, tile);
                if (result && result.count >= minCount) {
                    return true;
                }

                result?.tiles.forEach(t => visited.add(`${t.row},${t.col}`));
            }
        }

        return false;
    }

    public static isValidMatch(result: MatchResult | null, minCount: number = 2): boolean {
        return result !== null && result.count >= minCount;
    }
}
