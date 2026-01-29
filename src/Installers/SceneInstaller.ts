import { Installer } from "src/core/di/Installer";
import { GameSceneManager } from "src/screens/components/gameScreen/GameSceneManager";
import { LoadingSceneManager } from "src/screens/components/loadScreen/LoadingSceneManager";
import { LobbySceneManager } from "src/screens/components/lobbyScreen/LobbySceneManager";
import { FinishScreenManager } from "src/screens/components/finishScreen";
import { SceneManager } from "src/screens/ScreenManager";

export class SceneInstaller extends Installer {

    install(): void {
        const sceneManager = new SceneManager(this.app, this.container);
        this.container.bind<SceneManager>("SceneManager", sceneManager);

        this.container.bind("LoadingSceneManager", new LoadingSceneManager(this.app));
        this.container.bind("LobbySceneManager", new LobbySceneManager(this.app));
        this.container.bind("GameSceneManager", new GameSceneManager(this.app));
        this.container.bind("FinishScreenManager", new FinishScreenManager(this.app));

        console.log("[SceneInstaller] Scenes registered and initialized");
    }
}
