import { Model } from "./Model";
import { View } from "./View";

export abstract class Controller<M extends Model, V extends View<Model>> {

    protected _model: Model;
    protected _view: View<Model>;

    constructor(model: M, view: V) {
        this._view = view;
        this._model = model;

        this.view.setModel(this._model);
    }

    abstract init(): void;
    abstract destroy(): void;

    get view(): V{
        return this._view as V;
    }

    get model(): M{
        return this._model as M;
    }
}