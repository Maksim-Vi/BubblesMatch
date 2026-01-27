import { Controller } from "src/core/mvc/Controller";
import { BubbleModel } from "./BubbleModel";
import { BubbleView } from "./BubbleView";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { BubbleTile } from "./tileBubble/BubbleTile";
import { ScreenHelper } from "src/core/ScreenHelper";
import { ITileData, TileColor } from "src/common/cell/Tile";
import { Item } from "./Item/Item";
import AssetsLoader from "src/assetsLoader/AssetsLoader";
import { SwipeSystem, SwipeVector, ClickSystem } from "src/common/input";
import { MatchFinder } from "./match/MatchFinder";
import { ScoreCalculator } from "./match/ScoreCalculator";

interface TileSwipeExtra {
    tile: BubbleTile;
}

export class BubbleController extends Controller<BubbleModel, BubbleView> {

    private availableColors = [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE];
    private swipeSystem: SwipeSystem<BubbleTile, TileSwipeExtra>;
    private clickSystem: ClickSystem<BubbleTile>;
    private readonly MIN_MATCH_COUNT = 2;

    init(): void {
        this.setupSwipeSystem();
        this.setupClickSystem();
        this.fillGrid();
    }

    private setupSwipeSystem(): void {
        this.swipeSystem = new SwipeSystem<BubbleTile, TileSwipeExtra>({
            canSwipe: (tile) => tile.hasItem(),
            getExtra: (tile) => ({ tile }),
            onSwipe: (tile, _direction, vector) => {
                this.trySwapInDirection(tile, vector);
            }
        }, { threshold: 30 });
    }

    private setupClickSystem(): void {
        this.clickSystem = new ClickSystem<BubbleTile>({
            canClick: (tile) => tile.hasItem(),
            onDoubleClick: (tile) => {
                this.tryCollectMatch(tile);
            }
        }, { doubleClickDelay: 300 });
    }

    private tryCollectMatch(tile: BubbleTile): void {
        const grid = this.model.getGrid();
        const matchResult = MatchFinder.findConnectedTiles(grid, tile);

        if (!MatchFinder.isValidMatch(matchResult, this.MIN_MATCH_COUNT)) {
            console.log(`Match too small: ${matchResult?.count || 0} (min: ${this.MIN_MATCH_COUNT})`);
            return;
        }

        const scoreResult = ScoreCalculator.calculate(matchResult!.count, this.model.multiplier);
        this.model.addScore(scoreResult.totalScore);

        console.log(`Collected ${matchResult!.count} ${TileColor[matchResult!.color]} items! Score: +${scoreResult.totalScore} (Total: ${this.model.score})`);

        for (const matchedTile of matchResult!.tiles) {
            const item = matchedTile.removeItem();
            if (item) {
                item.destroy();
            }
        }
    }

    private fillGrid() {
        if (!this.model.levelConfig) {
            return alert("Can not find level to play!");
        }

        const bubbleGrid = this.model.getGrid();

        for (let row = 0; row < bubbleGrid.rows; row++) {
            for (let col = 0; col < bubbleGrid.cols; col++) {
                if (!bubbleGrid.getTile(row, col)) {
                    const tile = this.createBubbleTile(row, col);
                    bubbleGrid.setTile(row, col, tile);
                }
            }
        }

        bubbleGrid.position.set(
            ScreenHelper.Center.x - bubbleGrid.gridWidth / 2,
            ScreenHelper.Center.y - bubbleGrid.gridHeight / 2
        );
        this.view.initializeGrid(bubbleGrid);
    }

    private getRandomColor(colors: TileColor[]): TileColor {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private createBubbleTile(row: number, col: number): BubbleTile {
        const randomColor = this.getRandomColor(this.availableColors);

        const tileData: ITileData = {
            color: randomColor,
            row: row,
            col: col,
            sizeTile: 82
        };
        const tile = new BubbleTile(tileData);

        const item = this.createItem(randomColor);
        tile.setItem(item);

        this.swipeSystem.attach(tile);
        this.clickSystem.attach(tile);

        return tile;
    }

    private trySwapInDirection(fromTile: BubbleTile, direction: SwipeVector): void {
        if (!fromTile.hasItem()) return;

        const grid = this.model.getGrid();
        const targetRow = fromTile.row + direction.row;
        const targetCol = fromTile.col + direction.col;

        const targetTile = grid.getTile(targetRow, targetCol);
        if (!targetTile || !targetTile.hasItem()) return;

        this.swapItems(fromTile, targetTile);
    }

    private swapItems(tileA: BubbleTile, tileB: BubbleTile): void {
        if (!tileA.hasItem() || !tileB.hasItem()) return;

        const itemA = tileA.removeItem()!;
        const itemB = tileB.removeItem()!;

        tileA.setItem(itemB);
        tileB.setItem(itemA);
    }

    private createItem(color: TileColor): Item {
        const textureKey = this.model.getTextureKeyForColor(color);
        const texture = AssetsLoader.get(textureKey);
        return new Item(color, texture);
    }

    destroy(): void {
        this.swipeSystem.destroy();
        this.clickSystem.destroy();
        GlobalDispatcher.removeAllForContext(this);
    }
}
