import { Installer } from "./core/di/Installer";
import { DebugHelper } from "./debug/DebugHelper";
import GlobalDispatcher from "./events/GlobalDispatcher";
import { gameConfig } from "../game.config";
import { SceneInstaller } from "./Installers/SceneInstaller";
import { GameInstaller } from "./Installers/GameInstaller";

export class RootInstaller extends Installer {
      install(): void {

        const sceneInstaller = new SceneInstaller(this.container, this.app);
        sceneInstaller.install();
        this.container.bind<SceneInstaller>("SceneInstaller", sceneInstaller);

        const gameInstaller = new GameInstaller(this.container, this.app);
        gameInstaller.install();
        this.container.bind<GameInstaller>("GameInstaller", gameInstaller);

       
        this.extra();
    }

    extra(): void{
        if (gameConfig.debug.showFPS) {
            console.log("[Debug] FPS display enabled");
        }

        if (gameConfig.debug.verbose) {
            console.log("[RootInstaller] Initialized with config:", {
                logicSize: `${gameConfig.logicWidth}x${gameConfig.logicHeight}`,
                orientation: gameConfig.orientation,
                scaleMode: gameConfig.scaleMode
            });
        }

        GlobalDispatcher.add("RESIZE_APP", () => {
            if (gameConfig.debug.showCoordinatePoints) {
                DebugHelper.showDebugPoints();
            }
        });
    }
}