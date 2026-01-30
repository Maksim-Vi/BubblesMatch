import { Sprite, Texture } from "pixi.js";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { ScreenHelper } from "src/core/ScreenHelper";
import { RESIZE_APP } from "src/events/TypesDispatch";
import { gameConfig } from "../../../game.config";

export class ScaledBackground extends Sprite {
    constructor(texture?: Texture) {
        super(texture);
        this.anchor.set(0.5);
        this.updateScale();

        GlobalDispatcher.add(RESIZE_APP, this.updateScale, this);
    }

    setTexture(texture: Texture): void {
        this.texture = texture;
        this.updateScale();
    }

    private updateScale = (): void => {
        if (!this.texture || !this.texture.width || !this.texture.height) return;

        const viewportWidth = ScreenHelper.ViewportWidth;
        const viewportHeight = ScreenHelper.ViewportHeight;

        // Skip if viewport is not ready
        if (viewportWidth <= 0 || viewportHeight <= 0) {
            if (gameConfig.debug.verbose) {
                console.warn("[ScaledBackground] Skipped - invalid viewport:", { viewportWidth, viewportHeight });
            }
            return;
        }

        const scaleX = viewportWidth / this.texture.width;
        const scaleY = viewportHeight / this.texture.height;
        const scale = Math.max(scaleX, scaleY);

        this.scale.set(scale);
        this.position.set(ScreenHelper.ViewportCenter.x, ScreenHelper.ViewportCenter.y);

        if (gameConfig.debug.verbose) {
            console.log("[ScaledBackground] Updated:", {
                viewportWidth,
                viewportHeight,
                textureSize: { w: this.texture.width, h: this.texture.height },
                scale,
                position: { x: ScreenHelper.ViewportCenter.x, y: ScreenHelper.ViewportCenter.y }
            });
        }
    };

    destroy(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.updateScale);
        super.destroy();
    }
}
