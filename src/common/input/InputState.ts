export interface IInputState {
    active: boolean;
    startX: number;
    startY: number;
}

export function createDefaultInputState(): IInputState {
    return {
        active: false,
        startX: 0,
        startY: 0
    };
}
