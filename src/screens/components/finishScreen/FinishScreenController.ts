import { Controller } from "src/core/mvc/Controller";
import { FinishScreenModel } from "./FinishScreenModel";
import { FinishScreenView } from "./FinishScreenView";
import gsap from "gsap";
import { FinishStore } from "src/store/FinishStore";
import { Resolve } from "src/core/di/decorators";

export class FinishScreenController extends Controller<FinishScreenModel, FinishScreenView> {

    @Resolve("FinishStore") private finishStore: FinishStore;

    init(): void {
        this.view.alpha = 0;
        this.view.visible = false;
    }

    showResult(): void {
        this.model.setResult(this.finishStore.finishData.isWin, this.finishStore.finishData.score);
        this.view.updateResult(this.finishStore.finishData.isWin, this.finishStore.finishData.score);
        this.show();
    }

    private show(): void {
        this.view.visible = true;
        gsap.to(this.view, {
            alpha: 1,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    hide(): void {
        gsap.to(this.view, {
            alpha: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.view.visible = false;
            }
        });
    }

    destroy(): void {
        this.view.destroyView();
        this.model.destroy();
    }
}
