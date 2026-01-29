import { Installer } from "src/core/di/Installer";
import { BubbleGameManager } from "src/game/bubbleGame/BubbleGameManager";
import { GameManager } from "src/game/GameManager";
import { FinishStore } from "src/store/FinishStore";
import { GameStore } from "src/store/GameStore";
import { LevelStore } from "src/store/LevelStore";

export class GameInstaller extends Installer {
    
    install(): void {

        this.container.bind<LevelStore>("LevelStore", new LevelStore());
        this.container.bind<FinishStore>("FinishStore", new FinishStore());
        this.container.bind<GameStore>("GameStore", new GameStore());

        this.container.bind<GameManager>("GameManager", new GameManager());
        this.container.bind<BubbleGameManager>("BubbleGameManager", new BubbleGameManager());

        console.log("[GameInstaller] Game stores registered");
    }
}
