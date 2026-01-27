import { IInputState, createDefaultInputState } from "./InputState";

export interface ISwipeState<TExtra = {}> extends IInputState {
    extra: TExtra;
}

export function createSwipeState<TExtra = {}>(extra: TExtra): ISwipeState<TExtra> {
    return {
        ...createDefaultInputState(),
        extra
    };
}

export enum SwipeDirection {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
    NONE = 'none'
}

export interface SwipeVector {
    row: number;
    col: number;
}

export function getSwipeDirection(dx: number, dy: number, threshold: number): SwipeDirection {
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
        return SwipeDirection.NONE;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
    } else {
        return dy > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
    }
}

export function swipeDirectionToVector(direction: SwipeDirection): SwipeVector {
    switch (direction) {
        case SwipeDirection.UP: return { row: -1, col: 0 };
        case SwipeDirection.DOWN: return { row: 1, col: 0 };
        case SwipeDirection.LEFT: return { row: 0, col: -1 };
        case SwipeDirection.RIGHT: return { row: 0, col: 1 };
        default: return { row: 0, col: 0 };
    }
}
