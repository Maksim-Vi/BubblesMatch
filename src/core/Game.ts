import {Application, Container, Renderer} from "pixi.js"
import {Installer} from "./di/Installer";
import {RootInstaller} from "../RootInstaller";
import { DIContainer } from "./di/DIContainer";

import '../assetsLoader/AssetsLoader'

import {registerAssets} from "../assetsLoader/registerAssets";
import {DI} from "./di/DI";
import GlobalDispatcher from "../events/GlobalDispatcher";
import {ScreenHelper} from "./ScreenHelper";
import {gameConfig} from "../../game.config";
import { ScaleMode } from "./GameConfigInterface";

export interface IGameSize {
    width: number;
    height: number;
}

interface IBaseSize {
    width: number,
    height: number,
    ratio: number
}

// Use config values
export const LOGIC_WIDTH = gameConfig.logicWidth;
export const LOGIC_HEIGHT = gameConfig.logicHeight;

export default class Game {
    protected screenWidth: number;
    protected screenHeight: number;

    protected gameSize: IGameSize;
    protected baseSize: IBaseSize;

    protected container: HTMLElement | null = null;
    protected app: Application | null = null;
    protected rootInstaller: Installer | null = null;
    private diContainer: DIContainer;

    private uiStage: Container;
    private initPromise: Promise<void>;

    constructor() {
        this.screenWidth = LOGIC_WIDTH;
        this.screenHeight = LOGIC_HEIGHT;

        this.gameSize = {
            width: this.screenWidth,
            height: this.screenHeight
        };

        this.baseSize = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: this.screenWidth / this.screenHeight
        };

        this.initPromise = this.init();

        window.addEventListener("resize", this.onResize.bind(this));
    }

    protected async init() {

        registerAssets();

        const container = document.querySelector('#game-container') as HTMLElement;

        if (!container) {
            alert("Container not found!");
            return;
        }

        // Apply CSS styles from config
        this.applyContainerStyles(container);

        this.container = container;
        this.app = new Application();

        await this.app.init({
            width: Math.min(this.gameSize.width, LOGIC_WIDTH),
            height: Math.min(this.gameSize.height, LOGIC_HEIGHT),
            autoDensity: gameConfig.renderer.autoDensity,
            backgroundColor: gameConfig.renderer?.background.type === "color" ? Number(gameConfig.renderer.background.value) : undefined,
            antialias: gameConfig.renderer.antialias,
            autoStart: gameConfig.renderer.autoStart,
        });

        container.appendChild(this.app.canvas);

        // Initialize ScreenHelper first
        ScreenHelper.init(this.app, LOGIC_WIDTH, LOGIC_HEIGHT);

        // Call resize to set up transform parameters
        this.onResize();

        this.diContainer = new DIContainer();
        DI.init(this.diContainer, this.app);

        // Install root installer after ScreenHelper is ready
        this.rootInstaller = new RootInstaller(this.diContainer, this.app);
        this.rootInstaller.install();
    }

    /**
     * Apply CSS styles to game container from config
     */
    private applyContainerStyles(container: HTMLElement): void {
        const cfg = gameConfig.container;
        const bg = gameConfig.renderer.background;

        // Apply width and height if specified in config
        if (cfg.width) {
            container.style.width = cfg.width;
        }
        if (cfg.height) {
            container.style.height = cfg.height;
        }

        if (bg?.type === "image") {
            container.style.backgroundImage = `url(${bg.src})`;
            container.style.backgroundSize = "cover";
            container.style.backgroundPosition = "center";
            container.style.backgroundRepeat = "no-repeat";
        } else if (bg?.type === "color") {
            container.style.background = String(bg.value);
        } else {
            if (cfg.cssBackground?.type === "image") {
                container.style.backgroundImage = `url(${cfg.cssBackground.src})`;
                container.style.backgroundSize = "cover";
                container.style.backgroundPosition = "center";
                container.style.backgroundRepeat = "no-repeat";
            } else if (cfg.cssBackground?.type === "color") {
                container.style.backgroundImage = String(cfg.cssBackground.value);
            }
        }

        // Fullscreen mode
        if (cfg.fullscreen) {
            container.style.width = "100vw";
            container.style.height = "100vh";
            container.style.position = "fixed";
            container.style.top = "0";
            container.style.left = "0";
            container.style.margin = "0";
        }

        if (gameConfig.debug.verbose) {
            console.log("[Game] Container styles applied:", {
                width: cfg.width,
                height: cfg.height,
                fullscreen: cfg.fullscreen
            });
        }
    }

    protected onResize() {
        if (!this.container || !this.app) return;

        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        const width = gameContainer.clientWidth;
        const height = gameContainer.clientHeight;

        const resolution = Math.min(window.devicePixelRatio || 1, gameConfig.renderer.maxResolution);

        this.app.renderer.resolution = resolution;
        this.app.renderer.resize(width, height);

        // Calculate scale based on scale mode
        let scale: number;
        switch (gameConfig.scaleMode) {
            case ScaleMode.FIT:
                // Fit to screen maintaining aspect ratio (letterbox/pillarbox)
                scale = Math.min(width / LOGIC_WIDTH, height / LOGIC_HEIGHT);
                break;
            case ScaleMode.FILL:
                // Fill screen (may crop content)
                scale = Math.max(width / LOGIC_WIDTH, height / LOGIC_HEIGHT);
                break;
            case ScaleMode.STRETCH:
                // Stretch to fill (changes aspect ratio)
                this.app.stage.scale.set(width / LOGIC_WIDTH, height / LOGIC_HEIGHT);
                this.app.stage.position.set(0, 0);
                ScreenHelper.updateTransform(width / LOGIC_WIDTH, 0, 0, width, height, gameConfig.scaleMode);
                GlobalDispatcher.dispatch("RESIZE_APP");
                return;
            default:
                scale = Math.min(width / LOGIC_WIDTH, height / LOGIC_HEIGHT);
        }

        this.app.stage.scale.set(scale);

        // Center the stage by calculating offset
        const offsetX = (width - LOGIC_WIDTH * scale) / 2;
        const offsetY = (height - LOGIC_HEIGHT * scale) / 2;
        this.app.stage.position.set(offsetX, offsetY);

        // Update ScreenHelper with current scale, offset, screen size and scale mode
        ScreenHelper.updateTransform(scale, offsetX, offsetY, width, height, gameConfig.scaleMode);

        if (gameConfig.debug.verbose) {
            console.log("[Game] Resize:", {
                containerSize: { width, height },
                logicSize: { width: LOGIC_WIDTH, height: LOGIC_HEIGHT },
                scale,
                offset: { x: offsetX, y: offsetY },
                resolution
            });
        }

        GlobalDispatcher.dispatch("RESIZE_APP");
    }

    async play() {
        await this.initPromise;
        this.app?.ticker.start();
    }

    async pause() {
        await this.initPromise;
        this.app?.ticker.stop();
    }

    public get application() {
        return this.app;
    }
}