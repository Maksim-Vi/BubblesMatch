import { Application } from "pixi.js";
import { ScreenManagerBase } from "../base/ScreenManagerBase";
import { FinishScreenController } from "./FinishScreenController";
import { FinishScreenView } from "./FinishScreenView";
import { FinishScreenModel } from "./FinishScreenModel";

export class FinishScreenManager extends ScreenManagerBase {

    private finishScreenController: FinishScreenController | null = null;

    constructor(app: Application) {
        super(app);
        this.init();
    }

    override init() {
        // Manager initialized
    }

    private createController(): void {
        this.finishScreenController = new FinishScreenController(
            new FinishScreenModel(),
            new FinishScreenView()
        );
        this.finishScreenController.init();
        this.addView(this.finishScreenController.view);
    }

    public loadScene(): void {
        if (!this.finishScreenController) {
            this.createController();
        }

        this.showResult();
    }

    public showResult(): void {
        this.finishScreenController?.showResult();
    }

    public hideScene(): void {
        this.finishScreenController?.hide();
    }

    override destroy(): void {
        this.finishScreenController?.destroy();
        this.finishScreenController = null;
    }
}
