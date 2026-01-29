import { Controller } from "src/core/mvc/Controller";
import { FinishScreenModel } from "./FinishScreenModel";
import { FinishScreenView } from "./FinishScreenView";
import GlobalDispatcher, { IGDEvent } from "src/events/GlobalDispatcher";
import { SHOW_FINISH_SCREEN } from "src/events/TypesDispatch";
import gsap from "gsap";

export interface IFinishScreenData {
    isWin: boolean;
    score: number;
}

export class FinishScreenController extends Controller<FinishScreenModel, FinishScreenView> {

    init(): void {
        GlobalDispatcher.add(SHOW_FINISH_SCREEN, this.onShowFinishScreen, this);
        this.view.alpha = 0;
        this.view.visible = false;
    }

    private onShowFinishScreen = (event: IGDEvent<IFinishScreenData>): void => {
        if (event.params) {
            this.showResult(event.params.isWin, event.params.score);
        }
    };

    showResult(isWin: boolean, score: number): void {
        this.model.setResult(isWin, score);
        this.view.updateResult(isWin, score);
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
        GlobalDispatcher.remove(SHOW_FINISH_SCREEN, this.onShowFinishScreen);
        this.view.destroyView();
    }
}
