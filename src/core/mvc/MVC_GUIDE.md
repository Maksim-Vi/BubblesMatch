# MVC Pattern Guide для PixiJS

## Огляд

Система MVC (Model-View-Controller) адаптована для PixiJS та інтегрована з DI контейнером.

## Структура MVC

```
┌──────────────┐
│  Controller  │  - Координує Model та View
│              │  - Обробляє бізнес-логіку
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
┌──▼───┐  ┌─▼────┐
│ Model│  │ View │
│      │  │      │
│ Data │  │ UI   │
└──────┘  └──────┘
```

## Model

Model містить дані та бізнес-логіку.

### Базове використання

```typescript
import { Model } from "./core/mvc/Model";

export class PlayerModel extends Model {
    private health: number = 100;
    private score: number = 0;
    private name: string = "";

    init() {
        // Ініціалізація моделі
        this.loadData();
    }

    // Getters/Setters
    getHealth(): number {
        return this.health;
    }

    setHealth(value: number): void {
        this.health = Math.max(0, Math.min(100, value));
    }

    addScore(points: number): void {
        this.score += points;
    }

    getScore(): number {
        return this.score;
    }

    // Бізнес-логіка
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            this.onDeath();
        }
    }

    private onDeath(): void {
        console.log("Player died!");
    }

    private loadData(): void {
        // Завантаження даних з localStorage або API
        const saved = localStorage.getItem("playerData");
        if (saved) {
            const data = JSON.parse(saved);
            this.name = data.name;
            this.score = data.score;
        }
    }

    destroy() {
        // Очищення ресурсів
        this.saveData();
    }

    private saveData(): void {
        localStorage.setItem("playerData", JSON.stringify({
            name: this.name,
            score: this.score
        }));
    }
}
```

### Model з DI

```typescript
import { Model } from "./core/mvc/Model";
import { Resolve } from "../di/decorators";

export class GameModel extends Model {
    @Resolve("DataService")
    private dataService!: DataService;

    private level: number = 1;
    private coins: number = 0;

    init() {
        // Використання DI сервісу
        const savedData = this.dataService.load("game");
        if (savedData) {
            this.level = savedData.level;
            this.coins = savedData.coins;
        }
    }

    nextLevel(): void {
        this.level++;
        this.dataService.save("game", {
            level: this.level,
            coins: this.coins
        });
    }

    addCoins(amount: number): void {
        this.coins += amount;
    }
}
```

## View

View відповідає за візуальне представлення (extends PixiJS Container).

### Базове використання

```typescript
import { View } from "./core/mvc/View";
import { Sprite, Text } from "pixi.js";
import { PlayerModel } from "./PlayerModel";

export class PlayerView extends View<PlayerModel> {
    private sprite!: Sprite;
    private healthBar!: Graphics;
    private scoreText!: Text;

    create(): void {
        // Створення візуальних елементів
        this.sprite = Sprite.from("player");
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        // Health bar
        this.healthBar = new Graphics();
        this.healthBar.position.set(-50, -60);
        this.addChild(this.healthBar);

        // Score text
        this.scoreText = new Text({
            text: "0",
            style: { fontSize: 24, fill: 0xFFFFFF }
        });
        this.scoreText.anchor.set(0.5);
        this.scoreText.position.set(0, -80);
        this.addChild(this.scoreText);

        // Початкове оновлення
        this.updateHealthBar();
        this.updateScore();
    }

    // Оновлення візуальних елементів на основі моделі
    updateHealthBar(): void {
        const health = this._model.getHealth();
        const maxHealth = 100;

        this.healthBar.clear();

        // Background
        this.healthBar.rect(0, 0, 100, 10);
        this.healthBar.fill(0x333333);

        // Health
        this.healthBar.rect(0, 0, (health / maxHealth) * 100, 10);
        this.healthBar.fill(0x00FF00);
    }

    updateScore(): void {
        this.scoreText.text = `Score: ${this._model.getScore()}`;
    }

    destroyView(): void {
        // Очищення візуальних елементів
        this.removeChildren();
        this.sprite.destroy();
        this.healthBar.destroy();
        this.scoreText.destroy();
    }
}
```

