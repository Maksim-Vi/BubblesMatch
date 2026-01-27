import { Container, FederatedPointerEvent } from "pixi.js";

export interface ClickCallbacks<T> {
    onClick?: (target: T, event: FederatedPointerEvent) => void;
    onDoubleClick?: (target: T, event: FederatedPointerEvent) => void;
    canClick?: (target: T) => boolean;
}

export interface ClickSystemConfig {
    doubleClickDelay: number;
}

const DEFAULT_CONFIG: ClickSystemConfig = {
    doubleClickDelay: 300
};

export class ClickSystem<T extends Container = Container> {
    private targets: Map<T, { callbacks: ClickCallbacks<T>; lastClickTime: number }> = new Map();
    private config: ClickSystemConfig;

    constructor(callbacks: ClickCallbacks<T>, config: Partial<ClickSystemConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.defaultCallbacks = callbacks;
    }

    private defaultCallbacks: ClickCallbacks<T>;

    public attach(target: T): void {
        this.targets.set(target, { callbacks: this.defaultCallbacks, lastClickTime: 0 });

        target.eventMode = 'static';
        target.cursor = 'pointer';

        target.on('pointerdown', (e: FederatedPointerEvent) => this.handleClick(e, target));
    }

    public detach(target: T): void {
        target.off('pointerdown');
        this.targets.delete(target);
    }

    private handleClick(event: FederatedPointerEvent, target: T): void {
        const data = this.targets.get(target);
        if (!data) return;

        const { callbacks, lastClickTime } = data;

        if (callbacks.canClick && !callbacks.canClick(target)) {
            return;
        }

        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;

        if (timeSinceLastClick < this.config.doubleClickDelay) {
            callbacks.onDoubleClick?.(target, event);
            data.lastClickTime = 0;
        } else {
            callbacks.onClick?.(target, event);
            data.lastClickTime = now;
        }
    }

    public destroy(): void {
        for (const target of this.targets.keys()) {
            this.detach(target);
        }
        this.targets.clear();
    }
}
