import { IGDEvent } from './../events/GlobalDispatcher';
import GlobalDispatcher from "src/events/GlobalDispatcher";
import { SHOW_FINISH_SCREEN } from "src/events/TypesDispatch";

export interface IFinishScreenData {
    isWin: boolean;
    score: number;
}

export class FinishStore {

    private _finishData: IFinishScreenData;

    constructor() {
        this.init();
    }

    init(): void {
        this.eventListeners();
    }
   
    private eventListeners(): void {
        GlobalDispatcher.add(SHOW_FINISH_SCREEN, this.updateFinishData, this);
    }

    updateFinishData(data: IGDEvent<IFinishScreenData>) {
        this._finishData = data.params
    }

    get finishData(): IFinishScreenData {
        return this._finishData;
    }

    destroy(): void {
        GlobalDispatcher.removeAllForContext(this);
    }

}
