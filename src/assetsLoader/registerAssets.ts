import assetsData from "public/assets/assets.json";
import { ASSET_GROUPS } from "../utilits/assets-groups.config";
import AssetsLoader from "./AssetsLoader";

export function registerAssets() {
    const manualFolders = new Map<string, string>();

    for (const [group, folders] of Object.entries(ASSET_GROUPS)) {
        for (const folder of folders) {
            manualFolders.set(folder, group);
        }
    }

    for (const asset of assetsData.assets) {
        const key = asset.load;
        const relativePath = asset.assetPath + asset.assetName + "." + asset.ext;
        AssetsLoader.add(key, relativePath);
    }
}
