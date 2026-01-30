import { Container, FederatedPointerEvent } from "pixi.js";
import { InputSystem } from "./InputSystem";
import {
    ISwipeState,
    createSwipeState,
    SwipeDirection,
    SwipeVector,
    getSwipeDirection,
    swipeDirectionToVector
} from "./SwipeState";

export interface SwipeCallbacks<T, TExtra = {}> {
    onSwipeStart?: (target: T, state: ISwipeState<TExtra>) => void;
    onSwipe?: (target: T, direction: SwipeDirection, vector: SwipeVector, state: ISwipeState<TExtra>) => void;
    onSwipeEnd?: (target: T, state: ISwipeState<TExtra>) => void;
    getExtra?: (target: T) => TExtra;
    canSwipe?: (target: T) => boolean;
}

export interface SwipeSystemConfig {
    threshold: number;
    cursor: string;
}

const DEFAULT_CONFIG: SwipeSystemConfig = {
    threshold: 30,
    cursor: 'pointer',
};

export class SwipeSystem<T extends Container = Container, TExtra = {}> {

    private inputSystem: InputSystem<T>;
    private state: ISwipeState<TExtra> | null = null;
    private callbacks: SwipeCallbacks<T, TExtra>;
    private config: SwipeSystemConfig;
    private swipeHandled: boolean = false;

    constructor(callbacks: SwipeCallbacks<T, TExtra>, config: Partial<SwipeSystemConfig> = {}) {
        this.callbacks = callbacks;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.inputSystem = new InputSystem<T>({
            cursor: this.config.cursor,
            useGlobalMove: true,
        });
    }

    public attach(target: T): void {
        this.inputSystem.attach(target, {
            onPointerDown: (e, t) => this.handleStart(e, t),
            onPointerMove: (e, t) => this.handleMove(e, t),
            onPointerUp: (_, t) => this.handleEnd(t),
            onPointerUpOutside: (_, t) => this.handleEnd(t),
            canInteract: (t) => !this.callbacks.canSwipe || this.callbacks.canSwipe(t),
        });
    }

    public detach(target: T): void {
        this.inputSystem.detach(target);
    }

    private handleStart(event: FederatedPointerEvent, target: T): void {
        const extra = this.callbacks.getExtra?.(target) ?? {} as TExtra;
        this.state = createSwipeState(extra);
        this.state.active = true;
        this.state.startX = event.globalX;
        this.state.startY = event.globalY;
        this.swipeHandled = false;

        this.callbacks.onSwipeStart?.(target, this.state);
    }

    private handleMove(event: FederatedPointerEvent, target: T): void {
        if (!this.state?.active || this.swipeHandled) return;

        const dx = event.globalX - this.state.startX;
        const dy = event.globalY - this.state.startY;

        const direction = getSwipeDirection(dx, dy, this.config.threshold);

        if (direction !== SwipeDirection.NONE) {
            const vector = swipeDirectionToVector(direction);
            this.callbacks.onSwipe?.(target, direction, vector, this.state);
            this.swipeHandled = true;
        }
    }

    private handleEnd(target: T): void {
        if (this.state) {
            this.callbacks.onSwipeEnd?.(target, this.state);
        }
        this.resetState();
    }

    private resetState(): void {
        this.state = null;
        this.swipeHandled = false;
    }

    public getState(): ISwipeState<TExtra> | null {
        return this.state;
    }

    public isActive(): boolean {
        return this.state?.active ?? false;
    }

    public cancel(): void {
        this.resetState();
    }

    public setCursor(cursor: string): void {
        this.config.cursor = cursor;
        this.inputSystem.setCursor(cursor);
    }

    public destroy(): void {
        this.inputSystem.destroy();
        this.resetState();
    }
}
