interface IListener {
    event: string
    callback: Function
    context: Object
    priority: number
    once: boolean
}

interface IEventObject <Type extends Object = Object> {
    event: string
    params?: Type
    callback?: Function
}

interface IListeners {
    [keys: string]: IListener[]
}

export interface IGDEvent <Type = null> {
    type: string,
    params?: Type,
    callback?: Function
}

export default new class GlobalDispatcher {

    private listeners: IListeners;
    private eventsStack: IEventObject[];
    private inProgress: boolean;

    constructor() {
        this.listeners = {};
        this.eventsStack = [];
        this.inProgress = false;
    }

    public add($event: string, $callback: Function, $context?: Object, $priority: number = 1) {
        let listener: IListener = {event: $event, callback: $callback, context: $context, priority: $priority, once: false};
        this.addToListeners(listener);
    }

    public addOnce($event: string, $callback: Function, $context: Object, $priority: number = 1) {
        let listener: IListener = {event: $event, callback: $callback, context: $context, priority: $priority, once: true};
        this.addToListeners(listener);
    }

    public dispatch<ParamsType>($event: string, $params?: ParamsType | Object, $callback: Function = null, $context: Object = null) {
        const callback = $callback ? $context ? $callback.bind($context) : $callback : null;
        this.eventsStack.push({event: $event, params: $params, callback: callback});
        if (!this.inProgress) {
            this.executeFromStack();
        }
    }

    public remove($event: string, $callback: Function) {
        this.listeners[$event] = this.listeners[$event]?.filter((listener) => {
            return !(
                listener.event === $event &&
                listener.callback === $callback
            )
        });
    }

    public removeAll($event: string) {
        this.listeners[$event] = [];
    }

    public removeAllForContext($context: Object) {
        for (let listener in this.listeners) {
            if (this.listeners.hasOwnProperty(listener)) {
                this.listeners[listener] = this.listeners[listener].filter((listener) => {
                    return !(listener.context === $context);
                })
            }
        }
    }

    private addToListeners($listener: IListener) {
        if (!this.listeners[$listener.event]) {
            this.listeners[$listener.event] = [];
        }
        this.listeners[$listener.event].push($listener);
        this.listeners[$listener.event].sort((a: IListener, b: IListener) => {
            return b.priority - a.priority;
        });
    }

    private executeFromStack() {
        this.inProgress = true;
        let object: IEventObject = null;
        while (this.eventsStack.length > 0) {
            object = this.eventsStack.shift();
            this.execute<typeof object.params>(object.event, object.params, object.callback);
            object = null;
        }
        this.inProgress = false;
    }

    private execute<ParamsType>($event: string, $params: ParamsType, $callback: Function) {
        if (this.listeners.hasOwnProperty($event)) {
            for (let i = 0; i < this.listeners[$event].length; i++) {
                const listener = this.listeners[$event][i];
                const param: IGDEvent<ParamsType> = {type: $event, params: $params, callback: $callback};
                if (listener.context) {
                    listener.callback.call(listener.context, param);
                } else {
                    listener.callback(param);
                }
                if (listener.once) {
                    this.listeners[$event].splice(i, 1);
                    i--;
                }
            }
        }
    }
}