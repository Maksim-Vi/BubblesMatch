import { NineSliceSprite, Texture } from "pixi.js";

export interface INineSlicePanelOptions {
    texture: Texture;
    width: number;
    height: number;
    leftWidth?: number;
    topHeight?: number;
    rightWidth?: number;
    bottomHeight?: number;
}

export class NineSlicePanel extends NineSliceSprite {
    constructor(options: INineSlicePanelOptions) {
        const borderSize = options.leftWidth ?? 22;

        super({
            texture: options.texture,
            leftWidth: options.leftWidth ?? borderSize,
            topHeight: options.topHeight ?? borderSize,
            rightWidth: options.rightWidth ?? borderSize,
            bottomHeight: options.bottomHeight ?? borderSize,
        });

        this.width = options.width;
        this.height = options.height;
    }

    resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }
}
