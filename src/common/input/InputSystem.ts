import { Container, FederatedPointerEvent } from "pixi.js";

export interface InputCallbacks<T = unknown> {
    onPointerDown?: (event: FederatedPointerEvent, target: T) => void;
    onPointerUp?: (event: FederatedPointerEvent, target: T) => void;
    onPointerUpOutside?: (event: FederatedPointerEvent, target: T) => void;
    onPointerOver?: (event: FederatedPointerEvent, target: T) => void;
    onPointerOut?: (event: FederatedPointerEvent, target: T) => void;
    onPointerMove?: (event: FederatedPointerEvent, target: T) => void;
    canInteract?: (target: T) => boolean;
}

export interface InputSystemConfig {
    cursor: string;
    useGlobalMove: boolean;
}

const DEFAULT_CONFIG: InputSystemConfig = {
    cursor: 'pointer',
    useGlobalMove: true,
};

export class InputSystem<T extends Container = Container> {
    private targets: Map<T, InputCallbacks<T>> = new Map();
    private activeTarget: T | null = null;
    private config: InputSystemConfig;

    constructor(config: Partial<InputSystemConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    public attach(target: T, callbacks: InputCallbacks<T>): void {
        this.targets.set(target, callbacks);

        target.eventMode = 'static';
        target.cursor = this.config.cursor;

        target.on('pointerdown', (e: FederatedPointerEvent) => this.handlePointerDown(e, target));
        target.on('pointerup', (e: FederatedPointerEvent) => this.handlePointerUp(e, target));
        target.on('pointerupoutside', (e: FederatedPointerEvent) => this.handlePointerUpOutside(e, target));
        target.on('pointerover', (e: FederatedPointerEvent) => this.handlePointerOver(e, target));
        target.on('pointerout', (e: FederatedPointerEvent) => this.handlePointerOut(e, target));

        if (this.config.useGlobalMove) {
            target.on('globalpointermove', (e: FederatedPointerEvent) => this.handlePointerMove(e, target));
            target.on('globalpointerup', (e: FederatedPointerEvent) => this.handleGlobalPointerUp(e, target));
        } else {
            target.on('pointermove', (e: FederatedPointerEvent) => this.handlePointerMove(e, target));
        }
    }

    public detach(target: T): void {
        target.off('pointerdown');
        target.off('pointerup');
        target.off('pointerupoutside');
        target.off('pointerover');
        target.off('pointerout');
        target.off('globalpointermove');
        target.off('globalpointerup');
        target.off('pointermove');
        this.targets.delete(target);

        if (this.activeTarget === target) {
            this.activeTarget = null;
        }
    }

    private getCallbacks(target: T): InputCallbacks<T> | undefined {
        return this.targets.get(target);
    }

    private canInteract(target: T): boolean {
        const callbacks = this.getCallbacks(target);
        if (!callbacks) return false;
        if (callbacks.canInteract && !callbacks.canInteract(target)) return false;
        return true;
    }

    private handlePointerDown(event: FederatedPointerEvent, target: T): void {
        if (!this.canInteract(target)) return;

        this.activeTarget = target;
        const callbacks = this.getCallbacks(target);
        callbacks?.onPointerDown?.(event, target);
    }

    private handlePointerUp(event: FederatedPointerEvent, target: T): void {
        if (!this.canInteract(target)) return;

        const callbacks = this.getCallbacks(target);
        callbacks?.onPointerUp?.(event, target);
    }

    private handlePointerUpOutside(event: FederatedPointerEvent, target: T): void {
        if (!this.canInteract(target)) return;

        const callbacks = this.getCallbacks(target);
        callbacks?.onPointerUpOutside?.(event, target);
    }

    private handlePointerOver(event: FederatedPointerEvent, target: T): void {
        if (!this.canInteract(target)) return;

        const callbacks = this.getCallbacks(target);
        callbacks?.onPointerOver?.(event, target);
    }

    private handlePointerOut(event: FederatedPointerEvent, target: T): void {
        if (!this.canInteract(target)) return;

        const callbacks = this.getCallbacks(target);
        callbacks?.onPointerOut?.(event, target);
    }

    private handlePointerMove(event: FederatedPointerEvent, target: T): void {
        if (this.config.useGlobalMove && this.activeTarget !== target) return;
        if (!this.canInteract(target)) return;

        const callbacks = this.getCallbacks(target);
        callbacks?.onPointerMove?.(event, target);
    }

    private handleGlobalPointerUp(_event: FederatedPointerEvent, target: T): void {
        if (this.activeTarget !== target) return;

        this.activeTarget = null;
    }

    public updateCallbacks(target: T, callbacks: Partial<InputCallbacks<T>>): void {
        const existing = this.getCallbacks(target);
        if (existing) {
            this.targets.set(target, { ...existing, ...callbacks });
        }
    }

    public setCursor(cursor: string): void {
        this.config.cursor = cursor;
        for (const target of this.targets.keys()) {
            target.cursor = cursor;
        }
    }

    public getActiveTarget(): T | null {
        return this.activeTarget;
    }

    public isActive(): boolean {
        return this.activeTarget !== null;
    }

    public destroy(): void {
        for (const target of this.targets.keys()) {
            this.detach(target);
        }
        this.targets.clear();
        this.activeTarget = null;
    }
}