### View з анімаціями

```typescript
import { View } from "./core/mvc/View";
import gsap from "gsap";

export class EnemyView extends View<EnemyModel> {
    private sprite!: Sprite;

    create(): void {
        this.sprite = Sprite.from("enemy");
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        // Стартова анімація
        this.playIdleAnimation();
    }

    playIdleAnimation(): void {
        gsap.to(this.sprite, {
            y: "+=10",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }

    playHitAnimation(): void {
        gsap.fromTo(this.sprite,
            { alpha: 1 },
            {
                alpha: 0.5,
                duration: 0.1,
                yoyo: true,
                repeat: 3
            }
        );
    }

    playDeathAnimation(callback: () => void): void {
        gsap.to(this.sprite, {
            alpha: 0,
            scale: 0,
            rotation: Math.PI * 2,
            duration: 0.5,
            onComplete: callback
        });
    }

    destroyView(): void {
        gsap.killTweensOf(this.sprite);
        this.removeChildren();
    }
}
```

## Controller

Controller з'єднує Model та View, обробляє логіку взаємодії.

### Базове використання

```typescript
import { Controller } from "./core/mvc/Controller";
import { PlayerModel } from "./PlayerModel";
import { PlayerView } from "./PlayerView";

export class PlayerController extends Controller<PlayerModel, PlayerView> {
    constructor() {
        const model = new PlayerModel();
        const view = new PlayerView();
        super(model, view);
    }

    init(): void {
        // Ініціалізація моделі
        this.model.init?.();

        // Створення view
        this.view.create();

        // Налаштування інтерактивності
        this.setupInteractions();

        // Початкове оновлення view
        this.updateView();
    }

    private setupInteractions(): void {
        this.view.eventMode = 'static';
        this.view.on('pointerdown', () => this.onPlayerClick());
    }

    private onPlayerClick(): void {
        console.log("Player clicked!");
        this.model.addScore(10);
        this.updateView();
    }

    // Публічні методи для зовнішньої взаємодії
    takeDamage(amount: number): void {
        this.model.takeDamage(amount);
        this.updateView();
        this.view.playHitAnimation();
    }

    heal(amount: number): void {
        const currentHealth = this.model.getHealth();
        this.model.setHealth(currentHealth + amount);
        this.updateView();
    }

    private updateView(): void {
        this.view.updateHealthBar();
        this.view.updateScore();
    }

    destroy(): void {
        this.model.destroy?.();
        this.view.destroyView();
        this.view.destroy();
    }
}
```

### Controller з DI

```typescript
import { Controller } from "./core/mvc/Controller";
import { Resolve } from "../di/decorators";

export class GameController extends Controller<GameModel, GameView> {
    @Resolve("AudioService")
    private audio!: AudioService;

    @Resolve("InputService")
    private input!: InputService;

    constructor() {
        super(new GameModel(), new GameView());
    }

    init(): void {
        this.model.init?.();
        this.view.create();

        // Підписка на події input
        this.input.on("keydown", (key: string) => this.onKeyDown(key));

        // Запуск ігрової логіки
        this.startGameLoop();
    }

    private onKeyDown(key: string): void {
        switch (key) {
            case "Space":
                this.jump();
                break;
            case "Escape":
                this.pause();
                break;
        }
    }

    private jump(): void {
        this.audio.playSound("jump");
        this.view.playJumpAnimation();
    }

    private pause(): void {
        this.audio.playSound("pause");
        // Pause logic...
    }

    private startGameLoop(): void {
        DI.app.ticker.add(this.update, this);
    }

    private update(delta: number): void {
        // Оновлення логіки гри
        this.model.update(delta);
        this.view.updatePosition(this.model.getPosition());
    }

    destroy(): void {
        DI.app.ticker.remove(this.update, this);
        this.input.off("keydown");
        this.model.destroy?.();
        this.view.destroyView();
    }
}
```

## Manager

Manager керує множиною контролерів та view.

