import {DIContainer} from "./DIContainer";
import {Application} from "pixi.js";

export class DI {
    private static _instance: DIContainer | null = null;
    private static _app: Application | null = null;

    static init(container: DIContainer, app: Application) {
        if (this._instance)
            console.warn("DI already initialized — reinitializing...");
        this._instance = container;
        this._app = app;
    }

    static get container(): DIContainer {
        if (!this._instance)
            throw new Error("DIContainer is not initialized. Call DI.init() first.");
        return this._instance;
    }

    static get app(): Application {
        if (!this._app)
            throw new Error("DIContainer is not initialized. Call DI.init() first.");
        return this._app;
    }
}