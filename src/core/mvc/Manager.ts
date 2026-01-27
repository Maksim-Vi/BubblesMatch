import {Application, Container} from "pixi.js";

export class Manager {
    protected app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    protected init(){

    }

    protected addView(view: Container) {
        this.app.stage.addChild(view);
    }

    protected removeView(view: Container) {
        this.app.stage.removeChild(view);
    }

    protected clear() {
        this.app.stage.removeChildren();
    }

    public destroy() {
        this.app.stage.destroy({ children: true });
    }
}