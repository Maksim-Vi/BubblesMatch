import { Container, FederatedPointerEvent } from "pixi.js";
import { InputSystem } from "./InputSystem";

export interface ClickCallbacks<T> {
    onClick?: (target: T, event: FederatedPointerEvent) => void;
    onDoubleClick?: (target: T, event: FederatedPointerEvent) => void;
    onPointerOver?: (target: T, event: FederatedPointerEvent) => void;
    onPointerOut?: (target: T, event: FederatedPointerEvent) => void;
    onPointerDown?: (target: T, event: FederatedPointerEvent) => void;
    onPointerUp?: (target: T, event: FederatedPointerEvent) => void;
    onPointerUpOutside?: (target: T, event: FederatedPointerEvent) => void;
    canClick?: (target: T) => boolean;
}

export interface ClickSystemConfig {
    doubleClickDelay: number;
    cursor: string;
}

const DEFAULT_CONFIG: ClickSystemConfig = {
    doubleClickDelay: 300,
    cursor: 'pointer',
};

export class ClickSystem<T extends Container = Container> {
    private inputSystem: InputSystem<T>;
    private targets: Map<T, { callbacks: ClickCallbacks<T>; lastClickTime: number }> = new Map();
    private config: ClickSystemConfig;
    private defaultCallbacks: ClickCallbacks<T>;

    constructor(callbacks: ClickCallbacks<T>, config: Partial<ClickSystemConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.defaultCallbacks = callbacks;
        this.inputSystem = new InputSystem<T>({
            cursor: this.config.cursor,
            useGlobalMove: false,
        });
    }

    public attach(target: T, overrideCallbacks?: Partial<ClickCallbacks<T>>): void {
        const callbacks = overrideCallbacks
            ? { ...this.defaultCallbacks, ...overrideCallbacks }
            : this.defaultCallbacks;

        this.targets.set(target, { callbacks, lastClickTime: 0 });

        this.inputSystem.attach(target, {
            onPointerDown: (e, t) => this.handlePointerDown(e, t),
            onPointerUp: (e, t) => this.handlePointerUp(e, t),
            onPointerUpOutside: (e, t) => this.handlePointerUpOutside(e, t),
            onPointerOver: (e, t) => this.handlePointerOver(e, t),
            onPointerOut: (e, t) => this.handlePointerOut(e, t),
            canInteract: (t) => this.canInteract(t),
        });
    }

    public detach(target: T): void {
        this.inputSystem.detach(target);
        this.targets.delete(target);
    }

    private getData(target: T): { callbacks: ClickCallbacks<T>; lastClickTime: number } | undefined {
        return this.targets.get(target);
    }

    private canInteract(target: T): boolean {
        const data = this.getData(target);
        if (!data) return false;
        if (data.callbacks.canClick && !data.callbacks.canClick(target)) return false;
        return true;
    }

    private handlePointerDown(event: FederatedPointerEvent, target: T): void {
        const data = this.getData(target);
        if (!data) return;

        data.callbacks.onPointerDown?.(target, event);
    }

    private handlePointerUp(event: FederatedPointerEvent, target: T): void {
        const data = this.getData(target);
        if (!data) return;

        data.callbacks.onPointerUp?.(target, event);

        const now = Date.now();
        const timeSinceLastClick = now - data.lastClickTime;

        if (timeSinceLastClick < this.config.doubleClickDelay) {
            data.callbacks.onDoubleClick?.(target, event);
            data.lastClickTime = 0;
        } else {
            data.callbacks.onClick?.(target, event);
            data.lastClickTime = now;
        }
    }

    private handlePointerUpOutside(event: FederatedPointerEvent, target: T): void {
        const data = this.getData(target);
        if (!data) return;

        data.callbacks.onPointerUpOutside?.(target, event);
    }

    private handlePointerOver(event: FederatedPointerEvent, target: T): void {
        const data = this.getData(target);
        if (!data) return;

        data.callbacks.onPointerOver?.(target, event);
    }

    private handlePointerOut(event: FederatedPointerEvent, target: T): void {
        const data = this.getData(target);
        if (!data) return;

        data.callbacks.onPointerOut?.(target, event);
    }

    public updateCallbacks(target: T, callbacks: Partial<ClickCallbacks<T>>): void {
        const data = this.getData(target);
        if (data) {
            data.callbacks = { ...data.callbacks, ...callbacks };
        }
    }

    public setCursor(cursor: string): void {
        this.config.cursor = cursor;
        this.inputSystem.setCursor(cursor);
    }

    public destroy(): void {
        this.inputSystem.destroy();
        this.targets.clear();
    }
}
