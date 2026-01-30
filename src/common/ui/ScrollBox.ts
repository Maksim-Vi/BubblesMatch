import { Container, Graphics, FederatedPointerEvent, FederatedWheelEvent } from "pixi.js";

export interface IScrollBoxOptions {
    width: number;
    height: number;
    scrollDirection?: 'vertical' | 'horizontal';
}

export class ScrollBox extends Container {
    private _content: Container;
    private _maskGraphics: Graphics;
    private _options: IScrollBoxOptions;

    private _isDragging: boolean = false;
    private _lastPointerY: number = 0;
    private _scrollY: number = 0;
    private _velocity: number = 0;
    private _isAnimating: boolean = false;

    constructor(options: IScrollBoxOptions) {
        super();
        this._options = options;

        this._maskGraphics = new Graphics();
        this._maskGraphics.rect(0, 0, options.width, options.height);
        this._maskGraphics.fill({ color: 0xffffff });
        this.addChild(this._maskGraphics);

        this._content = new Container();
        this._content.mask = this._maskGraphics;
        this.addChild(this._content);

        this.eventMode = 'static';
        this.hitArea = { contains: (x: number, y: number) =>
            x >= 0 && x <= options.width && y >= 0 && y <= options.height
        };

        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointermove', this.onPointerMove, this);
        this.on('pointerup', this.onPointerUp, this);
        this.on('pointerupoutside', this.onPointerUp, this);
        this.on('wheel', this.onWheel, this);
    }

    get content(): Container {
        return this._content;
    }

    addScrollContent(child: Container): void {
        this._content.addChild(child);
    }

    private onPointerDown = (e: FederatedPointerEvent): void => {
        this._isDragging = true;
        this._lastPointerY = e.global.y;
        this._velocity = 0;
        this._isAnimating = false;
    }

    private onPointerMove = (e: FederatedPointerEvent): void => {
        if (!this._isDragging) return;

        const deltaY = e.global.y - this._lastPointerY;
        this._velocity = deltaY;
        this._lastPointerY = e.global.y;

        this.scrollBy(deltaY);
    }

    private onPointerUp = (): void => {
        this._isDragging = false;

        if (Math.abs(this._velocity) > 1) {
            this._isAnimating = true;
            this.animateInertia();
        }
    }

    private onWheel = (e: FederatedWheelEvent): void => {
        e.preventDefault();
        this.scrollBy(-e.deltaY * 0.5);
    }

    private scrollBy(deltaY: number): void {
        const contentHeight = this._content.height;
        const viewHeight = this._options.height;

        const maxScroll = 0;
        const minScroll = Math.min(0, viewHeight - contentHeight);

        this._scrollY = Math.max(minScroll, Math.min(maxScroll, this._scrollY + deltaY));
        this._content.y = this._scrollY;
    }

    private animateInertia(): void {
        if (!this._isAnimating) return;

        this._velocity *= 0.95;

        if (Math.abs(this._velocity) < 0.5) {
            this._isAnimating = false;
            return;
        }

        this.scrollBy(this._velocity);
        requestAnimationFrame(() => this.animateInertia());
    }

    scrollToTop(): void {
        this._scrollY = 0;
        this._content.y = 0;
    }

    resize(width: number, height: number): void {
        this._options.width = width;
        this._options.height = height;

        this._maskGraphics.clear();
        this._maskGraphics.rect(0, 0, width, height);
        this._maskGraphics.fill({ color: 0xffffff });
    }

    destroy(): void {
        this.off('pointerdown', this.onPointerDown);
        this.off('pointermove', this.onPointerMove);
        this.off('pointerup', this.onPointerUp);
        this.off('pointerupoutside', this.onPointerUp);
        this.off('wheel', this.onWheel);
        super.destroy({ children: true });
    }
}
