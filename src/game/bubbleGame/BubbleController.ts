// import { Controller } from "src/core/mvc/Controller";
// import { BubbleModel, GameState } from "./BubbleModel";
// import { BubbleView } from "./BubbleView";
// import GlobalDispatcher from "src/events/GlobalDispatcher";
// import { BubbleTile } from "./tileBubble/BubbleTile";
// import { ScreenHelper } from "src/core/ScreenHelper";
// import { ITileData, TileColor } from "src/common/cell/Tile";
// import { Item } from "./Item/Item";
// import AssetsLoader from "src/assetsLoader/AssetsLoader";
// import { SwipeSystem, SwipeVector, ClickSystem } from "src/common/input";
// import { MatchFinder } from "./match/MatchFinder";
// import { ScoreCalculator } from "./match/ScoreCalculator";
// import { GravitySystem } from "src/game/bubbleGame/gravity";
// import { LeftTableController, LeftTableModel, LeftTableView } from "./leftTable";
// import { SCORE_UPDATED, MOVES_UPDATED, GAME_WIN, GAME_OVER, SHOW_FINISH_SCREEN, EXIT_GAME } from "src/events/TypesDispatch";
// import { AnimationHelper, FillAnimationItem } from "./animation";
// import { Texture } from "pixi.js";

// interface TileSwipeExtra {
//     tile: BubbleTile;
// }

// export class BubbleController extends Controller<BubbleModel, BubbleView> {

//     private availableColors = [TileColor.RED, TileColor.YELLOW, TileColor.PURPURE];
//     private swipeSystem: SwipeSystem<BubbleTile, TileSwipeExtra>;
//     private clickSystem: ClickSystem<BubbleTile>;
//     private gravitySystem: GravitySystem<BubbleTile>;
//     private leftTableController: LeftTableController;
//     private readonly MIN_MATCH_COUNT = 2;
//     private isAnimating: boolean = false;

//     init(): void {
//         this.setupSwipeSystem();
//         this.setupClickSystem();
//         this.setupLeftTable();
//         this.setupEventListeners();
//         this.initGrid();
//     }

//     private setupEventListeners(): void {
//         GlobalDispatcher.add(EXIT_GAME, this.onExitGame, this);
//     }

//     private onExitGame(): void {
//         if (this.isAnimating) return;
//         this.handleGameOver();
//     }

//     private setupLeftTable(): void {
//         const leftTableModel = new LeftTableModel();
//         const leftTableView = new LeftTableView();
//         this.leftTableController = new LeftTableController(leftTableModel, leftTableView);
//         this.leftTableController.init();

//         // View handles its own positioning (left side, centered vertically)
//         this.view.addChild(leftTableView);

//         // Set initial data from level config
//         if (this.model.levelConfig) {
//             this.leftTableController.setInitialData(this.model.levelConfig.maxMoves);
//         }
//     }

//     private dispatchScoreUpdate(): void {
//         GlobalDispatcher.dispatch(SCORE_UPDATED, { score: this.model.score });
//     }

//     private dispatchMovesUpdate(): void {
//         GlobalDispatcher.dispatch(MOVES_UPDATED, {
//             movesLeft: this.model.movesLeft,
//             maxMoves: this.model.maxMoves
//         });
//     }

//     private async initGrid(): Promise<void> {
//         this.createEmptyGrid();
//         this.gravitySystem = new GravitySystem(this.model.getGrid());
//         await this.fillGridAnimated();
//     }

//     private createEmptyGrid(): void {
//         if (!this.model.levelConfig) {
//             return alert("Can not find level to play!");
//         }

//         const bubbleGrid = this.model.getGrid();

//         for (let row = 0; row < bubbleGrid.rows; row++) {
//             for (let col = 0; col < bubbleGrid.cols; col++) {
//                 if (!bubbleGrid.getTile(row, col)) {
//                     const tile = this.createEmptyTile(row, col);
//                     bubbleGrid.setTile(row, col, tile);
//                 }
//             }
//         }

