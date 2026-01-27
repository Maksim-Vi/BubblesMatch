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
import { GravitySystem, GravityMove } from "src/game/bubbleGame/gravity";
import gsap from "gsap";

interface TileSwipeExtra {
    tile: BubbleTile;
}

export class BubbleController extends Controller<BubbleModel, BubbleView> {

    private availableColors = [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE];
    private swipeSystem: SwipeSystem<BubbleTile, TileSwipeExtra>;
    private clickSystem: ClickSystem<BubbleTile>;
    private gravitySystem: GravitySystem<BubbleTile>;
    private readonly MIN_MATCH_COUNT = 2;
    private isAnimating: boolean = false;

    init(): void {
        this.setupSwipeSystem();
        this.setupClickSystem();
        this.fillGrid();
        this.gravitySystem = new GravitySystem(this.model.getGrid());
    }

    private setupSwipeSystem(): void {
        this.swipeSystem = new SwipeSystem<BubbleTile, TileSwipeExtra>({
            canSwipe: (tile) => !this.isAnimating && tile.hasItem(),
            getExtra: (tile) => ({ tile }),
            onSwipe: (tile, _direction, vector) => {
                this.trySwapInDirection(tile, vector);
            }
        }, { threshold: 30 });
    }

    private setupClickSystem(): void {
        this.clickSystem = new ClickSystem<BubbleTile>({
            canClick: (tile) => !this.isAnimating && tile.hasItem(),
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

        // Cancel any active swipe to prevent accidental moves after collection
        this.swipeSystem.cancel();

        // Remove collected items
        for (const matchedTile of matchResult!.tiles) {
            const item = matchedTile.removeItem();
            if (item) {
                item.destroy();
            }
        }

        // Apply gravity and fill empty cells
        this.applyGravityAndRefill();
    }

    private async applyGravityAndRefill(): Promise<void> {
        this.isAnimating = true;

        // Apply gravity (items fall down) with animation
        const gravityMoves = this.gravitySystem.applyGravity();
        await this.animateMoves(gravityMoves, 0.15, 0.03);

        // Shift right with animation
        const shiftMoves = this.gravitySystem.shiftRight();
        await this.animateMoves(shiftMoves, 0.12, 0.02);

        console.log(`Gravity: ${gravityMoves.length} falls, ${shiftMoves.length} shifts`);

        // Fill empty cells with new items
        await this.fillEmptyCellsAnimated();

        this.isAnimating = false;
    }

    private animateMoves(moves: GravityMove[], duration: number, stagger: number): Promise<void> {
        return new Promise((resolve) => {
            if (moves.length === 0) {
                resolve();
                return;
            }

            const grid = this.model.getGrid();
            const tl = gsap.timeline({ onComplete: resolve });

            moves.forEach((move, index) => {
                const targetTile = grid.getTile(move.toRow, move.toCol);
                const item = targetTile?.getItem();

                if (item) {
                    // Calculate offset from source position
                    const sourceTile = grid.getTile(move.fromRow, move.fromCol);
                    if (sourceTile && targetTile) {
                        const offsetX = sourceTile.x - targetTile.x;
                        const offsetY = sourceTile.y - targetTile.y;

                        // Set item to source position (relative to its parent tile)
                        item.x += offsetX;
                        item.y += offsetY;

                        // Animate back to center of tile
                        tl.to(item, {
                            x: targetTile.data.sizeTile / 2,
                            y: targetTile.data.sizeTile / 2,
                            duration,
                            ease: "power2.out"
                        }, index * stagger);
                    }
                }
            });

            if (moves.length === 0) {
                resolve();
            }
        });
    }

    private async fillEmptyCellsAnimated(): Promise<void> {
        const emptyCells = this.gravitySystem.getEmptyCells();
        const grid = this.model.getGrid();
        let spawnedCount = 0;

        const itemsToAnimate: { item: Item; targetScale: number }[] = [];

        for (const { row, col } of emptyCells) {
            if (!this.model.canSpawnMore()) {
                console.log(`Max items reached: ${this.model.spawnedItems}/${this.model.maxItems}`);
                break;
            }

            const tile = grid.getTile(row, col);
            if (tile && !tile.hasItem()) {
                const randomColor = this.getRandomColor(this.availableColors);
                const item = this.createItem(randomColor);

                tile.setItem(item);

                // Save target scale and set to 0 for pop-in animation
                const targetScale = item.scale.x;
                item.scale.set(0);

                this.model.incrementSpawnedItems();
                itemsToAnimate.push({ item, targetScale });
                spawnedCount++;
            }
        }

        // Animate all new items with stagger
        if (itemsToAnimate.length > 0) {
            await new Promise<void>((resolve) => {
                const tl = gsap.timeline({ onComplete: resolve });
                itemsToAnimate.forEach(({ item, targetScale }, index) => {
                    tl.to(item.scale, {
                        x: targetScale,
                        y: targetScale,
                        duration: 0.2,
                        ease: "back.out(1.5)"
                    }, index * 0.02);
                });
            });
        }

        console.log(`Filled ${spawnedCount} empty cells (Total spawned: ${this.model.spawnedItems}/${this.model.maxItems})`);
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
        this.model.incrementSpawnedItems();

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
