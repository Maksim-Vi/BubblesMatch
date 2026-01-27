import { Installer } from "src/core/di/Installer";
import { BubbleGameManager } from "src/game/bubbleGame/BubbleGameManager";
import { GameManager } from "src/game/GameManager";
import { LevelStore } from "src/store/LevelStore";

export class GameInstaller extends Installer {
    
    install(): void {

        this.container.bind<LevelStore>("LevelStore", new LevelStore());
        this.container.bind<GameManager>("GameManager", new GameManager());
        this.container.bind<BubbleGameManager>("BubbleGameManager", new BubbleGameManager());

        console.log("[GameInstaller] Game stores registered");
    }
}
