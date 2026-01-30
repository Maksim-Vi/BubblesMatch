import { Container } from "pixi.js";
import { Model } from "./Model";

/**
 * Base View class for MVC pattern
 * Handles the visual representation using PixiJS Container
 * @template M - The Model type this view is associated with
 */
export abstract class View<M extends Model> extends Container {
    protected _model!: M;

    /**
     * Sets the model for this view
     * @param model - The model to associate with this view
     */
    public setModel(model: M): void {
        this._model = model;
    }

    /**
     * Gets the current model
     */
    public get model(): M {
        return this._model;
    }

    /**
     * Creates and initializes the view
     * Override this to build your visual elements
     */
    abstract create(): void;

    /**
     * Destroys the view and cleans up resources
     * Override this to clean up your visual elements
     */
    public destroyView(): void
    {
        this.destroy();
    };
}