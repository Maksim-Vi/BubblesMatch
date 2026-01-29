import { Controller } from "src/core/mvc/Controller";
import { LeftTableModel } from "./LeftTableModel";
import { LeftTableView } from "./LeftTableView";
import GlobalDispatcher, { IGDEvent } from "src/events/GlobalDispatcher";
import { SCORE_UPDATED, MOVES_UPDATED } from "src/events/TypesDispatch";

export interface IScoreUpdateData {
    score: number;
}

export interface IMovesUpdateData {
    movesLeft: number;
    maxMoves: number;
}

export class LeftTableController extends Controller<LeftTableModel, LeftTableView> {

    init(): void {
        GlobalDispatcher.add(SCORE_UPDATED, this.onScoreUpdated, this);
        GlobalDispatcher.add(MOVES_UPDATED, this.onMovesUpdated, this);
    }

    setInitialData(maxMoves: number): void {
        this.model.setInitialData(maxMoves);
        this.view.updateScore(0);
        this.view.updateMoves(maxMoves, maxMoves);
    }

    private onScoreUpdated = (event: IGDEvent<IScoreUpdateData>): void => {
        if (event.params) {
            this.model.score = event.params.score;
            this.view.updateScore(event.params.score);
        }
    };

    private onMovesUpdated = (event: IGDEvent<IMovesUpdateData>): void => {
        if (event.params) {
            this.model.movesLeft = event.params.movesLeft;
            this.view.updateMoves(event.params.movesLeft, event.params.maxMoves);
        }
    };

    destroy(): void {
        GlobalDispatcher.remove(SCORE_UPDATED, this.onScoreUpdated);
        GlobalDispatcher.remove(MOVES_UPDATED, this.onMovesUpdated);
        this.view.destroyView();
    }
}