//         bubbleGrid.position.set(
//             ScreenHelper.Center.x - bubbleGrid.gridWidth / 2,
//             ScreenHelper.Center.y - bubbleGrid.gridHeight / 2
//         );
//         this.view.initializeGrid(bubbleGrid);
//     }

//     private createEmptyTile(row: number, col: number): BubbleTile {
//         const gridConfig = this.model.levelConfig.gridConfig;
//         const tileData: ITileData = {
//             color: TileColor.RED,
//             row: row,
//             col: col,
//             sizeTile: gridConfig.cellSize,
//             margin: 8,
//         };
//         const tile = new BubbleTile(tileData);

//         this.swipeSystem.attach(tile);
//         this.clickSystem.attach(tile);

//         return tile;
//     }

//     private async fillGridAnimated(): Promise<void> {
//         this.isAnimating = true;
//         const grid = this.model.getGrid();
//         const gap = this.model.levelConfig.gridConfig.gap;
//         const itemsToAnimate: FillAnimationItem[] = [];

//         for (let col = grid.cols - 1; col >= 0; col--) {
//             for (let row = 0; row < grid.rows; row++) {
//                 const tile = grid.getTile(row, col);
//                 if (tile && !tile.hasItem()) {
//                     const randomColor = this.getRandomColor(this.availableColors);
//                     const item = this.createItem(randomColor);

//                     tile.setTexture(this.getTileTexture(row % 2));
//                     tile.setItem(item);
//                     this.model.incrementSpawnedItems();

//                     itemsToAnimate.push({ item, tile, row, col });
//                 }
//             }
//         }

//         await AnimationHelper.animateGridFill(itemsToAnimate, grid.cols, gap);

//         this.isAnimating = false;
//         console.log(`Grid filled with ${itemsToAnimate.length} items`);
//     }

//     private setupSwipeSystem(): void {
//         this.swipeSystem = new SwipeSystem<BubbleTile, TileSwipeExtra>({
//             canSwipe: (tile) => !this.isAnimating && tile.hasItem() && this.model.gameCurrentState === GameState.PLAYER_INPUT,
//             getExtra: (tile) => ({ tile }),
//             onSwipe: (tile, _direction, vector) => {
//                 this.trySwapInDirection(tile, vector);
//             }
//         }, { threshold: 30 });
//     }

//     private setupClickSystem(): void {
//         this.clickSystem = new ClickSystem<BubbleTile>({
//             canClick: (tile) => !this.isAnimating && tile.hasItem() && this.model.gameCurrentState === GameState.PLAYER_INPUT,
//             onDoubleClick: (tile) => {
//                 this.tryCollectMatch(tile);
//             }
//         }, { doubleClickDelay: 300 });
//     }

//     private tryCollectMatch(tile: BubbleTile): void {
//         if (!this.model.hasMovesLeft()) {
//             console.log("No moves left!");
//             return;
//         }

//         const grid = this.model.getGrid();
//         const matchResult = MatchFinder.findConnectedTiles(grid, tile);

//         if (!MatchFinder.isValidMatch(matchResult, this.MIN_MATCH_COUNT)) {
//             console.log(`Match too small: ${matchResult?.count || 0} (min: ${this.MIN_MATCH_COUNT})`);
//             return;
//         }

//         // Use a move for collecting
//         this.model.useMove();

//         // Bonus: if collecting more than 10 items, add 1 move back
//         const collectedCount = matchResult!.count;
//         if (collectedCount > 10) {
//             this.model.addMove();
//             console.log(`Bonus! Collected ${collectedCount} items (>10), +1 move!`);
//         }

//         this.dispatchMovesUpdate();
//         console.log(`Moves left: ${this.model.movesLeft}/${this.model.maxMoves}`);