```typescript
import { Manager } from "./core/mvc/Manager";
import { PlayerController } from "./controllers/PlayerController";
import { EnemyController } from "./controllers/EnemyController";

export class GameManager extends Manager {
    private playerController!: PlayerController;
    private enemies: EnemyController[] = [];

    protected init(): void {
        // Створення гравця
        this.playerController = new PlayerController();
        this.playerController.init();
        this.addView(this.playerController.view);

        // Створення ворогів
        this.spawnEnemies(5);
    }

    private spawnEnemies(count: number): void {
        for (let i = 0; i < count; i++) {
            const enemy = new EnemyController();
            enemy.init();
            enemy.view.position.set(
                Math.random() * 800,
                Math.random() * 600
            );
            this.enemies.push(enemy);
            this.addView(enemy.view);
        }
    }

    public startGame(): void {
        this.app.ticker.add(this.update, this);
    }

    private update(): void {
        // Перевірка колізій
        this.checkCollisions();
    }

    private checkCollisions(): void {
        const playerBounds = this.playerController.view.getBounds();

        for (const enemy of this.enemies) {
            const enemyBounds = enemy.view.getBounds();

            if (this.intersects(playerBounds, enemyBounds)) {
                this.onCollision(enemy);
            }
        }
    }

    private intersects(a: any, b: any): boolean {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    private onCollision(enemy: EnemyController): void {
        // Гравець отримує урон
        this.playerController.takeDamage(10);

        // Ворог знищується
        this.removeEnemy(enemy);
    }

    private removeEnemy(enemy: EnemyController): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.removeView(enemy.view);
            enemy.destroy();
        }
    }

    public destroy(): void {
        this.app.ticker.remove(this.update, this);
        this.playerController.destroy();
        this.enemies.forEach(e => e.destroy());
        this.enemies = [];
        super.destroy();
    }
}
```

## Повний приклад з DI

```typescript
// 1. Models
class PlayerModel extends Model {
    private health = 100;
    private position = { x: 400, y: 300 };

    getHealth() { return this.health; }
    setHealth(v: number) { this.health = v; }
    getPosition() { return this.position; }
    move(dx: number, dy: number) {
        this.position.x += dx;
        this.position.y += dy;
    }
}

// 2. Views
class PlayerView extends View<PlayerModel> {
    private sprite!: Sprite;

    create() {
        this.sprite = Sprite.from("player");
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
    }

    updatePosition() {
        const pos = this._model.getPosition();
        this.position.set(pos.x, pos.y);
    }

    destroyView() {
        this.removeChildren();
    }
}

// 3. Controllers
class PlayerController extends Controller<PlayerModel, PlayerView> {
    @Resolve("InputService")
    private input!: InputService;

    init() {
        this.model.init?.();
        this.view.create();
        DI.app.ticker.add(this.update, this);
    }

    private update() {
        const speed = 5;
        if (this.input.isKeyPressed("ArrowLeft")) {
            this.model.move(-speed, 0);
        }
        if (this.input.isKeyPressed("ArrowRight")) {
            this.model.move(speed, 0);
        }
        this.view.updatePosition();
    }

    destroy() {
        DI.app.ticker.remove(this.update, this);
        super.destroy();
    }
}

// 4. Installer
class GameInstaller extends Installer {
    install() {
        // Реєстрація сервісів
        this.container.bind("InputService", new InputService());

        // Створення контролера
        const player = new PlayerController();
        player.init();
        this.app.stage.addChild(player.view);
    }
}
```

## Best Practices

1. **Model не знає про View:**
```typescript
// ❌ Погано
class Model {
    updateView() { this.view.redraw(); }
}

// ✅ Добре
class Controller {
    onDataChanged() {
        this.view.update();
    }
}
```

2. **View не містить логіки:**
```typescript
// ❌ Погано
class View {
    onClick() {
        this.model.score += 10;
        this.calculateDamage();
    }
}

// ✅ Добре
class View {
    onClick() {
        this.emit("click");
    }
}
class Controller {
    init() {
        this.view.on("click", () => this.handleClick());
    }
    handleClick() {
        this.model.addScore(10);
    }
}
```

3. **Використовуйте типізацію:**
```typescript
// ✅ Типізовані зв'язки
class PlayerController extends Controller<PlayerModel, PlayerView> {
    // TypeScript знає типи this.model та this.view
}
```
