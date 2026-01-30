import { LevelStore } from "src/store/LevelStore";
import { BubbleController } from "./BubbleController";
import { BubbleModel } from "./BubbleModel";
import { BubbleView } from "./BubbleView";
import { Resolve } from "src/core/di/decorators";
import { GameStore } from "src/store/GameStore";

export class BubbleGameManager {
    
    @Resolve("LevelStore") private levelStore: LevelStore;
    @Resolve("GameStore") private gameStore: GameStore;

    private bubbleController: BubbleController;
    private bubbleModel: BubbleModel;
    private bubbleView: BubbleView;

    
    constructor() {
        this.init();
    }

    init() {}

    startGame(): BubbleView {
        this.bubbleModel = new BubbleModel();
        this.bubbleModel.initLevel(this.levelStore.getLevel(this.gameStore.currentLevel || 0));

        this.bubbleView = new BubbleView();
        this.bubbleController = new BubbleController(this.bubbleModel, this.bubbleView);
        this.bubbleController.init();

        return this.bubbleView;
    }
}