//         const scoreResult = ScoreCalculator.calculate(collectedCount, this.model.multiplier);
//         this.model.addScore(scoreResult.totalScore);
//         this.dispatchScoreUpdate();

//         console.log(`Collected ${collectedCount} ${TileColor[matchResult!.color]} items! Score: +${scoreResult.totalScore} (Total: ${this.model.score})`);

//         // Cancel any active swipe to prevent accidental moves after collection
//         this.swipeSystem.cancel();

//         // Remove collected items with animation
//         this.collectAndRefill(matchResult!.tiles);
//     }

//     private async collectAndRefill(tiles: BubbleTile[]): Promise<void> {
//         this.isAnimating = true;

//         // Animate collected items disappearing
//         await AnimationHelper.animateCollect(tiles);

//         // Remove items after animation
//         for (const tile of tiles) {
//             const item = tile.removeItem();
//             if (item) {
//                 item.destroy();
//             }
//         }

//         // Apply gravity and refill
//         await this.applyGravityAndRefill();

//         this.isAnimating = false;

//         // Check win condition (grid is empty - perfect clear!)
//         if (this.isGridEmpty()) {
//             this.handleWin();
//             return;
//         }

//         // Check if no valid matches remain (no possible moves, even with swaps)
//         if (!MatchFinder.hasPossibleMoves(this.model.getGrid(), this.MIN_MATCH_COUNT)) {
//             // Not a loss - finish with penalty for remaining items
//             await this.handleNoMatchesLeft();
//             return;
//         }

//         // Check game over (no moves left)
//         if (!this.model.hasMovesLeft()) {
//             this.handleGameOver();
//         }
//     }

//     private isGridEmpty(): boolean {
//         const grid = this.model.getGrid();
//         for (let row = 0; row < grid.rows; row++) {
//             for (let col = 0; col < grid.cols; col++) {
//                 const tile = grid.getTile(row, col);
//                 if (tile?.hasItem()) {
//                     return false;
//                 }
//             }
//         }
//         return true;
//     }

//     private handleWin(): void {
//         console.log("=== YOU WIN! (Perfect Clear) ===");
//         console.log(`Final Score: ${this.model.score}`);
//         console.log(`Moves Used: ${this.model.maxMoves - this.model.movesLeft}/${this.model.maxMoves}`);
//         console.log(`Items Spawned: ${this.model.spawnedItems}/${this.model.maxItems}`);

//         this.model.setGameState(GameState.LEVEL_COMPLETE);

//         GlobalDispatcher.dispatch(GAME_WIN, { score: this.model.score });
//         GlobalDispatcher.dispatch(SHOW_FINISH_SCREEN, {
//             isWin: true,
//             score: this.model.score
//         });
//     }

//     private async handleNoMatchesLeft(): Promise<void> {
//         const remainingItems = this.countRemainingItems();
//         const penalty = remainingItems * 10;
//         const finalScore = Math.max(0, this.model.score - penalty);

//         console.log("=== NO MATCHES LEFT ===");
//         console.log(`Remaining items: ${remainingItems}`);
//         console.log(`Penalty: -${penalty}`);
//         console.log(`Final Score: ${this.model.score} - ${penalty} = ${finalScore}`);

//         // Update score with penalty
//         this.model.setScore(finalScore);
//         this.dispatchScoreUpdate();

//         this.model.setGameState(GameState.LEVEL_COMPLETE);

//         // Clear remaining items with animation
//         await AnimationHelper.animateClearGrid(this.model.getGrid());

//         // Remove all items after animation
//         const grid = this.model.getGrid();
//         for (let row = 0; row < grid.rows; row++) {
//             for (let col = 0; col < grid.cols; col++) {
//                 const tile = grid.getTile(row, col);
//                 const item = tile?.removeItem();
//                 if (item) {
//                     item.destroy();
//                 }
//             }
//         }

//         GlobalDispatcher.dispatch(GAME_WIN, { score: finalScore });
//         GlobalDispatcher.dispatch(SHOW_FINISH_SCREEN, {
//             isWin: true,
//             score: finalScore
//         });
//     }

