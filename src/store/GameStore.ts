import GlobalDispatcher from "src/events/GlobalDispatcher";


export class GameStore {

    constructor() {
        this.init();
    }

    init(): void {
        this.eventListeners();
    }
   
    private eventListeners(): void {
       
    }

    destroy(): void {
        GlobalDispatcher.removeAllForContext(this);
    }

}
