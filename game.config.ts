import { IGameConfig, Orientation, ScaleMode } from "src/core/GameConfigInterface";



export const gameConfig: IGameConfig = {
    logicWidth: 1920,
    logicHeight: 1080,
    orientation: Orientation.LANDSCAPE,
    scaleMode: ScaleMode.FIT,
    renderer: {
        background: 0x707070,  
        antialias: true, 
        maxResolution: 1,
        autoDensity: true,
        autoStart: true
    },
    container: {
        width: "min(80vw, 80vh * (16 / 9))",
        height: "min(80vh, 80vw / (16 / 9))",
        cssBackground: "#707070",
        borderRadius: "6px",
        position: "relative",
        fullscreen: false
    },
    debug: {
        showFPS: false,
        showCoordinatePoints: false,
        verbose: false
    }
};