//     private countRemainingItems(): number {
//         const grid = this.model.getGrid();
//         let count = 0;
//         for (let row = 0; row < grid.rows; row++) {
//             for (let col = 0; col < grid.cols; col++) {
//                 const tile = grid.getTile(row, col);
//                 if (tile?.hasItem()) {
//                     count++;
//                 }
//             }
//         }
//         return count;
//     }

//     private async applyGravityAndRefill(): Promise<void> {
//         const grid = this.model.getGrid();
//         let totalGravity = 0;
//         let totalShift = 0;

//         // Run gravity and shift in steps until stable
//         let hasChanges = true;
//         while (hasChanges) {
//             hasChanges = false;

//             // Step 1: Apply gravity (all items fall down)
//             const gravityMoves = this.gravitySystem.applyGravity();
//             if (gravityMoves.length > 0) {
//                 hasChanges = true;
//                 totalGravity += gravityMoves.length;
//                 // Sort: bottom rows first, then right columns
//                 gravityMoves.sort((a, b) => (b.toRow - a.toRow) || (b.toCol - a.toCol));
//                 await AnimationHelper.animateMoves(gravityMoves, grid, { duration: 0.25, stagger: 0.03, ease: "power2.out" });
//             }

//             // Step 2: Apply shift (all items shift right)
//             const shiftMoves = this.gravitySystem.shiftRight();
//             if (shiftMoves.length > 0) {
//                 hasChanges = true;
//                 totalShift += shiftMoves.length;
//                 // Sort: bottom-right first (bottom rows, then rightmost target columns)
//                 shiftMoves.sort((a, b) => (b.fromRow - a.fromRow) || (b.toCol - a.toCol));
//                 await AnimationHelper.animateMoves(shiftMoves, grid, { duration: 0.2, stagger: 0.05, ease: "power2.out" });
//             }
//         }

//         console.log(`Gravity: ${totalGravity} falls, ${totalShift} shifts`);

//         // Fill empty cells with new items (falling from top)
//         await this.fillEmptyCellsAnimated();
//     }

//     private async fillEmptyCellsAnimated(): Promise<void> {
//         const emptyCells = this.gravitySystem.getEmptyCells();
//         const grid = this.model.getGrid();
//         const gap = this.model.levelConfig.gridConfig.gap;
//         let spawnedCount = 0;

//         const itemsToAnimate: FillAnimationItem[] = [];

//         for (const { row, col } of emptyCells) {
//             if (!this.model.canSpawnMore()) {
//                 console.log(`Max items reached: ${this.model.spawnedItems}/${this.model.maxItems}`);
//                 break;
//             }

//             const tile = grid.getTile(row, col);
//             if (tile && !tile.hasItem()) {
//                 const randomColor = this.getRandomColor(this.availableColors);
//                 const item = this.createItem(randomColor);

//                 tile.setItem(item);
//                 this.model.incrementSpawnedItems();

//                 itemsToAnimate.push({ item, tile, row });
//                 spawnedCount++;
//             }
//         }

//         // Animate items falling
//         await AnimationHelper.animateFall(itemsToAnimate, gap, { duration: 0.3, stagger: 0.04 });

//         // Safety: apply gravity and shift after fill in case items need to settle
//         let postGravityCount = 0;
//         let postShiftCount = 0;
//         let hasChanges = true;

//         while (hasChanges) {
//             hasChanges = false;

//             const postGravity = this.gravitySystem.applyGravity();
//             if (postGravity.length > 0) {
//                 hasChanges = true;
//                 postGravityCount += postGravity.length;
//                 postGravity.sort((a, b) => (b.toRow - a.toRow) || (b.toCol - a.toCol));
//                 await AnimationHelper.animateMoves(postGravity, grid, { duration: 0.2, stagger: 0.03, ease: "power2.out" });
//             }

