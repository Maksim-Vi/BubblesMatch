# BubbleMatch Project Structure

## Tech Stack
- **Engine**: PixiJS v8.15
- **Layout**: @pixi/layout + yoga-layout
- **Animation**: GSAP
- **Build**: Webpack + TypeScript

## Game Config (game.config.ts)
```typescript
logicWidth: 1920, logicHeight: 1080
orientation: Orientation.LANDSCAPE
scaleMode: ScaleMode.FIT  // FIT | FILL | STRETCH
renderer: { background: 0x707070, antialias: true, maxResolution: 1 }
container: { width: "min(80vw, 80vh * (16/9))", fullscreen: false }
debug: { showFPS: false, verbose: false }
```

## Folder Structure
```
src/
├── assetsLoader/
│   ├── AssetsLoader.ts        # Singleton: add(key, path), get(key), load()
│   └── registerAssets.ts      # Reads public/assets/assets.json
├── common/
│   ├── cell/
│   │   └── Tile.ts            # TileColor enum, ITileData, Tile class
│   ├── input/
│   │   ├── SwipeSystem.ts     # Swipe detection (canSwipe, onSwipe, threshold:30)
│   │   ├── ClickSystem.ts     # Double-click (canClick, onDoubleClick, delay:300)
│   │   └── index.ts
│   └── ui/
│       ├── index.ts
│       ├── UIButton.ts        # nineSlice, text, onClick
│       ├── UIText.ts          # IUITextOptions
│       ├── UIContainer.ts     # Flexbox (yoga-layout)
│       ├── NineSlicePanel.ts
│       ├── ScaledBackground.ts
│       └── ScrollBox.ts       # mask + drag + wheel + inertia
├── core/
│   ├── di/
│   │   ├── DI.ts              # Static DI.init(container, app)
│   │   ├── DIContainer.ts     # bind, resolve, has
│   │   ├── Installer.ts
│   │   └── decorators.ts      # @Resolve("token")
│   ├── mvc/
│   │   ├── Model.ts           # init?(), destroy?()
│   │   ├── View.ts            # create(), destroyView()
│   │   ├── Controller.ts      # init(), destroy()
│   │   └── Manager.ts
│   ├── Game.ts                # Entry point, resize handling
│   ├── ScreenHelper.ts        # Static: Width, Height, Center
│   └── GameConfigInterface.ts
├── events/
│   ├── GlobalDispatcher.ts    # add, remove, dispatch
│   └── TypesDispatch.ts
├── game/
│   ├── GameManager.ts         # changeScene(), handles RESTART/GO_TO_LOBBY
│   └── bubbleGame/
│       ├── BubbleModel.ts     # GameState, score, moves, grid
│       ├── BubbleView.ts
│       ├── BubbleController.ts # Main game logic
│       ├── gridBubble/BubbleGrid.ts
│       ├── tileBubble/BubbleTile.ts
│       ├── Item/Item.ts
│       ├── match/
│       │   ├── MatchFinder.ts    # findConnectedTiles, hasPossibleMoves
│       │   └── ScoreCalculator.ts
│       ├── gravity/
│       │   └── GravitySystem.ts  # applyGravity, shiftRight, getEmptyCells
│       ├── animation/
│       │   └── AnimationHelper.ts # GSAP animations
│       └── leftTable/            # Score/moves UI (MVC)
├── Installers/
│   ├── GameInstaller.ts       # LevelStore, FinishStore, GameStore, GameManager
│   └── SceneInstaller.ts      # SceneManager, all *SceneManager
├── RootInstaller.ts
├── screens/
│   ├── ScreenManager.ts       # SceneType enum, loadScene()
│   └── components/
│       ├── base/ScreenManagerBase.ts
│       ├── loadingScreen/
│       ├── lobbyScreen/       # Contains LevelsWindowView
│       ├── levelsWindow/      # Grid 3x3, ScrollBox, Play button
│       ├── gameScreen/
│       └── finishScreen/
├── store/
│   ├── LevelStore.ts          # 10 levels config
│   ├── GameStore.ts           # localStorage progress
│   └── FinishStore.ts
└── utilits/
```

## Game Logic (BubbleController)

### GameState
```typescript
enum GameState { IDLE, PLAYER_INPUT, GAME_OVER, LEVEL_COMPLETE }
```

### Core Flow
```
init() → setupSwipeSystem + setupClickSystem → initGrid()
Double-click tile → tryCollectMatch() → collectAndRefill() → applyGravityAndRefill()
Win: grid empty | GameOver: no moves | NoMatches: penalty for remaining
```

### Rules
- MIN_MATCH_COUNT = 2
- Bonus: >10 items collected = +1 move
- No matches left = penalty (remaining * 10 points)
- Colors balanced on spawn (avoids clusters)

### Systems
```typescript
swipeSystem: SwipeSystem<BubbleTile>   // Swap adjacent items
clickSystem: ClickSystem<BubbleTile>   // Collect matching items
gravitySystem: GravitySystem           // Fall down + shift right
```

