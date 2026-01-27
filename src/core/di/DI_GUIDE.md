# Dependency Injection (DI) Guide

## Огляд

Система Dependency Injection надихнута Unity Zenject та адаптована для TypeScript/PixiJS. Вона дозволяє керувати залежностями між класами та спрощує архітектуру додатку.

## Основні концепції

### DIContainer

Контейнер для зберігання та розв'язання залежностей.

```typescript
import { DIContainer } from "./core/di/DIContainer";

const container = new DIContainer();
```

## Способи реєстрації залежностей

### 1. Bind (Singleton за замовчуванням)

Реєструє конкретний екземпляр як singleton:

```typescript
const myService = new MyService();
container.bind("MyService", myService);

// Завжди повертає той самий екземпляр
const service1 = container.resolve<MyService>("MyService");
const service2 = container.resolve<MyService>("MyService");
console.log(service1 === service2); // true
```

### 2. BindFactory (Transient)

Створює новий екземпляр при кожному resolve:

```typescript
container.bindFactory("TempService", () => new TempService());

// Кожен раз створюється новий екземпляр
const service1 = container.resolve<TempService>("TempService");
const service2 = container.resolve<TempService>("TempService");
console.log(service1 === service2); // false
```

### 3. BindSingleton (Lazy Singleton)

Створює singleton тільки при першому resolve:

```typescript
container.bindSingleton("HeavyService", () => {
    console.log("Creating HeavyService...");
    return new HeavyService();
});

// HeavyService створюється тільки при першому виклику
const service = container.resolve<HeavyService>("HeavyService");
```

## Використання декоратора @Resolve

Декоратор `@Resolve` працює як Unity `[Inject]` - автоматично розв'язує залежності.

### Базове використання

```typescript
import { Resolve } from "./core/di/decorators";

class GameController {
    @Resolve("AudioService")
    private audioService!: AudioService;

    @Resolve("ScoreService")
    private scoreService!: ScoreService;

    init() {
        // Залежності автоматично розв'язуються при доступі
        this.audioService.playSound("start");
        this.scoreService.reset();
    }
}
```

### З MVC Pattern

```typescript
class PlayerModel extends Model {
    @Resolve("DataService")
    private dataService!: DataService;

    init() {
        const data = this.dataService.loadPlayerData();
        // ...
    }
}

class PlayerView extends View<PlayerModel> {
    @Resolve("TextureAtlas")
    private atlas!: TextureAtlas;

    create() {
        const sprite = new Sprite(this.atlas.getTexture("player"));
        this.addChild(sprite);
    }

    destroyView() {
        this.removeChildren();
    }
}
```

## Глобальний доступ через DI singleton

### Ініціалізація

```typescript
import { DI } from "./core/di/DI";
import { DIContainer } from "./core/di/DIContainer";
import { Application } from "pixi.js";

const container = new DIContainer();
const app = new Application();

DI.init(container, app);
```

### Доступ з будь-якого місця

```typescript
import { DI } from "./core/di/DI";

// Отримати контейнер
const service = DI.container.resolve<MyService>("MyService");

// Отримати PixiJS Application
const app = DI.app;
app.stage.addChild(mySprite);
```

## Installer Pattern

Використовуйте Installer для організації реєстрацій залежностей.

```typescript
import { Installer } from "./core/di/Installer";

export class ServicesInstaller extends Installer {
    install(): void {
        // Реєструємо сервіси
        this.container.bind("AudioService", new AudioService());
        this.container.bind("ScoreService", new ScoreService());

        // Реєструємо singleton з factory
        this.container.bindSingleton("DataService", () => {
            return new DataService(this.app);
        });

        // Реєструємо transient
        this.container.bindFactory("ParticleEffect", () => {
            return new ParticleEffect();
        });
    }
}

// Використання
const installer = new ServicesInstaller(container, app);
installer.install();
```

## Додаткові методи DIContainer

### has(token: string): boolean

Перевіряє чи зареєстрована залежність:

```typescript
if (container.has("MyService")) {
    const service = container.resolve("MyService");
}
```

### unbind(token: string): void

Видаляє залежність з контейнера:

```typescript
container.unbind("MyService");
```

### rebind(token: string, value: T): void

Замінює існуючу залежність:

```typescript
const oldService = new MyService("old");
container.bind("MyService", oldService);

const newService = new MyService("new");
container.rebind("MyService", newService); // Замінює старий
```

### clear(): void

Очищає всі залежності:

```typescript
container.clear();
```

### getTokens(): string[]

Отримує список всіх зареєстрованих токенів:

```typescript
const tokens = container.getTokens();
console.log(tokens); // ["AudioService", "ScoreService", ...]
```

## Приклад повної структури

```typescript
// 1. Створення сервісів
class AudioService {
    playSound(name: string) {
        console.log(`Playing: ${name}`);
    }
}

class ScoreService {
    private score = 0;

    addScore(points: number) {
        this.score += points;
    }

    getScore(): number {
        return this.score;
    }
}

// 2. Створення інсталера
class GameInstaller extends Installer {
    install(): void {
        // Сервіси як singleton
        this.container.bind("AudioService", new AudioService());
        this.container.bind("ScoreService", new ScoreService());
    }
}

// 3. Використання в контролері
class GameController {
    @Resolve("AudioService")
    private audio!: AudioService;

    @Resolve("ScoreService")
    private score!: ScoreService;

    startGame() {
        this.audio.playSound("game_start");
        this.score.addScore(0);
    }

    onEnemyDestroyed() {
        this.score.addScore(100);
        this.audio.playSound("explosion");
    }
}

// 4. Ініціалізація
const container = new DIContainer();
const app = new Application();
DI.init(container, app);

const installer = new GameInstaller(container, app);
installer.install();

const gameController = new GameController();
gameController.startGame();
```
