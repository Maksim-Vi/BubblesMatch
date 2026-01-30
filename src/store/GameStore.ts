import GlobalDispatcher, { IGDEvent } from "src/events/GlobalDispatcher";
import { GAME_OVER, GAME_WIN, MOVES_UPDATED, SCORE_UPDATED } from "src/events/TypesDispatch";
import { IObstacleConfig } from "./LevelStore";

const STORAGE_KEY = 'bubbleMatch_progress';

export interface IGameProgress {
    currentLevel: number;
    unlockedLevel: number;
}

export class GameStore {
    private _progress: IGameProgress;
    
    private currentObstacle: IObstacleConfig; 
    private updatedDataObstacle: IObstacleConfig = { collectScores: 0, maxMoves: 0, collectColors: null }; 

    constructor() {
        this._progress = this.loadProgress();
        this.init();
    }

    init(): void {
        this.eventListeners();
    }

    private eventListeners(): void {
        GlobalDispatcher.add(GAME_OVER, this.onFinishGame, this);
        GlobalDispatcher.add(GAME_WIN, this.onLevelComplete, this);
        GlobalDispatcher.add(SCORE_UPDATED, this.setObstacleScoresData, this);

        GlobalDispatcher.add(MOVES_UPDATED, this.setObstacleMovesData, this);
    }

    public setCurrentObstacleData(currentObstacle: IObstacleConfig){
        // Store a copy to not corrupt original level data
        this.currentObstacle = { ...currentObstacle };
        // Reset updated data for the new game
        this.updatedDataObstacle = {
            collectScores: 0,
            maxMoves: currentObstacle.maxMoves,
            collectColors: null
        };
    }

    private setObstacleScoresData(event: IGDEvent<{ score: number }>) {
        if (event.params) {
            this.updatedDataObstacle.collectScores = event.params.score;
        }
    }

    private setObstacleMovesData(event: IGDEvent<{ movesLeft: number, maxMoves: number }>){
        if (event.params) {
            this.updatedDataObstacle.maxMoves = event.params.movesLeft;
        }
    }

    public checkIsLoseObstacle(): boolean {
        // Check if player hasn't collected enough score with remaining moves
        return this.updatedDataObstacle.collectScores < this.currentObstacle.collectScores;
    }

    private clearObstacleData(){
        this.currentObstacle = { collectScores: 0, maxMoves: 0, collectColors: null };
        this.updatedDataObstacle = { collectScores: 0, maxMoves: 0, collectColors: null };
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

        this.onFinishGame();
    }

    private onFinishGame() {
        this.clearObstacleData();
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