//             const postShift = this.gravitySystem.shiftRight();
//             if (postShift.length > 0) {
//                 hasChanges = true;
//                 postShiftCount += postShift.length;
//                 postShift.sort((a, b) => (b.fromRow - a.fromRow) || (b.toCol - a.toCol));
//                 await AnimationHelper.animateMoves(postShift, grid, { duration: 0.2, stagger: 0.05, ease: "power2.out" });
//             }
//         }

//         if (postGravityCount > 0 || postShiftCount > 0) {
//             console.log(`Post-fill: ${postGravityCount} gravity, ${postShiftCount} shifts`);
//         }

//         console.log(`Filled ${spawnedCount} empty cells (Total spawned: ${this.model.spawnedItems}/${this.model.maxItems})`);
//     }

//     private async handleGameOver(): Promise<void> {
//         console.log("=== GAME OVER ===");
//         console.log(`Final Score: ${this.model.score}`);
//         console.log(`Items Spawned: ${this.model.spawnedItems}/${this.model.maxItems}`);

//         this.model.setGameState(GameState.GAME_OVER);

//         // Clear the grid with animation
//         await AnimationHelper.animateClearGrid(this.model.getGrid());

//         // Remove all items after animation
//         const grid = this.model.getGrid();
//         for (let row = 0; row < grid.rows; row++) {
//             for (let col = 0; col < grid.cols; col++) {
//                 const tile = grid.getTile(row, col);
//                 const item = tile?.removeItem();
//                 if (item) {
//                     item.destroy();
//                 }
//             }
//         }

//         console.log("Grid cleared");

//         GlobalDispatcher.dispatch(GAME_OVER, { score: this.model.score });
//         GlobalDispatcher.dispatch(SHOW_FINISH_SCREEN, {
//             isWin: false,
//             score: this.model.score
//         });
//     }

//     private getRandomColor(colors: TileColor[]): TileColor {
//         return colors[Math.floor(Math.random() * colors.length)];
//     }

//     private trySwapInDirection(fromTile: BubbleTile, direction: SwipeVector): void {
//         if (!fromTile.hasItem()) return;

//         const grid = this.model.getGrid();
//         const targetRow = fromTile.row + direction.row;
//         const targetCol = fromTile.col + direction.col;

//         const targetTile = grid.getTile(targetRow, targetCol);
//         if (!targetTile || !targetTile.hasItem()) return;

//         this.swapItems(fromTile, targetTile);
//     }

//     private swapItems(tileA: BubbleTile, tileB: BubbleTile): void {
//         if (!tileA.hasItem() || !tileB.hasItem()) return;

//         if (!this.model.hasMovesLeft()) {
//             console.log("No moves left for swap!");
//             return;
//         }

//         // Use a move for swapping
//         this.model.useMove();
//         this.dispatchMovesUpdate();
//         console.log(`Swap move used. Moves left: ${this.model.movesLeft}/${this.model.maxMoves}`);

//         const itemA = tileA.removeItem()!;
//         const itemB = tileB.removeItem()!;

//         tileA.setItem(itemB);
//         tileB.setItem(itemA);

//         // Check game over after swap
//         if (!this.model.hasMovesLeft()) {
//             this.handleGameOver();
//         }
//     }

//     private createItem(color: TileColor): Item {
//         const textureKey = this.model.getTextureKeyForColor(color);
//         const texture = AssetsLoader.get(textureKey);
//         return new Item(color, texture);
//     }

//     private getTileTexture(index: number): Texture {
//         const textureKey = this.model.getTextureGrid(index);
//         return AssetsLoader.get(textureKey);
//     }

