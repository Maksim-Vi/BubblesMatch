import { Text, TextStyle, TextStyleFontWeight, TextStyleOptions } from "pixi.js";

export interface IUITextOptions {
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fill?: number | string;
    fontWeight?: TextStyleFontWeight;
    align?: 'left' | 'center' | 'right';
    stroke?: {
        color?: number | string;
        width?: number;
    };
    dropShadow?: {
        color?: number | string;
        blur?: number;
        distance?: number;
        angle?: number;
        alpha?: number;
    };
    wordWrap?: boolean;
    wordWrapWidth?: number;
    anchor?: { x: number; y: number } | number;
    position?: { x: number; y: number };
    maxWidth?: number;
}

const DEFAULT_FONT_FAMILY = 'VAGRounded';

export class UIText extends Text {
    private _maxWidth?: number;
    private _originalFontSize: number;

    constructor(options: IUITextOptions = {}) {
        const styleOptions: TextStyleOptions = {
            fontFamily: options.fontFamily ?? DEFAULT_FONT_FAMILY,
            fontSize: options.fontSize ?? 32,
            fill: options.fill ?? 0xffffff,
            fontWeight: options.fontWeight ?? 'bold',
            align: options.align ?? 'center',
        };

        if (options.stroke) {
            styleOptions.stroke = {
                color: options.stroke.color ?? 0x000000,
                width: options.stroke.width ?? 4,
            };
        }

        if (options.dropShadow) {
            styleOptions.dropShadow = {
                color: options.dropShadow.color ?? 0x000000,
                blur: options.dropShadow.blur ?? 4,
                distance: options.dropShadow.distance ?? 2,
                angle: options.dropShadow.angle ?? Math.PI / 4,
                alpha: options.dropShadow.alpha ?? 0.5,
            };
        }

        if (options.wordWrap) {
            styleOptions.wordWrap = true;
            styleOptions.wordWrapWidth = options.wordWrapWidth ?? 400;
        }

        const style = new TextStyle(styleOptions);

        super({
            text: options.text ?? '',
            style,
        });

        this._originalFontSize = options.fontSize ?? 32;
        this._maxWidth = options.maxWidth;

        if (typeof options.anchor === 'number') {
            this.anchor.set(options.anchor);
        } else if (options.anchor) {
            this.anchor.set(options.anchor.x, options.anchor.y);
        }

        if (options.position) {
            this.position.set(options.position.x, options.position.y);
        }

        if (this._maxWidth) {
            this.fitToMaxWidth();
        }
    }

    private fitToMaxWidth(): void {
        if (!this._maxWidth) return;

        let currentFontSize = this._originalFontSize;
        this.style.fontSize = currentFontSize;

        while (this.width > this._maxWidth && currentFontSize > 8) {
            currentFontSize -= 1;
            this.style.fontSize = currentFontSize;
        }
    }

    setText(text: string): void {
        this.text = text;
        if (this._maxWidth) {
            this.style.fontSize = this._originalFontSize;
            this.fitToMaxWidth();
        }
    }

    setStyle(options: Partial<IUITextOptions>): void {
        if (options.fontFamily !== undefined) {
            this.style.fontFamily = options.fontFamily;
        }
        if (options.fontSize !== undefined) {
            this._originalFontSize = options.fontSize;
            this.style.fontSize = options.fontSize;
        }
        if (options.fill !== undefined) {
            this.style.fill = options.fill;
        }
        if (options.fontWeight !== undefined) {
            this.style.fontWeight = options.fontWeight;
        }
        if (options.align !== undefined) {
            this.style.align = options.align;
        }

        if (this._maxWidth) {
            this.fitToMaxWidth();
        }
    }

    setMaxWidth(maxWidth: number): void {
        this._maxWidth = maxWidth;
        this.fitToMaxWidth();
    }

    setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }

    setAnchor(x: number, y?: number) {
        if(!y) return this.anchor.set(x);

        this.anchor.set(x,y);
    }
}
