import { DI } from "./DI";

/**
 * Decorator for automatic dependency injection (lazy resolution)
 * Similar to Unity's [Inject] but adapted for TypeScript/PixiJS
 *
 * Automatically resolves dependencies from DI container when property is accessed
 *
 * @param token - The dependency token to resolve from DI container
 *
 * @example
 * class MyController {
 *     @Resolve("MyService")
 *     private myService!: MyService;
 *
 *     init() {
 *         // myService is automatically resolved when accessed
 *         this.myService.doSomething();
 *     }
 * }
 */
export function Resolve(token: string) {
    return function (target: any, propertyKey: string | symbol) {
        // Create a hidden property to store the resolved value
        const hiddenKey = `__resolved_${String(propertyKey)}`;

        // Define a getter that resolves the dependency lazily
        Object.defineProperty(target, propertyKey, {
            get() {
                // Check if already resolved
                if (!this[hiddenKey]) {
                    try {
                        this[hiddenKey] = DI.container.resolve(token);
                    } catch (error) {
                        console.error(`Failed to resolve dependency "${token}" for property "${String(propertyKey)}":`, error);
                        throw error;
                    }
                }
                return this[hiddenKey];
            },
            set(value) {
                this[hiddenKey] = value;
            },
            enumerable: true,
            configurable: true
        });
    };
}

/**
 * Decorator for marking a class as injectable
 * Automatically registers the class in DI container when instantiated
 *
 * @param token - Optional token to use for registration. If not provided, class name will be used
 *
 * @example
 * @Injectable("MyService")
 * class MyService {
 *     // ...
 * }
 *
 * // Usage
 * const service = new MyService(); // Automatically registered in DI
 */
export function Injectable(token?: string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        const registrationToken = token || constructor.name;

        return class extends constructor {
            constructor(...args: any[]) {
                super(...args);
                // Auto-register in DI container
                try {
                    if (!DI.container.has(registrationToken)) {
                        DI.container.bind(registrationToken, this);
                    }
                } catch (error) {
                    console.warn(`Failed to auto-register "${registrationToken}":`, error);
                }
            }
        };
    };
}