//     destroy(): void {
//         this.swipeSystem.destroy();
//         this.clickSystem.destroy();
//         if (this.leftTableController) {
//             this.leftTableController.destroy();
//         }
//         GlobalDispatcher.removeAllForContext(this);
//     }
// }

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
import { GravitySystem } from "src/game/bubbleGame/gravity";
import { LeftTableController, LeftTableModel, LeftTableView } from "./leftTable";
import { SCORE_UPDATED, MOVES_UPDATED, GAME_WIN, GAME_OVER, SHOW_FINISH_SCREEN, EXIT_GAME } from "src/events/TypesDispatch";
import { AnimationHelper, FillAnimationItem } from "./animation";
import { Texture } from "pixi.js";

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
        this.setupEventListeners();
        this.initGrid();
    }

    private setupEventListeners(): void {
        GlobalDispatcher.add(EXIT_GAME, this.onExitGame, this);
    }

    private onExitGame(): void {
        if (this.isAnimating) return;
        this.handleGameOver();
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
        const gap = this.model.levelConfig.gridConfig.gap;
        const itemsToAnimate: FillAnimationItem[] = [];

        for (let col = grid.cols - 1; col >= 0; col--) {
            for (let row = 0; row < grid.rows; row++) {
                const tile = grid.getTile(row, col);
                if (tile && !tile.hasItem()) {
                    const randomColor = this.getBalancedColor(row, col, this.availableColors);
                    const item = this.createItem(randomColor);

                    tile.setTexture(this.getTileTexture(row % 2));
                    tile.setItem(item);
                    this.model.incrementSpawnedItems();

                    itemsToAnimate.push({ item, tile, row, col });
                }
            }
        }

        await AnimationHelper.animateGridFill(itemsToAnimate, grid.cols, gap);

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

        // Use a move for collecting
        this.model.useMove();

        // Bonus: if collecting more than 10 items, add 1 move back
        const collectedCount = matchResult!.count;
        if (collectedCount > 10) {
            this.model.addMove();
            console.log(`Bonus! Collected ${collectedCount} items (>10), +1 move!`);
        }

        this.dispatchMovesUpdate();
        console.log(`Moves left: ${this.model.movesLeft}/${this.model.maxMoves}`);

        const scoreResult = ScoreCalculator.calculate(collectedCount, this.model.multiplier);
        this.model.addScore(scoreResult.totalScore);
        this.dispatchScoreUpdate();

        console.log(`Collected ${collectedCount} ${TileColor[matchResult!.color]} items! Score: +${scoreResult.totalScore} (Total: ${this.model.score})`);

        // Cancel any active swipe to prevent accidental moves after collection
        this.swipeSystem.cancel();

        // Remove collected items with animation
        this.collectAndRefill(matchResult!.tiles);
    }

    private async collectAndRefill(tiles: BubbleTile[]): Promise<void> {
        this.isAnimating = true;

        // Animate collected items disappearing
        await AnimationHelper.animateCollect(tiles);

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

        // Check win condition (grid is empty - perfect clear!)
        if (this.isGridEmpty()) {
            this.handleWin();
            return;
        }

        // Check if no valid matches remain (no possible moves, even with swaps)
        if (!MatchFinder.hasPossibleMoves(this.model.getGrid(), this.MIN_MATCH_COUNT)) {
            // Not a loss - finish with penalty for remaining items
            await this.handleNoMatchesLeft();
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
        console.log("=== YOU WIN! (Perfect Clear) ===");
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

    private async handleNoMatchesLeft(): Promise<void> {
        const remainingItems = this.countRemainingItems();
        const penalty = remainingItems * 10;
        const finalScore = Math.max(0, this.model.score - penalty);

        console.log("=== NO MATCHES LEFT ===");
        console.log(`Remaining items: ${remainingItems}`);
        console.log(`Penalty: -${penalty}`);
        console.log(`Final Score: ${this.model.score} - ${penalty} = ${finalScore}`);

        // Update score with penalty
        this.model.setScore(finalScore);
        this.dispatchScoreUpdate();

        this.model.setGameState(GameState.LEVEL_COMPLETE);

        // Clear remaining items with animation
        await AnimationHelper.animateClearGrid(this.model.getGrid());

        // Remove all items after animation
        const grid = this.model.getGrid();
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const tile = grid.getTile(row, col);
                const item = tile?.removeItem();
                if (item) {
                    item.destroy();
                }
            }
        }

        GlobalDispatcher.dispatch(GAME_WIN, { score: finalScore });
        GlobalDispatcher.dispatch(SHOW_FINISH_SCREEN, {
            isWin: true,
            score: finalScore
        });
    }

    private countRemainingItems(): number {
        const grid = this.model.getGrid();
        let count = 0;
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const tile = grid.getTile(row, col);
                if (tile?.hasItem()) {
                    count++;
                }
            }
        }
        return count;
    }

    private async applyGravityAndRefill(): Promise<void> {
        const grid = this.model.getGrid();
        let totalGravity = 0;
        let totalShift = 0;

        // Run gravity and shift in steps until stable
        let hasChanges = true;
        while (hasChanges) {
            hasChanges = false;

            // Step 1: Apply gravity (all items fall down)
            const gravityMoves = this.gravitySystem.applyGravity();
            if (gravityMoves.length > 0) {
                hasChanges = true;
                totalGravity += gravityMoves.length;
                // Sort: bottom rows first, then right columns
                gravityMoves.sort((a, b) => (b.toRow - a.toRow) || (b.toCol - a.toCol));
                await AnimationHelper.animateMoves(gravityMoves, grid, { duration: 0.25, stagger: 0.03, ease: "power2.out" });
            }

            // Step 2: Apply shift (all items shift right)
            const shiftMoves = this.gravitySystem.shiftRight();
            if (shiftMoves.length > 0) {
                hasChanges = true;
                totalShift += shiftMoves.length;
                // Sort: bottom-right first (bottom rows, then rightmost target columns)
                shiftMoves.sort((a, b) => (b.fromRow - a.fromRow) || (b.toCol - a.toCol));
                await AnimationHelper.animateMoves(shiftMoves, grid, { duration: 0.2, stagger: 0.05, ease: "power2.out" });
            }
        }

        console.log(`Gravity: ${totalGravity} falls, ${totalShift} shifts`);

        // Fill empty cells with new items (falling from top)
        await this.fillEmptyCellsAnimated();
    }

    private async fillEmptyCellsAnimated(): Promise<void> {
        const emptyCells = this.gravitySystem.getEmptyCells();
        const grid = this.model.getGrid();
        const gap = this.model.levelConfig.gridConfig.gap;
        let spawnedCount = 0;

        const itemsToAnimate: FillAnimationItem[] = [];

        for (const { row, col } of emptyCells) {
            if (!this.model.canSpawnMore()) {
                console.log(`Max items reached: ${this.model.spawnedItems}/${this.model.maxItems}`);
                break;
            }

            const tile = grid.getTile(row, col);
            if (tile && !tile.hasItem()) {
                const randomColor = this.getBalancedColor(row, col, this.availableColors);
                const item = this.createItem(randomColor);

                tile.setItem(item);
                this.model.incrementSpawnedItems();

                itemsToAnimate.push({ item, tile, row });
                spawnedCount++;
            }
        }

        // Animate items falling
        await AnimationHelper.animateFall(itemsToAnimate, gap, { duration: 0.3, stagger: 0.04 });

        // Safety: apply gravity and shift after fill in case items need to settle
        let postGravityCount = 0;
        let postShiftCount = 0;
        let hasChanges = true;

        while (hasChanges) {
            hasChanges = false;

            const postGravity = this.gravitySystem.applyGravity();
            if (postGravity.length > 0) {
                hasChanges = true;
                postGravityCount += postGravity.length;
                postGravity.sort((a, b) => (b.toRow - a.toRow) || (b.toCol - a.toCol));
                await AnimationHelper.animateMoves(postGravity, grid, { duration: 0.2, stagger: 0.03, ease: "power2.out" });
            }

            const postShift = this.gravitySystem.shiftRight();
            if (postShift.length > 0) {
                hasChanges = true;
                postShiftCount += postShift.length;
                postShift.sort((a, b) => (b.fromRow - a.fromRow) || (b.toCol - a.toCol));
                await AnimationHelper.animateMoves(postShift, grid, { duration: 0.2, stagger: 0.05, ease: "power2.out" });
            }
        }

        if (postGravityCount > 0 || postShiftCount > 0) {
            console.log(`Post-fill: ${postGravityCount} gravity, ${postShiftCount} shifts`);
        }

        console.log(`Filled ${spawnedCount} empty cells (Total spawned: ${this.model.spawnedItems}/${this.model.maxItems})`);
    }

    private async handleGameOver(): Promise<void> {
        console.log("=== GAME OVER ===");
        console.log(`Final Score: ${this.model.score}`);
        console.log(`Items Spawned: ${this.model.spawnedItems}/${this.model.maxItems}`);

        this.model.setGameState(GameState.GAME_OVER);

        // Clear the grid with animation
        await AnimationHelper.animateClearGrid(this.model.getGrid());

        // Remove all items after animation
        const grid = this.model.getGrid();
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const tile = grid.getTile(row, col);
                const item = tile?.removeItem();
                if (item) {
                    item.destroy();
                }
            }
        }

        console.log("Grid cleared");

        GlobalDispatcher.dispatch(GAME_OVER, { score: this.model.score });
        GlobalDispatcher.dispatch(SHOW_FINISH_SCREEN, {
            isWin: false,
            score: this.model.score
        });
    }

    private getBalancedColor(row: number, col: number, availableColors: TileColor[]): TileColor {
        const grid = this.model.getGrid();
        const neighbors = [
            { r: row - 1, c: col },
            { r: row + 1, c: col },
            { r: row, c: col - 1 },
            { r: row, c: col + 1 }
        ];

        const colorCounts = new Map<TileColor, number>();
        availableColors.forEach(color => colorCounts.set(color, 0));

        for (const pos of neighbors) {
            if (grid.isValidPosition(pos.r, pos.c)) {
                const tile = grid.getTile(pos.r, pos.c);
                if (tile && tile.hasItem()) {
                    const item = tile.getItem() as Item;
                    if (item && colorCounts.has(item.color)) {
                        colorCounts.set(item.color, colorCounts.get(item.color)! + 1);
                    }
                }
            }
        }

        // Filter colors that have < 2 neighbors of same color (avoids clusters of 3+)
        let candidates = availableColors.filter(color => colorCounts.get(color)! < 2);

        // Fallback if all colors are "bad" (e.g. surrounded by different colors that all create clusters)
        if (candidates.length === 0) {
            const minCount = Math.min(...Array.from(colorCounts.values()));
            candidates = availableColors.filter(color => colorCounts.get(color) === minCount);
        }

        return candidates[Math.floor(Math.random() * candidates.length)];
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

        if (!this.model.hasMovesLeft()) {
            console.log("No moves left for swap!");
            return;
        }

        // Use a move for swapping
        this.model.useMove();
        this.dispatchMovesUpdate();
        console.log(`Swap move used. Moves left: ${this.model.movesLeft}/${this.model.maxMoves}`);

        const itemA = tileA.removeItem()!;
        const itemB = tileB.removeItem()!;

        tileA.setItem(itemB);
        tileB.setItem(itemA);

        // Check game over after swap
        if (!this.model.hasMovesLeft()) {
            this.handleGameOver();
        }
    }

    private createItem(color: TileColor): Item {
        const textureKey = this.model.getTextureKeyForColor(color);
        const texture = AssetsLoader.get(textureKey);
        return new Item(color, texture);
    }

    private getTileTexture(index: number): Texture {
        const textureKey = this.model.getTextureGrid(index);
        return AssetsLoader.get(textureKey);
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

