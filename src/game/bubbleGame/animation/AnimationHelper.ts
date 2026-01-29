import gsap from "gsap";
import { Item } from "../Item/Item";
import { BubbleTile } from "../tileBubble/BubbleTile";
import { BubbleGrid } from "../gridBubble/BubbleGrid";
import { GravityMove } from "../gravity";

export interface FillAnimationItem {
    item: Item;
    tile: BubbleTile;
    row: number;
    col?: number;
}

export interface AnimationConfig {
    duration: number;
    stagger: number;
    ease: string;
}

const DEFAULT_FALL_CONFIG: AnimationConfig = {
    duration: 0.35,
    stagger: 0.03,
    ease: "power2.out"
};

const DEFAULT_COLLECT_CONFIG: AnimationConfig = {
    duration: 0.15,
    stagger: 0.02,
    ease: "back.in(2)"
};

const DEFAULT_MOVE_CONFIG: AnimationConfig = {
    duration: 0.25,
    stagger: 0.04,
    ease: "power2.out"
};

const DEFAULT_CLEAR_CONFIG: AnimationConfig = {
    duration: 0.4,
    stagger: 0.02,
    ease: "power2.in"
};

export class AnimationHelper {

    /**
     * Animate items falling into the grid (initial fill or refill)
     */
    static animateFall(
        items: FillAnimationItem[],
        gap: number,
        config: Partial<AnimationConfig> = {}
    ): Promise<void> {
        return new Promise((resolve) => {
            if (items.length === 0) {
                resolve();
                return;
            }

            const { duration, stagger, ease } = { ...DEFAULT_FALL_CONFIG, ...config };
            const tl = gsap.timeline({ onComplete: resolve });

            items.forEach(({ item, tile, row, col }) => {
                const targetY = tile.data.sizeTile / 2;
                const fallDistance = (row + 1) * (tile.data.sizeTile + gap);

                // Position item above the grid
                item.alpha = 0;
                item.y = tile.data.sizeTile / 2 - fallDistance;

                // Calculate delay based on column and row
                const colDelay = col !== undefined ? col * 0.08 : 0;
                const rowDelay = row * stagger;
                const delay = colDelay + rowDelay;
                const itemDuration = duration + row * 0.02;

                // Show item and animate fall
                tl.set(item, { alpha: 1 }, delay);
                tl.to(item, {
                    y: targetY,
                    duration: itemDuration,
                    ease
                }, delay);
            });
        });
    }

    /**
     * Animate items falling for grid fill (column by column, right to left)
     */
    static animateGridFill(
        items: FillAnimationItem[],
        gridCols: number,
        gap: number,
        config: Partial<AnimationConfig> = {}
    ): Promise<void> {
        return new Promise((resolve) => {
            if (items.length === 0) {
                resolve();
                return;
            }

            const { duration, stagger, ease } = { ...DEFAULT_FALL_CONFIG, ...config };
            const tl = gsap.timeline({ onComplete: resolve });

            items.forEach(({ item, tile, row, col }) => {
                const targetY = tile.data.sizeTile / 2;
                const fallDistance = (row + 1) * (tile.data.sizeTile + gap);

                // Position item above the grid
                item.alpha = 0;
                item.y = tile.data.sizeTile / 2 - fallDistance;

                // Stagger by column first (right to left), then by row
                const colIndex = col !== undefined ? col : 0;
                const colDelay = (gridCols - 1 - colIndex) * 0.08;
                const rowDelay = row * stagger;
                const delay = colDelay + rowDelay;
                const itemDuration = duration + row * 0.02;

                // Show item and animate fall
                tl.set(item, { alpha: 1 }, delay);
                tl.to(item, {
                    y: targetY,
                    duration: itemDuration,
                    ease
                }, delay);
            });
        });
    }

    /**
     * Animate collecting/removing items (scale to 0)
     */
    static animateCollect(
        tiles: BubbleTile[],
        config: Partial<AnimationConfig> = {}
    ): Promise<void> {
        return new Promise((resolve) => {
            const items = tiles.map(t => t.getItem()).filter(Boolean) as Item[];

            if (items.length === 0) {
                resolve();
                return;
            }

            const { duration, stagger, ease } = { ...DEFAULT_COLLECT_CONFIG, ...config };
            const tl = gsap.timeline({ onComplete: resolve });

            items.forEach((item, index) => {
                tl.to(item.scale, {
                    x: 0,
                    y: 0,
                    duration,
                    ease
                }, index * stagger);
            });
        });
    }

