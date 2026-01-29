import { Sprite, Texture } from "pixi.js";
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { ScreenHelper } from "src/core/ScreenHelper";
import { RESIZE_APP } from "src/events/TypesDispatch";

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
        if (!this.texture || !this.texture.width) return;

        const screenWidth = ScreenHelper.Width;
        const screenHeight = ScreenHelper.Height;

        const scaleX = screenWidth / this.texture.width;
        const scaleY = screenHeight / this.texture.height;
        const scale = Math.max(scaleX, scaleY);

        this.scale.set(scale);
        this.position.set(ScreenHelper.Center.x, ScreenHelper.Center.y);
    };

    destroy(): void {
        GlobalDispatcher.remove(RESIZE_APP, this.updateScale);
        super.destroy();
    }
}