## Patterns

### MVC
```typescript
class MyModel extends Model { init?(); destroy?(); }
class MyView extends View<M> { create(); destroyView(); }
class MyController extends Controller<M, V> { init(); destroy(); }
class MyManager extends ScreenManagerBase { loadScene(); hideScene(); }
```

### DI
```typescript
container.bind("Token", instance);
@Resolve("Token") private service: Service;
```

### Events
```typescript
GlobalDispatcher.add(EVENT, handler, context);
GlobalDispatcher.dispatch(EVENT, { params });
GlobalDispatcher.removeAllForContext(this);
```

## Events (TypesDispatch.ts)
```
GAME_WIN, GAME_OVER, EXIT_GAME
SCORE_UPDATED, MOVES_UPDATED
SHOW_FINISH_SCREEN, RESTART_GAME, GO_TO_LOBBY, START_GAME
ASSETS_LOAD_START, ASSETS_LOAD_PROGRESS, ASSETS_LOAD_COMPLETE
RESIZE_APP
SELECT_LEVEL, PLAY_CURRENT_LEVEL
```

## SceneType
```typescript
LoadingScreen, LobbyScreen, GameScreen, FinishScreen
```

## Stores

### LevelStore (10 levels)
```typescript
interface ILevelConfig {
    id: number;              // 1-10
    gridConfig: IGridConfig; // gridWidth(8-11), gridHeight, cellSize(70-80), gap(2)
    maxItems: number;        // 64-121
    maxMoves: number;        // 10-25
    colors: TileColor[];
    description: string;
}
getAllLevels(), getLevel(id), setCurrentLevel(id), currentLevel, totalLevels
```

### GameStore (localStorage)
```typescript
STORAGE_KEY = 'bubbleMatch_progress'
{ currentLevel: number, unlockedLevel: number }
currentLevel (get/set), unlockedLevel, isLevelUnlocked(id)
// Auto-saves on GAME_WIN
```

## TileColor → Texture
```typescript
RED=0→ico/1, YELLOW=1→ico/2, PURPURE=2→ico/3, BLUE=3→ico/4
PING=4→ico/5, GREEN=5→ico/6, ORANGE=6→ico/7, MULTI=7→ico/8
```

## UI Components

### UIButton
```typescript
new UIButton({ texture, width, height, text, nineSlice:{l,t,r,b}, anchor:{x,y}, textOptions:{fontSize,fontFamily}, onClick })
```

### UIContainer (Flexbox)
```typescript
new UIContainer({ width, height, flexDirection:'row'|'column', justifyContent, alignItems, gap })
container.addLayoutChild(child)
```

### ScrollBox
```typescript
new ScrollBox({ width, height })
scrollBox.addScrollContent(container)
// Supports: drag, wheel, inertia
```

### NineSlicePanel
```typescript
new NineSlicePanel({ texture, width, height, leftWidth, topHeight, rightWidth, bottomHeight })
```

## Animation (GSAP)
```typescript
AnimationHelper.animateGridFill(items, cols, gap)  // Initial fill
AnimationHelper.animateFall(items, gap)            // Refill
AnimationHelper.animateCollect(tiles)              // Scale to 0
AnimationHelper.animateMoves(moves, grid)          // Gravity/shift
AnimationHelper.animateClearGrid(grid)             // Game over
AnimationHelper.animateBounce/Scale/FadeIn/FadeOut/Shake(target)
```

### Default Configs
```
FALL: { duration: 0.35, stagger: 0.03, ease: "power2.out" }
COLLECT: { duration: 0.15, stagger: 0.02, ease: "back.in(2)" }
MOVE: { duration: 0.25, stagger: 0.04, ease: "power2.out" }
```

## Assets
Path: `public/assets/`, Config: `assets.json`, Key: `"folder/name"`

```
buttons/button_blue, button_gold, button_main, button_red
assets/frame_slice_1..4, star, levels_bg
bg/bg_1, bg_2, bg_loading
grid/gridCell_1, gridCell_2
ico/1..8
```

## Sizes
```typescript
BUTTON: width=500, height=100, nineSlice={100,100,100,100}
PANEL: width=850, height=600, nineSlice={400,400,400,400}
LEVELS_WINDOW: cellSize=120, cellGap=20, cols=3, scrollHeight=400
SCREEN: 1920x1080 (logic)
```

## Text Style
```typescript
{ fontFamily:'VAGRounded', fill:0xffffff, fontWeight:'bold',
  stroke:{color:0x000000,width:5}, dropShadow:{color:0x000000,blur:4,distance:2} }
```

## Quick Add

### New Screen
1. Create folder `screens/components/myScreen/`
2. Add Model, View, Controller, Manager, index.ts
3. Bind in SceneInstaller
4. Add to SceneType enum + SceneManager.loadScene()

### New Store
1. Create `store/MyStore.ts`
2. Bind in GameInstaller

### New Event
1. Add to TypesDispatch.ts
2. Use with GlobalDispatcher
