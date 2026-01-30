import { Container, NineSliceSprite, Texture } from "pixi.js";
import { UIText, IUITextOptions } from "./UIText";
import { ClickSystem } from "../input/ClickSystem";
import gsap from "gsap";

export interface IUIButtonOptions {
    texture: Texture;
    width: number;
    height: number;
    text?: string;
    textOptions?: Partial<IUITextOptions>;
    nineSlice?: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    position?: { x: number; y: number };
    anchor?: { x: number; y: number };
    onClick?: () => void;
    hoverScale?: number;
    pressScale?: number;
    disabled?: boolean;
}

const DEFAULT_NINE_SLICE = {
    left: 50,
    top: 50,
    right: 50,
    bottom: 50,
};

export class UIButton extends Container {
    private _content: Container;
    private _background: NineSliceSprite;
    private _label?: UIText;
    private _clickSystem: ClickSystem<UIButton>;
    private _onClick?: () => void;
    private _hoverScale: number;
    private _pressScale: number;
    private _disabled: boolean = false;
    private _anchor: { x: number; y: number };
    private _buttonWidth: number;
    private _buttonHeight: number;

    constructor(options: IUIButtonOptions) {
        super();

        this._buttonWidth = options.width;
        this._buttonHeight = options.height;
        this._onClick = options.onClick;
        this._hoverScale = options.hoverScale ?? 1.05;
        this._pressScale = options.pressScale ?? 0.95;
        this._anchor = options.anchor ?? { x: 0.5, y: 0.5 };
        this._disabled = options.disabled ?? false;

        this._content = new Container();
        this.addChild(this._content);

        const slice = options.nineSlice ?? DEFAULT_NINE_SLICE;

        this._background = new NineSliceSprite({
            texture: options.texture,
            leftWidth: slice.left,
            topHeight: slice.top,
            rightWidth: slice.right,
            bottomHeight: slice.bottom,
        });
        this._background.width = options.width;
        this._background.height = options.height;
        this._content.addChild(this._background);

        if (options.text) {
            const textOpts: IUITextOptions = {
                text: options.text,
                fontSize: 32,
                fill: 0xffffff,
                fontWeight: 'bold',
                anchor: 0.5,
                stroke: {
                    color: 0x000000,
                    width: 3,
                },
                dropShadow: {
                    color: 0x000000,
                    blur: 2,
                    distance: 2,
                },
                maxWidth: options.width - 40,
                ...options.textOptions,
            };

            this._label = new UIText(textOpts);
            this._label.position.set(options.width / 2, options.height / 2);
            this._content.addChild(this._label);
        }

        this.applyAnchor();

        if (options.position) {
            this.position.set(options.position.x, options.position.y);
        }

        this._clickSystem = new ClickSystem<UIButton>({
            onPointerOver: () => this.onPointerOver(),
            onPointerOut: () => this.onPointerOut(),
            onPointerDown: () => this.onPointerDown(),
            onPointerUp: () => this.onPointerUp(),
            onPointerUpOutside: () => this.onPointerUpOutside(),
            canClick: () => !this._disabled,
        });

        this._clickSystem.attach(this);
    }

    private applyAnchor(): void {
        const offsetX = -this._buttonWidth * this._anchor.x;
        const offsetY = -this._buttonHeight * this._anchor.y;

        this._content.position.set(offsetX, offsetY);
        this._content.pivot.set(this._buttonWidth / 2, this._buttonHeight / 2);
        this._content.position.set(
            offsetX + this._buttonWidth / 2,
            offsetY + this._buttonHeight / 2
        );
    }

    private onPointerOver(): void {
        gsap.to(this._content.scale, {
            x: this._hoverScale,
            y: this._hoverScale,
            duration: 0.15,
            ease: 'power2.out',
        });
    }

    private onPointerOut(): void {
        gsap.to(this._content.scale, {
            x: 1,
            y: 1,
            duration: 0.15,
            ease: 'power2.out',
        });
    }

    private onPointerDown(): void {
        gsap.to(this._content.scale, {
            x: this._pressScale,
            y: this._pressScale,
            duration: 0.1,
            ease: 'power2.out',
        });
    }

    private onPointerUp(): void {
        gsap.to(this._content.scale, {
            x: 1,
            y: 1,
            duration: 0.1,
            ease: 'power2.out',
            onComplete: () => {
                this._onClick?.();
            },
        });
    }

    private onPointerUpOutside(): void {
        gsap.to(this._content.scale, {
            x: 1,
            y: 1,
            duration: 0.1,
            ease: 'power2.out',
        });
    }

    setLabel(text: string): void {
        if (this._label) {
            this._label.setText(text);
        }
    }

    setOnClick(callback: () => void): void {
        this._onClick = callback;
    }

    setDisabled(disabled: boolean): void {
        this._disabled = disabled;
        this.alpha = disabled ? 0.5 : 1;
        this._clickSystem.setCursor(disabled ? 'default' : 'pointer');
    }

    setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }

    resize(width: number, height: number): void {
        this._buttonWidth = width;
        this._buttonHeight = height;
        this._background.width = width;
        this._background.height = height;

        if (this._label) {
            this._label.position.set(width / 2, height / 2);
            this._label.setMaxWidth(width - 40);
        }

        this.applyAnchor();
    }

    get buttonWidth(): number {
        return this._buttonWidth;
    }

    get buttonHeight(): number {
        return this._buttonHeight;
    }

    destroy(options?: Parameters<Container['destroy']>[0]): void {
        this._clickSystem.destroy();
        super.destroy(options);
    }
}
