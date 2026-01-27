import { Graphics, Text } from "pixi.js";
import { ScreenHelper } from "../core/ScreenHelper";

/**
 * Debug helper for testing ScreenHelper functionality
 * Shows debug points at all corners and center
 */
export class DebugHelper {
    private static debugGraphics: Graphics[] = [];
    private static debugTexts: Text[] = [];

    /**
     * Draws debug points at all corners and center
     */
    public static showDebugPoints(): void {
        this.clearDebugPoints();

        // Draw corner points
        const topLeft = ScreenHelper.TopLeft;
        const topRight = ScreenHelper.TopRight;
        const bottomLeft = ScreenHelper.BottomLeft;
        const bottomRight = ScreenHelper.BottomRight;
        const center = ScreenHelper.Center;

        // Top-left (Green)
        const tlGraphic = ScreenHelper.drawPoint(topLeft.x, topLeft.y, 0x00FF00, 15);
        this.debugGraphics.push(tlGraphic);
        this.addLabel(`TL (${topLeft.x}, ${topLeft.y})`, topLeft.x + 20, topLeft.y + 20);

        // Top-right (Blue)
        const trGraphic = ScreenHelper.drawPoint(topRight.x, topRight.y, 0x0000FF, 15);
        this.debugGraphics.push(trGraphic);
        this.addLabel(`TR (${topRight.x}, ${topRight.y})`, topRight.x - 150, topRight.y + 20);

        // Bottom-left (Yellow)
        const blGraphic = ScreenHelper.drawPoint(bottomLeft.x, bottomLeft.y, 0xFFFF00, 15);
        this.debugGraphics.push(blGraphic);
        this.addLabel(`BL (${bottomLeft.x}, ${bottomLeft.y})`, bottomLeft.x + 20, bottomLeft.y - 40);

        // Bottom-right (Magenta)
        const brGraphic = ScreenHelper.drawPoint(bottomRight.x, bottomRight.y, 0xFF00FF, 15);
        this.debugGraphics.push(brGraphic);
        this.addLabel(`BR (${bottomRight.x}, ${bottomRight.y})`, bottomRight.x - 150, bottomRight.y - 40);

        // Center (Red)
        const cGraphic = ScreenHelper.drawPoint(center.x, center.y, 0xFF0000, 20);
        this.debugGraphics.push(cGraphic);
        this.addLabel(`CENTER (${center.x}, ${center.y})`, center.x + 25, center.y);

        // Show scale and offset info
        const scale = ScreenHelper.Scale;
        const offset = ScreenHelper.Offset;
        this.addLabel(
            `Scale: ${scale.toFixed(3)} | Offset: (${offset.x.toFixed(1)}, ${offset.y.toFixed(1)})`,
            center.x - 200,
            50
        );
    }

    /**
     * Adds a text label at specified position
     */
    private static addLabel(text: string, x: number, y: number): void {
        const label = new Text({
            text: text,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xFFFFFF,
                stroke: { color: 0x000000, width: 4 }
            }
        });
        label.position.set(x, y);

        // Get app from ScreenHelper (we need to access stage)
        // Since ScreenHelper stores app privately, we'll add to stage directly through drawPoint's parent
        if (this.debugGraphics.length > 0 && this.debugGraphics[0].parent) {
            this.debugGraphics[0].parent.addChild(label);
            this.debugTexts.push(label);
        }
    }

    /**
     * Clears all debug points and labels
     */
    public static clearDebugPoints(): void {
        this.debugGraphics.forEach(g => g.destroy());
        this.debugTexts.forEach(t => t.destroy());
        this.debugGraphics = [];
        this.debugTexts = [];
    }
}
