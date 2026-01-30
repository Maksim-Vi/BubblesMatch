import { Container } from "pixi.js";

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch';

export interface IUIContainerOptions {
    width?: number;
    height?: number;
    flexDirection?: FlexDirection;
    justifyContent?: JustifyContent;
    alignItems?: AlignItems;
    gap?: number;
    padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    position?: { x: number; y: number };
}

export class UIContainer extends Container {
    private _containerWidth: number;
    private _containerHeight: number;
    private _flexDirection: FlexDirection;
    private _justifyContent: JustifyContent;
    private _alignItems: AlignItems;
    private _gap: number;
    private _padding: { top: number; right: number; bottom: number; left: number };

    constructor(options: IUIContainerOptions = {}) {
        super();

        this._containerWidth = options.width ?? 0;
        this._containerHeight = options.height ?? 0;
        this._flexDirection = options.flexDirection ?? 'column';
        this._justifyContent = options.justifyContent ?? 'flex-start';
        this._alignItems = options.alignItems ?? 'center';
        this._gap = options.gap ?? 0;

        if (typeof options.padding === 'number') {
            this._padding = {
                top: options.padding,
                right: options.padding,
                bottom: options.padding,
                left: options.padding,
            };
        } else {
            this._padding = {
                top: options.padding?.top ?? 0,
                right: options.padding?.right ?? 0,
                bottom: options.padding?.bottom ?? 0,
                left: options.padding?.left ?? 0,
            };
        }

        if (options.position) {
            this.position.set(options.position.x, options.position.y);
        }
    }

    addLayoutChild(child: Container): void {
        this.addChild(child);
        this.updateLayout();
    }

    removeLayoutChild(child: Container): void {
        this.removeChild(child);
        this.updateLayout();
    }

    updateLayout(): void {
        const children = this.children.filter(c => c.visible) as Container[];
        if (children.length === 0) return;

        const isRow = this._flexDirection === 'row' || this._flexDirection === 'row-reverse';
        const isReverse = this._flexDirection === 'row-reverse' || this._flexDirection === 'column-reverse';

        const availableWidth = this._containerWidth - this._padding.left - this._padding.right;
        const availableHeight = this._containerHeight - this._padding.top - this._padding.bottom;

        let totalMainSize = 0;
        const childSizes: { width: number; height: number }[] = [];

        for (const child of children) {
            const bounds = child.getBounds();
            const w = bounds.width / child.scale.x;
            const h = bounds.height / child.scale.y;
            childSizes.push({ width: w, height: h });
            totalMainSize += isRow ? w : h;
        }

        totalMainSize += this._gap * (children.length - 1);

        const mainAxisAvailable = isRow ? availableWidth : availableHeight;
        const crossAxisAvailable = isRow ? availableHeight : availableWidth;

        let mainOffset = this.getMainAxisOffset(mainAxisAvailable, totalMainSize, children.length);
        const gapOffset = this.getGapOffset(mainAxisAvailable, totalMainSize, children.length);

        const orderedChildren = isReverse ? [...children].reverse() : children;
        const orderedSizes = isReverse ? [...childSizes].reverse() : childSizes;

        for (let i = 0; i < orderedChildren.length; i++) {
            const child = orderedChildren[i];
            const size = orderedSizes[i];

            const mainSize = isRow ? size.width : size.height;
            const crossSize = isRow ? size.height : size.width;

            const crossOffset = this.getCrossAxisOffset(crossAxisAvailable, crossSize);

            if (isRow) {
                child.x = this._padding.left + mainOffset;
                child.y = this._padding.top + crossOffset;
            } else {
                child.x = this._padding.left + crossOffset;
                child.y = this._padding.top + mainOffset;
            }

            mainOffset += mainSize + this._gap + gapOffset;
        }
    }

    private getMainAxisOffset(available: number, totalSize: number, count: number): number {
        const freeSpace = available - totalSize;

        switch (this._justifyContent) {
            case 'flex-start':
                return 0;
            case 'flex-end':
                return freeSpace;
            case 'center':
                return freeSpace / 2;
            case 'space-between':
                return 0;
            case 'space-around':
                return freeSpace / count / 2;
            case 'space-evenly':
                return freeSpace / (count + 1);
            default:
                return 0;
        }
    }

    private getGapOffset(available: number, totalSize: number, count: number): number {
        if (count <= 1) return 0;

        const freeSpace = available - totalSize;

        switch (this._justifyContent) {
            case 'space-between':
                return freeSpace / (count - 1);
            case 'space-around':
                return freeSpace / count;
            case 'space-evenly':
                return freeSpace / (count + 1);
            default:
                return 0;
        }
    }

    private getCrossAxisOffset(available: number, size: number): number {
        switch (this._alignItems) {
            case 'flex-start':
                return 0;
            case 'flex-end':
                return available - size;
            case 'center':
                return (available - size) / 2;
            case 'stretch':
                return 0;
            default:
                return 0;
        }
    }

    setSize(width: number, height: number): void {
        this._containerWidth = width;
        this._containerHeight = height;
        this.updateLayout();
    }

    setFlexDirection(direction: FlexDirection): void {
        this._flexDirection = direction;
        this.updateLayout();
    }

    setJustifyContent(justify: JustifyContent): void {
        this._justifyContent = justify;
        this.updateLayout();
    }

    setAlignItems(align: AlignItems): void {
        this._alignItems = align;
        this.updateLayout();
    }

    setGap(gap: number): void {
        this._gap = gap;
        this.updateLayout();
    }

    setPadding(padding: number | { top?: number; right?: number; bottom?: number; left?: number }): void {
        if (typeof padding === 'number') {
            this._padding = { top: padding, right: padding, bottom: padding, left: padding };
        } else {
            this._padding = {
                top: padding.top ?? this._padding.top,
                right: padding.right ?? this._padding.right,
                bottom: padding.bottom ?? this._padding.bottom,
                left: padding.left ?? this._padding.left,
            };
        }
        this.updateLayout();
    }

    setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }

    get containerWidth(): number {
        return this._containerWidth;
    }

    get containerHeight(): number {
        return this._containerHeight;
    }
}
