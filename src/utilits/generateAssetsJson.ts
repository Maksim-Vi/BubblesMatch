// import * as fs from "fs";
// import * as path from "path";

const fs = require("fs");
const path = require("path");

const ASSETS_DIR = path.resolve("public/assets");
const OUTPUT_FILE = path.join(ASSETS_DIR, "assets.json");

// Files and folders to ignore
const IGNORE_LIST = [
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    ".git",
    ".gitkeep",
    "assets.json"
];

// Supported image formats
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];

// Sprite atlas formats (JSON + image pair)
const ATLAS_EXTENSIONS = ["json"];

interface AssetInfo {
    load: string;
    assetName: string;
    assetPath: string;
    fullAssetPath: string;
    ext: string;
    type: "image" | "atlas" | "other";
}

const assets: AssetInfo[] = [];

function shouldIgnore(filename: string): boolean {
    return IGNORE_LIST.some(ignored => filename === ignored || filename.startsWith('.'));
}

function getAssetType(ext: string): "image" | "atlas" | "other" {
    if (IMAGE_EXTENSIONS.includes(ext.toLowerCase())) {
        return "image";
    }
    if (ATLAS_EXTENSIONS.includes(ext.toLowerCase())) {
        return "atlas";
    }
    return "other";
}

function walkDir(dir: string, baseDir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        // Skip ignored files
        if (shouldIgnore(file.name)) {
            continue;
        }

        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            walkDir(fullPath, baseDir);
        } else {
            const ext = path.extname(file.name).slice(1);
            const assetName = path.basename(file.name, path.extname(file.name));
            const relativePath = path.relative(baseDir, dir).replace(/\\/g, "/");
            const type = getAssetType(ext);

            const assetPath = relativePath ? relativePath + "/" : "";
            const assetNameFind = assetPath + assetName

            assets.push({
                load: assetNameFind,
                assetName,
                assetPath: assetPath,
                fullAssetPath: dir.replace(/\\/g, "/") + "/",
                ext,
                type
            });
        }
    }
}

function generateAssetsJson() {
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`Folder ${ASSETS_DIR} not found`);
        process.exit(1);
    }

    walkDir(ASSETS_DIR, ASSETS_DIR);

    const output = {
        // basePath: "public/assets/",
        basePath: "assets/",
        assets,
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");
    console.log(`assets.json created: ${OUTPUT_FILE}`);
    console.log(`found files: ${assets.length}`);
}

generateAssetsJson();
