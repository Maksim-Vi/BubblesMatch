import { Application, Graphics } from "pixi.js";
import { ScaleMode } from "./GameConfigInterface";

export interface IPoint {
    x: number;
    y: number;
}

export class ScreenHelper {
    private static app: Application;
    private static width: number;
    private static height: number;
    private static scale: number = 1;
    private static offsetX: number = 0;
    private static offsetY: number = 0;
    private static screenWidth: number = 0;
    private static screenHeight: number = 0;
    private static scaleMode: ScaleMode = ScaleMode.FIT;

    public static init(app: Application, width: number, height: number): void {
        this.app = app;
        this.width = width;
        this.height = height;
    }

    /**
     * Updates transform parameters (scale and offset) when window resizes
     * @param scale Current scale factor
     * @param offsetX Horizontal offset
     * @param offsetY Vertical offset
     * @param screenWidth Actual screen/container width
     * @param screenHeight Actual screen/container height
     * @param scaleMode Current scale mode
     */
    public static updateTransform(
        scale: number,
        offsetX: number,
        offsetY: number,
        screenWidth?: number,
        screenHeight?: number,
        scaleMode?: ScaleMode
    ): void {
        this.scale = scale;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        if (screenWidth !== undefined) this.screenWidth = screenWidth;
        if (screenHeight !== undefined) this.screenHeight = screenHeight;
        if (scaleMode !== undefined) this.scaleMode = scaleMode;
    }

    public static get Width(): number {
        return this.width;
    }

    public static get Height(): number {
        return this.height;
    }
    /**
     * Gets the visible viewport bounds in logical coordinates
     * In FILL mode, this represents the actual visible area (smaller than logic size)
     * In FIT mode, this equals the full logic size
     */
    private static get viewportBounds(): { left: number; right: number; top: number; bottom: number } {
        // Check if screen dimensions are ready
        if (this.scaleMode === ScaleMode.FILL && this.scale > 0 && this.screenWidth > 0 && this.screenHeight > 0) {
            return {
                left: -this.offsetX / this.scale,
                right: (this.screenWidth - this.offsetX) / this.scale,
                top: -this.offsetY / this.scale,
                bottom: (this.screenHeight - this.offsetY) / this.scale
            };
        }
        // Fallback to logic dimensions
        return {
            left: 0,
            right: this.width,
            top: 0,
            bottom: this.height
        };
    }

    /**
     * Top-left corner in logical coordinates
     * In FILL mode: returns visible viewport corner
     */
    public static get TopLeft(): IPoint {
        const bounds = this.viewportBounds;
        return { x: bounds.left, y: bounds.top };
    }

    /**
     * Top-right corner in logical coordinates
     * In FILL mode: returns visible viewport corner
     */
    public static get TopRight(): IPoint {
        const bounds = this.viewportBounds;
        return { x: bounds.right, y: bounds.top };
    }

    /**
     * Bottom-left corner in logical coordinates
     * In FILL mode: returns visible viewport corner
     */
    public static get BottomLeft(): IPoint {
        const bounds = this.viewportBounds;
        return { x: bounds.left, y: bounds.bottom };
    }

    /**
     * Bottom-right corner in logical coordinates
     * In FILL mode: returns visible viewport corner
     */
    public static get BottomRight(): IPoint {
        const bounds = this.viewportBounds;
        return { x: bounds.right, y: bounds.bottom };
    }

    /**
     * Center point in logical coordinates (always center of logic size)
     */
    public static get Center(): IPoint {
        return { x: this.width / 2, y: this.height / 2 };
    }

    /**
     * Full logic width (unchanged by scale mode)
     */
    public static get LogicWidth(): number {
        return this.width;
    }

    /**
     * Full logic height (unchanged by scale mode)
     */
    public static get LogicHeight(): number {
        return this.height;
    }

    /**
     * Viewport width in logical coordinates (visible area width)
     */
    public static get ViewportWidth(): number {
        const bounds = this.viewportBounds;
        return bounds.right - bounds.left;
    }

    /**
     * Viewport height in logical coordinates (visible area height)
     */
    public static get ViewportHeight(): number {
        const bounds = this.viewportBounds;
        return bounds.bottom - bounds.top;
    }

    /**
     * Viewport center in logical coordinates (center of visible area)
     */
    public static get ViewportCenter(): IPoint {
        const bounds = this.viewportBounds;
        return {
            x: (bounds.left + bounds.right) / 2,
            y: (bounds.top + bounds.bottom) / 2
        };
    }

    /**
     * Full Screen width (unchanged by scale mode)
     */
    public static get ScreenWidth(): number {
        return this.screenWidth;
    }

    /**
     * Full Screen height (unchanged by scale mode)
     */
    public static get ScreenHeight(): number {
        return this.screenHeight;
    }

    /**
     * Gets current scale factor
     */
    public static get Scale(): number {
        return this.scale;
    }

    /**
     * Gets current offset
     */
    public static get Offset(): IPoint {
        return { x: this.offsetX, y: this.offsetY };
    }

    /**
     * Converts logical coordinates to screen coordinates
     * @param logicalX X coordinate in logical space
     * @param logicalY Y coordinate in logical space
     */
    public static logicalToScreen(logicalX: number, logicalY: number): IPoint {
        return {
            x: logicalX * this.scale + this.offsetX,
            y: logicalY * this.scale + this.offsetY
        };
    }

    /**
     * Converts screen coordinates to logical coordinates
     * @param screenX X coordinate in screen space
     * @param screenY Y coordinate in screen space
     */
    public static screenToLogical(screenX: number, screenY: number): IPoint {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }

    /**
     * Draws a debug point at the specified logical coordinates.
     * @param x X coordinate in logical space (default: Center X)
     * @param y Y coordinate in logical space (default: Center Y)
     * @param color Color of the point (default: Red 0xFF0000)
     * @param radius Radius of the point (default: 10)
     */
    public static drawPoint(
        x: number = this.Center.x,
        y: number = this.Center.y,
        color: number = 0xFF0000,
        radius: number = 10
    ): Graphics {
        const graphics = new Graphics();
        graphics.circle(0, 0, radius);
        graphics.fill(color);
        graphics.position.set(x, y);
        this.app.stage.addChild(graphics);
        return graphics;
    }

    /**
     * Clears all debug graphics from the stage
     */
    public static clearDebugGraphics(): void {
        this.app.stage.children.forEach(child => {
            if (child instanceof Graphics) {
                child.destroy();
            }
        });
    }
}