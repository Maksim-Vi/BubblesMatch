import { Controller } from "src/core/mvc/Controller";
import { BubbleModel, GameState } from "./BubbleModel";
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
import { LeftTableController, LeftTableModel, LeftTableView } from "./leftTable";
import { SCORE_UPDATED, MOVES_UPDATED, GAME_WIN, GAME_OVER, SHOW_FINISH_SCREEN } from "src/events/TypesDispatch";

interface TileSwipeExtra {
    tile: BubbleTile;
}

export class BubbleController extends Controller<BubbleModel, BubbleView> {

    private availableColors = [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE];
    private swipeSystem: SwipeSystem<BubbleTile, TileSwipeExtra>;
    private clickSystem: ClickSystem<BubbleTile>;
    private gravitySystem: GravitySystem<BubbleTile>;
    private leftTableController: LeftTableController;
    private readonly MIN_MATCH_COUNT = 2;
    private isAnimating: boolean = false;

    init(): void {
        this.setupSwipeSystem();
        this.setupClickSystem();
        this.setupLeftTable();
        this.initGrid();
    }

    private setupLeftTable(): void {
        const leftTableModel = new LeftTableModel();
        const leftTableView = new LeftTableView();
        this.leftTableController = new LeftTableController(leftTableModel, leftTableView);
        this.leftTableController.init();

        // View handles its own positioning (left side, centered vertically)
        this.view.addChild(leftTableView);

        // Set initial data from level config
        if (this.model.levelConfig) {
            this.leftTableController.setInitialData(this.model.levelConfig.maxMoves);
        }
    }

    private dispatchScoreUpdate(): void {
        GlobalDispatcher.dispatch(SCORE_UPDATED, { score: this.model.score });
    }

    private dispatchMovesUpdate(): void {
        GlobalDispatcher.dispatch(MOVES_UPDATED, {
            movesLeft: this.model.movesLeft,
            maxMoves: this.model.maxMoves
        });
    }

    private async initGrid(): Promise<void> {
        this.createEmptyGrid();
        this.gravitySystem = new GravitySystem(this.model.getGrid());
        await this.fillGridAnimated();
    }