    /**
     * Animate gravity/shift moves
     */
    static animateMoves(
        moves: GravityMove[],
        grid: BubbleGrid,
        config: Partial<AnimationConfig> = {}
    ): Promise<void> {
        return new Promise((resolve) => {
            if (moves.length === 0) {
                resolve();
                return;
            }

            const { duration, stagger, ease } = { ...DEFAULT_MOVE_CONFIG, ...config };
            const tl = gsap.timeline({ onComplete: resolve });

            moves.forEach((move, index) => {
                const targetTile = grid.getTile(move.toRow, move.toCol);
                const item = targetTile?.getItem();

                if (item) {
                    const sourceTile = grid.getTile(move.fromRow, move.fromCol);
                    if (sourceTile && targetTile) {
                        // Calculate visual offset from source to target
                        const offsetX = sourceTile.x - targetTile.x;
                        const offsetY = sourceTile.y - targetTile.y;

                        // Position item at source location visually
                        item.x += offsetX;
                        item.y += offsetY;

                        // Animate to target position (center of tile)
                        tl.to(item, {
                            x: targetTile.data.sizeTile / 2,
                            y: targetTile.data.sizeTile / 2,
                            duration,
                            ease
                        }, index * stagger);
                    }
                }
            });
        });
    }

    /**
     * Animate clearing the grid (items fall down and fade out)
     */
    static animateClearGrid(
        grid: BubbleGrid,
        config: Partial<AnimationConfig> = {}
    ): Promise<void> {
        return new Promise((resolve) => {
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

            if (itemsToAnimate.length === 0) {
                resolve();
                return;
            }

            const { duration, stagger, ease } = { ...DEFAULT_CLEAR_CONFIG, ...config };
            const tl = gsap.timeline({ onComplete: resolve });

            itemsToAnimate.forEach((item, index) => {
                tl.to(item, {
                    y: item.y + 500,
                    alpha: 0,
                    duration,
                    ease
                }, index * stagger);
            });
        });
    }

    /**
     * Simple scale animation (useful for bounce effects, highlights, etc.)
     */
    static animateScale(
        target: { scale: { x: number; y: number } },
        toScale: number,
        duration: number = 0.2,
        ease: string = "power2.out"
    ): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(target.scale, {
                x: toScale,
                y: toScale,
                duration,
                ease,
                onComplete: resolve
            });
        });
    }

    /**
     * Bounce animation (scale up then back to normal)
     */
    static animateBounce(
        target: { scale: { x: number; y: number } },
        bounceScale: number = 1.2,
        duration: number = 0.3
    ): Promise<void> {
        return new Promise((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve });
            tl.to(target.scale, {
                x: bounceScale,
                y: bounceScale,
                duration: duration * 0.4,
                ease: "power2.out"
            });
            tl.to(target.scale, {
                x: 1,
                y: 1,
                duration: duration * 0.6,
                ease: "elastic.out(1, 0.5)"
            });
        });
    }

    /**
     * Fade in animation
     */
    static animateFadeIn(
        target: { alpha: number },
        duration: number = 0.3,
        ease: string = "power2.out"
    ): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(target, {
                alpha: 1,
                duration,
                ease,
                onComplete: resolve
            });
        });
    }

    /**
     * Fade out animation
     */
    static animateFadeOut(
        target: { alpha: number },
        duration: number = 0.3,
        ease: string = "power2.in"
    ): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(target, {
                alpha: 0,
                duration,
                ease,
                onComplete: resolve
            });
        });
    }

    /**
     * Shake animation (useful for invalid moves, errors, etc.)
     */
    static animateShake(
        target: { x: number },
        intensity: number = 10,
        duration: number = 0.4
    ): Promise<void> {
        return new Promise((resolve) => {
            const originalX = target.x;
            const tl = gsap.timeline({ onComplete: resolve });

            tl.to(target, { x: originalX - intensity, duration: duration * 0.1 });
            tl.to(target, { x: originalX + intensity, duration: duration * 0.1 });
            tl.to(target, { x: originalX - intensity * 0.6, duration: duration * 0.1 });
            tl.to(target, { x: originalX + intensity * 0.6, duration: duration * 0.1 });
            tl.to(target, { x: originalX, duration: duration * 0.2 });
        });
    }
}
