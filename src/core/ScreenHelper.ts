import { Application, Graphics } from "pixi.js";

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
     */
    public static updateTransform(scale: number, offsetX: number, offsetY: number): void {
        this.scale = scale;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    public static get Width(): number {
        return this.width;
    }

    public static get Height(): number {
        return this.height;
    }
    /**
     * Top-left corner in logical coordinates (always 0, 0)
     */
    public static get TopLeft(): IPoint {
        return { x: 0, y: 0 };
    }

    /**
     * Top-right corner in logical coordinates
     */
    public static get TopRight(): IPoint {
        return { x: this.width, y: 0 };
    }

    /**
     * Bottom-left corner in logical coordinates
     */
    public static get BottomLeft(): IPoint {
        return { x: 0, y: this.height };
    }

    /**
     * Bottom-right corner in logical coordinates
     */
    public static get BottomRight(): IPoint {
        return { x: this.width, y: this.height };
    }

    /**
     * Center point in logical coordinates
     */
    public static get Center(): IPoint {
        return { x: this.width / 2, y: this.height / 2 };
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