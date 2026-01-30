import GlobalDispatcher from "src/events/GlobalDispatcher";
import { GAME_WIN } from "src/events/TypesDispatch";

const STORAGE_KEY = 'bubbleMatch_progress';

export interface IGameProgress {
    currentLevel: number;
    unlockedLevel: number;
}

export class GameStore {
    private _progress: IGameProgress;

    constructor() {
        this._progress = this.loadProgress();
        this.init();
    }

    init(): void {
        this.eventListeners();
    }

    private eventListeners(): void {
        GlobalDispatcher.add(GAME_WIN, this.onLevelComplete, this);
    }

    private loadProgress(): IGameProgress {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load progress from localStorage:', e);
        }
        return { currentLevel: 1, unlockedLevel: 1 };
    }

    private saveProgress(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._progress));
        } catch (e) {
            console.warn('Failed to save progress to localStorage:', e);
        }
    }

    private onLevelComplete = (): void => {
        if (this._progress.currentLevel >= this._progress.unlockedLevel) {
            this._progress.unlockedLevel = Math.min(this._progress.currentLevel + 1, 10);
            this.saveProgress();
        }
    }

    get currentLevel(): number {
        return this._progress.currentLevel;
    }

    set currentLevel(level: number) {
        this._progress.currentLevel = level;
        this.saveProgress();
    }

    get unlockedLevel(): number {
        return this._progress.unlockedLevel;
    }

    isLevelUnlocked(levelId: number): boolean {
        return levelId <= this._progress.unlockedLevel;
    }

    destroy(): void {
        GlobalDispatcher.removeAllForContext(this);
    }
}
