import { Container, FederatedPointerEvent } from "pixi.js";

export interface InputCallbacks<T = unknown> {
    onStart?: (event: FederatedPointerEvent, target: T) => void;
    onMove?: (event: FederatedPointerEvent, target: T) => void;
    onEnd?: (event: FederatedPointerEvent | null, target: T) => void;
}

export class InputSystem<T extends Container = Container> {
    private targets: Map<T, InputCallbacks<T>> = new Map();
    private activeTarget: T | null = null;

    public attach(target: T, callbacks: InputCallbacks<T>): void {
        this.targets.set(target, callbacks);

        target.eventMode = 'static';

        target.on('pointerdown', (e: FederatedPointerEvent) => {
            this.activeTarget = target;
            callbacks.onStart?.(e, target);
        });

        target.on('globalpointermove', (e: FederatedPointerEvent) => {
            if (this.activeTarget !== target) return;
            callbacks.onMove?.(e, target);
        });

        target.on('globalpointerup', (e: FederatedPointerEvent) => {
            if (this.activeTarget !== target) return;
            callbacks.onEnd?.(e, target);
            this.activeTarget = null;
        });
    }

    public detach(target: T): void {
        target.off('pointerdown');
        target.off('globalpointermove');
        target.off('globalpointerup');
        this.targets.delete(target);

        if (this.activeTarget === target) {
            this.activeTarget = null;
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