    private createEmptyGrid(): void {
        if (!this.model.levelConfig) {
            return alert("Can not find level to play!");
        }

        const bubbleGrid = this.model.getGrid();

        for (let row = 0; row < bubbleGrid.rows; row++) {
            for (let col = 0; col < bubbleGrid.cols; col++) {
                if (!bubbleGrid.getTile(row, col)) {
                    const tile = this.createEmptyTile(row, col);
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

    private createEmptyTile(row: number, col: number): BubbleTile {
        const gridConfig = this.model.levelConfig.gridConfig;
        const tileData: ITileData = {
            color: TileColor.RED,
            row: row,
            col: col,
            sizeTile: gridConfig.cellSize,
            margin: 8,
        };
        const tile = new BubbleTile(tileData);

        this.swipeSystem.attach(tile);
        this.clickSystem.attach(tile);

        return tile;
    }

    private async fillGridAnimated(): Promise<void> {
        this.isAnimating = true;
        const grid = this.model.getGrid();
        const itemsToAnimate: { item: Item; tile: BubbleTile; row: number; col: number }[] = [];

        // Create items for all cells, column by column (right to left)
        for (let col = grid.cols - 1; col >= 0; col--) {
            for (let row = 0; row < grid.rows; row++) {
                const tile = grid.getTile(row, col);
                if (tile && !tile.hasItem()) {
                    const randomColor = this.getRandomColor(this.availableColors);
                    const item = this.createItem(randomColor);

                    tile.setItem(item);
                    this.model.incrementSpawnedItems();

                    // Hide item initially and position above grid
                    item.alpha = 0;
                    const gap = this.model.levelConfig.gridConfig.gap;
                    const fallDistance = (row + 1) * (tile.data.sizeTile + gap);
                    item.y = tile.data.sizeTile / 2 - fallDistance;

                    itemsToAnimate.push({ item, tile, row, col });
                }
            }
        }

        // Animate items falling column by column
        if (itemsToAnimate.length > 0) {
            await new Promise<void>((resolve) => {
                const tl = gsap.timeline({ onComplete: resolve });

                itemsToAnimate.forEach(({ item, tile, row, col }) => {
                    const targetY = tile.data.sizeTile / 2;
                    // Stagger by column first, then by row
                    const colDelay = (grid.cols - 1 - col) * 0.08;
                    const rowDelay = row * 0.03;
                    const delay = colDelay + rowDelay;
                    const duration = 0.35 + row * 0.02;

                    // Show item and animate fall
                    tl.set(item, { alpha: 1 }, delay);
                    tl.to(item, {
                        y: targetY,
                        duration,
                        ease: "power2.out"
                    }, delay);
                });
            });
        }

        this.isAnimating = false;
        console.log(`Grid filled with ${itemsToAnimate.length} items`);
    }

    private setupSwipeSystem(): void {
        this.swipeSystem = new SwipeSystem<BubbleTile, TileSwipeExtra>({
            canSwipe: (tile) => !this.isAnimating && tile.hasItem() && this.model.gameCurrentState === GameState.PLAYER_INPUT,
            getExtra: (tile) => ({ tile }),
            onSwipe: (tile, _direction, vector) => {
                this.trySwapInDirection(tile, vector);
            }
        }, { threshold: 30 });
    }

    private setupClickSystem(): void {
        this.clickSystem = new ClickSystem<BubbleTile>({
            canClick: (tile) => !this.isAnimating && tile.hasItem() && this.model.gameCurrentState === GameState.PLAYER_INPUT,
            onDoubleClick: (tile) => {
                this.tryCollectMatch(tile);
            }
        }, { doubleClickDelay: 300 });
    }

    private tryCollectMatch(tile: BubbleTile): void {
        if (!this.model.hasMovesLeft()) {
            console.log("No moves left!");
            return;
        }

        const grid = this.model.getGrid();
        const matchResult = MatchFinder.findConnectedTiles(grid, tile);

        if (!MatchFinder.isValidMatch(matchResult, this.MIN_MATCH_COUNT)) {
            console.log(`Match too small: ${matchResult?.count || 0} (min: ${this.MIN_MATCH_COUNT})`);
            return;
        }

        // Use a move
        this.model.useMove();
        this.dispatchMovesUpdate();
        console.log(`Moves left: ${this.model.movesLeft}/${this.model.maxMoves}`);

        const scoreResult = ScoreCalculator.calculate(matchResult!.count, this.model.multiplier);
        this.model.addScore(scoreResult.totalScore);
        this.dispatchScoreUpdate();

        console.log(`Collected ${matchResult!.count} ${TileColor[matchResult!.color]} items! Score: +${scoreResult.totalScore} (Total: ${this.model.score})`);

        // Cancel any active swipe to prevent accidental moves after collection
        this.swipeSystem.cancel();

        // Remove collected items with animation
        this.collectAndRefill(matchResult!.tiles);
    }

    private async collectAndRefill(tiles: BubbleTile[]): Promise<void> {
        this.isAnimating = true;

        // Animate collected items disappearing
        await this.animateCollect(tiles);

        // Remove items after animation
        for (const tile of tiles) {
            const item = tile.removeItem();
            if (item) {
                item.destroy();
            }
        }

        // Apply gravity and refill
        await this.applyGravityAndRefill();

        this.isAnimating = false;

        // Check win condition (grid is empty)
        if (this.isGridEmpty()) {
            this.handleWin();
            return;
        }

        // Check game over (no moves left)
        if (!this.model.hasMovesLeft()) {
            this.handleGameOver();
        }
    }

    private isGridEmpty(): boolean {
        const grid = this.model.getGrid();
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const tile = grid.getTile(row, col);
                if (tile?.hasItem()) {
                    return false;
                }
            }
        }
        return true;
    }

    private handleWin(): void {
        console.log("=== YOU WIN! ===");
        console.log(`Final Score: ${this.model.score}`);
        console.log(`Moves Used: ${this.model.maxMoves - this.model.movesLeft}/${this.model.maxMoves}`);
        console.log(`Items Spawned: ${this.model.spawnedItems}/${this.model.maxItems}`);

        this.model.setGameState(GameState.LEVEL_COMPLETE);

        GlobalDispatcher.dispatch(GAME_WIN, { score: this.model.score });
        GlobalDispatcher.dispatch(SHOW_FINISH_SCREEN, {
            isWin: true,
            score: this.model.score
        });
    }

    private animateCollect(tiles: BubbleTile[]): Promise<void> {
        return new Promise((resolve) => {
            const items = tiles.map(t => t.getItem()).filter(Boolean) as Item[];

            if (items.length === 0) {
                resolve();
                return;
            }

            const tl = gsap.timeline({ onComplete: resolve });
            items.forEach((item, index) => {
                tl.to(item.scale, {
                    x: 0,
                    y: 0,
                    duration: 0.15,
                    ease: "back.in(2)"
                }, index * 0.02);
            });
        });
    }

    private async applyGravityAndRefill(): Promise<void> {
        // Apply gravity (items fall down) with animation
        const gravityMoves = this.gravitySystem.applyGravity();
        await this.animateMoves(gravityMoves, 0.25, 0.04);

        // Shift right with animation
        const shiftMoves = this.gravitySystem.shiftRight();
        await this.animateMoves(shiftMoves, 0.2, 0.03);

        console.log(`Gravity: ${gravityMoves.length} falls, ${shiftMoves.length} shifts`);

        // Fill empty cells with new items (falling from top)
        await this.fillEmptyCellsAnimated();
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
                    const sourceTile = grid.getTile(move.fromRow, move.fromCol);
                    if (sourceTile && targetTile) {
                        const offsetX = sourceTile.x - targetTile.x;
                        const offsetY = sourceTile.y - targetTile.y;

                        item.x += offsetX;
                        item.y += offsetY;

                        tl.to(item, {
                            x: targetTile.data.sizeTile / 2,
                            y: targetTile.data.sizeTile / 2,
                            duration,
                            ease: "power2.out"
                        }, index * stagger);
                    }
                }
            });
        });
    }

    private async fillEmptyCellsAnimated(): Promise<void> {
        const emptyCells = this.gravitySystem.getEmptyCells();
        const grid = this.model.getGrid();
        let spawnedCount = 0;

        const itemsToAnimate: { item: Item; tile: BubbleTile; row: number }[] = [];

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
                this.model.incrementSpawnedItems();

                // Hide item initially and position above grid
                item.alpha = 0;
                const gap = this.model.levelConfig.gridConfig.gap;
                const fallDistance = (row + 1) * (tile.data.sizeTile + gap);
                item.y = tile.data.sizeTile / 2 - fallDistance;

                itemsToAnimate.push({ item, tile, row });
                spawnedCount++;
            }
        }

        // Animate items falling
        if (itemsToAnimate.length > 0) {
            await new Promise<void>((resolve) => {
                const tl = gsap.timeline({ onComplete: resolve });

                itemsToAnimate.forEach(({ item, tile, row }, index) => {
                    const targetY = tile.data.sizeTile / 2;
                    const duration = 0.3 + row * 0.02;
                    const delay = index * 0.04;

                    // Show item and animate fall
                    tl.set(item, { alpha: 1 }, delay);
                    tl.to(item, {
                        y: targetY,
                        duration,
                        ease: "power2.out"
                    }, delay);
                });
            });
        }

        console.log(`Filled ${spawnedCount} empty cells (Total spawned: ${this.model.spawnedItems}/${this.model.maxItems})`);
    }

    private async handleGameOver(): Promise<void> {
        console.log("=== GAME OVER ===");
        console.log(`Final Score: ${this.model.score}`);
        console.log(`Items Spawned: ${this.model.spawnedItems}/${this.model.maxItems}`);

        this.model.setGameState(GameState.GAME_OVER);

        // Clear the grid with animation
        await this.clearGridAnimated();

        GlobalDispatcher.dispatch(GAME_OVER, { score: this.model.score });
        GlobalDispatcher.dispatch(SHOW_FINISH_SCREEN, {
            isWin: false,
            score: this.model.score
        });
    }

    private async clearGridAnimated(): Promise<void> {
        const grid = this.model.getGrid();
        const itemsToAnimate: Item[] = [];

        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const tile = grid.getTile(row, col);
                const item = tile?.getItem();
                if (item) {
                    itemsToAnimate.push(item);
                }
            }
        }

        if (itemsToAnimate.length > 0) {
            await new Promise<void>((resolve) => {
                const tl = gsap.timeline({ onComplete: resolve });

                itemsToAnimate.forEach((item, index) => {
                    tl.to(item, {
                        y: item.y + 500,
                        alpha: 0,
                        duration: 0.4,
                        ease: "power2.in"
                    }, index * 0.02);
                });
            });

            // Remove all items
            for (let row = 0; row < grid.rows; row++) {
                for (let col = 0; col < grid.cols; col++) {
                    const tile = grid.getTile(row, col);
                    const item = tile?.removeItem();
                    if (item) {
                        item.destroy();
                    }
                }
            }
        }

        console.log("Grid cleared");
    }

    private getRandomColor(colors: TileColor[]): TileColor {
        return colors[Math.floor(Math.random() * colors.length)];
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
        if (this.leftTableController) {
            this.leftTableController.destroy();
        }
        GlobalDispatcher.removeAllForContext(this);
    }
}
