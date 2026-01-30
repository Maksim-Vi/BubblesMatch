import { Container, NineSliceSprite, Texture } from "pixi.js";
import { UIContainer, IUIContainerOptions } from "./UIContainer";

export interface IUIPanelOptions extends IUIContainerOptions {
    texture: Texture;
    nineSlice?: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    anchor?: { x: number; y: number };
}

const DEFAULT_NINE_SLICE = {
    left: 50,
    top: 50,
    right: 50,
    bottom: 50,
};

export class UIPanel extends Container {
    private _background: NineSliceSprite;
    private _content: UIContainer;
    private _panelWidth: number;
    private _panelHeight: number;
    private _anchor: { x: number; y: number };

    constructor(options: IUIPanelOptions) {
        super();

        this._panelWidth = options.width ?? 400;
        this._panelHeight = options.height ?? 300;
        this._anchor = options.anchor ?? { x: 0.5, y: 0.5 };

        const slice = options.nineSlice ?? DEFAULT_NINE_SLICE;

        this._background = new NineSliceSprite({
            texture: options.texture,
            leftWidth: slice.left,
            topHeight: slice.top,
            rightWidth: slice.right,
            bottomHeight: slice.bottom,
        });
        this._background.width = this._panelWidth;
        this._background.height = this._panelHeight;
        this.addChild(this._background);

        this._content = new UIContainer({
            width: this._panelWidth,
            height: this._panelHeight,
            flexDirection: options.flexDirection,
            justifyContent: options.justifyContent,
            alignItems: options.alignItems,
            gap: options.gap,
            padding: options.padding,
        });
        this.addChild(this._content);

        this.applyAnchor();

        if (options.position) {
            this.position.set(options.position.x, options.position.y);
        }
    }

    private applyAnchor(): void {
        const offsetX = -this._panelWidth * this._anchor.x;
        const offsetY = -this._panelHeight * this._anchor.y;

        this._background.position.set(offsetX, offsetY);
        this._content.position.set(offsetX, offsetY);
    }

    addContent(child: Container): void {
        this._content.addLayoutChild(child);
    }

    removeContent(child: Container): void {
        this._content.removeLayoutChild(child);
    }

    updateLayout(): void {
        this._content.updateLayout();
    }

    resize(width: number, height: number): void {
        this._panelWidth = width;
        this._panelHeight = height;
        this._background.width = width;
        this._background.height = height;
        this._content.setSize(width, height);
        this.applyAnchor();
    }

    setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }

    get content(): UIContainer {
        return this._content;
    }

    get panelWidth(): number {
        return this._panelWidth;
    }

    get panelHeight(): number {
        return this._panelHeight;
    }
}
