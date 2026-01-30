import { Resolve } from "src/core/di/decorators";
import {Controller} from "../../../core/mvc/Controller";
import GameSceneModel from "./GameSceneModel";
import GameSceneView from "./GameSceneView";
import { BubbleGameManager } from "src/game/bubbleGame/BubbleGameManager";

export enum GameType {
    bubbleGame
}

export default class GameSceneController extends Controller<GameSceneModel, GameSceneView>{
    
    @Resolve("BubbleGameManager") private bubbleGameManager: BubbleGameManager;

    async init() {}

    public onStartGame(type: GameType) {
       switch(type) {
            case GameType.bubbleGame:{
                const gameView = this.bubbleGameManager?.startGame();
                if (gameView) {
                    this.view.addChild(gameView);
                }
                break;
            }
       }
    }
      
    showScreen(){
        this.view.show();
    }

    hideScreen(){
        this.view.hide();
    }

    destroy(): void {
        this.view.destroyView();
    }
}
