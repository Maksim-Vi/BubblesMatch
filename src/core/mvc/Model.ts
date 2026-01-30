/**
 * Base Model class for MVC pattern
 * Holds the data and business logic
 */
export abstract class Model {
    /**
     * Initialize the model
     * Override this method to set up initial state
     */
    init?(): void;

    /**
     * Clean up the model
     * Override this method to clean up resources
     */
    destroy?(): void {
        
    };
}