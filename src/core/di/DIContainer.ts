/**
 * Type of binding - singleton or transient (factory)
 */
export enum BindingType {
    Singleton = "singleton",
    Transient = "transient"
}

/**
 * Interface for binding configuration
 */
interface IBinding<T = any> {
    value: T | (() => T);
    type: BindingType;
    instance?: T;
}

/**
 * Dependency Injection Container
 * Inspired by Unity's Zenject but adapted for TypeScript/PixiJS
 */
export class DIContainer {
    private bindings = new Map<string, IBinding>();

    /**
     * Binds a value to a token (singleton by default)
     * @param token - The token to bind
     * @param value - The value to bind
     */
    bind<T>(token: string, value: T): void {
        this.bindings.set(token, {
            value,
            type: BindingType.Singleton,
            instance: value
        });
    }

    /**
     * Binds a factory function to a token (creates new instance each time)
     * @param token - The token to bind
     * @param factory - Factory function that creates instances
     */
    bindFactory<T>(token: string, factory: () => T): void {
        this.bindings.set(token, {
            value: factory,
            type: BindingType.Transient
        });
    }

    /**
     * Binds a singleton (creates instance only once)
     * @param token - The token to bind
     * @param factory - Factory function that creates the singleton
     */
    bindSingleton<T>(token: string, factory: () => T): void {
        this.bindings.set(token, {
            value: factory,
            type: BindingType.Singleton
        });
    }

    /**
     * Resolves a dependency from the container
     * @param token - The token to resolve
     * @returns The resolved dependency
     */
    resolve<T>(token: string): T {
        const binding = this.bindings.get(token);
        if (!binding) {
            throw new Error(`Dependency "${token}" not found in DI container`);
        }

        // If it's a singleton and already instantiated, return cached instance
        if (binding.type === BindingType.Singleton && binding.instance !== undefined) {
            return binding.instance as T;
        }

        // If value is a factory function
        if (typeof binding.value === 'function') {
            const instance = (binding.value as () => T)();

            // Cache singleton instances
            if (binding.type === BindingType.Singleton) {
                binding.instance = instance;
            }

            return instance;
        }

        // Direct value binding
        return binding.value as T;
    }

    /**
     * Checks if a token is registered in the container
     * @param token - The token to check
     */
    has(token: string): boolean {
        return this.bindings.has(token);
    }

    /**
     * Unbinds a token from the container
     * @param token - The token to unbind
     */
    unbind(token: string): void {
        this.bindings.delete(token);
    }

    /**
     * Clears all bindings
     */
    clear(): void {
        this.bindings.clear();
    }

    /**
     * Gets all registered tokens
     */
    getTokens(): string[] {
        return Array.from(this.bindings.keys());
    }

    /**
     * Rebinds a token (removes old binding and creates new one)
     * @param token - The token to rebind
     * @param value - The new value
     */
    rebind<T>(token: string, value: T): void {
        this.unbind(token);
        this.bind(token, value);
    }
}