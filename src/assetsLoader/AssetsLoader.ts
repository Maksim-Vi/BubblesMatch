import { Assets, Texture } from "pixi.js";
import GlobalDispatcher from "../events/GlobalDispatcher";
import * as PIXI from "pixi.js";
import { ASSETS_LOAD_START, ASSETS_LOAD_PROGRESS, ASSETS_LOAD_COMPLETE } from "../events/TypesDispatch";

export default new class AssetsLoader {

    private  registry: Map<string, string> = new Map();
    private  cache: Map<string, Texture> = new Map();
    private  isLoading = false;

    add(key: string, path: string) {
        if (!this.registry.has(key)) this.registry.set(key, path);
    }

    addGroup(groupName: string, assets: Record<string, string>) {
        for (const [key, path] of Object.entries(assets)) {
            this.add(`${groupName}/${key}`, path);
        }
    }

     async load(keys: string[] | string): Promise<Record<string, any>> {
        const keyList = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, Texture> = {};

        const toLoad = keyList.filter((key) => !this.cache.has(key));

        if (toLoad.length === 0) {
            keyList.forEach((key) => (result[key] = this.cache.get(key)));
            return result;
        }

        this.isLoading = true;
        GlobalDispatcher.dispatch(ASSETS_LOAD_START, { assets: toLoad });

        const basePath = "assets/";
        let loadedCount = 0;

        for (const key of toLoad) {
            const path = this.registry.get(key);
            if (!path) {
                console.warn(`AssetsLoader: '${key}' not found in register`);
                continue;
            }

            const data = await Assets.load(basePath + path);
            if(data){
                this.cache.set(key, data);
                result[key] = data;
            }

            loadedCount++;
            const progress = Math.floor((loadedCount / toLoad.length) * 100);
            GlobalDispatcher.dispatch(ASSETS_LOAD_PROGRESS, {
                key,
                progress,
            });
        }

        GlobalDispatcher.dispatch(ASSETS_LOAD_COMPLETE, { assets: result });
        this.isLoading = false;
        return result;
    }

    async loadFromUrl(key: string, url: string): Promise<Texture | null> {
        if (this.cache.has(key)) {
            return this.cache.get(key) || null;
        }

        this.isLoading = true;
        // Assets.add(key, url);
        // const texture = await Assets.load<Texture>(key);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${url}`);

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const texture = PIXI.Texture.from(imageUrl);
        //URL.revokeObjectURL(imageUrl);

        if(texture){
            this.cache.set(key, texture);
        }

        this.isLoading = false;

        GlobalDispatcher.dispatch(ASSETS_LOAD_PROGRESS, {
            key,
            progress: 100,
        });

        GlobalDispatcher.dispatch(ASSETS_LOAD_COMPLETE, { assets: { [key]: texture } });

        return texture;
    }

     async loadAll(): Promise<Record<string, any>> {
        return this.load([...this.registry.keys()]);
     }

     get(key: string): Texture | null {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        return null;
    }

    async getAsync(key: string): Promise<PIXI.Texture | null> {
        return this.cache.get(key) ?? null;
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    getCache(): Map<string, any> {
        return this.cache;
    }

     clear(): void {
        this.cache.clear();
    }
}()

/*

AssetsLoader.add("playerShip", "ships/player_ship.png");
AssetsLoader.add("enemy1", "ships/enemy1.png");
AssetsLoader.add("buttonUI", "ui/button.png");

AssetsLoader.addGroup("effects", {
  explosion: "effects/explosion.json",
  smoke: "effects/smoke.png",
});

await AssetsLoader.loadAll();
await AssetsLoader.load(["playerShip", "effects/explosion"]);
const playerTexture = AssetsLoader.get("playerShip");
const sprite = new PIXI.Sprite(playerTexture);

*/