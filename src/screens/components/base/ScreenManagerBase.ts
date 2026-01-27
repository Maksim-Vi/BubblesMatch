import { Container } from "pixi.js";
import { Manager } from "src/core/mvc/Manager";

export abstract class ScreenManagerBase extends Manager {
    abstract loadScene(): void
    abstract hideScene(): void
}