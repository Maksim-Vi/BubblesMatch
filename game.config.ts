import { IGameConfig, Orientation, ScaleMode, FillMode } from "src/core/GameConfigInterface";



export const gameConfig: IGameConfig = {
    // logicWidth: 1920,
    // logicHeight: 1080,
    // orientation: Orientation.LANDSCAPE,
    // scaleMode: ScaleMode.FIT,
    // renderer: {
    //     background: 0x707070,  
    //     antialias: true, 
    //     maxResolution: 1,
    //     autoDensity: true,
    //     autoStart: true
    // },
    // container: {
    //     width: "min(80vw, 80vh * (16 / 9))",
    //     height: "min(80vh, 80vw / (16 / 9))",
    //     cssBackground: "#707070",
    //     borderRadius: "6px",
    //     position: "relative",
    //     fullscreen: false
    // },
    // debug: {
    //     showFPS: false,
    //     showCoordinatePoints: false,
    //     verbose: false
    // }

    logicWidth: 1920,
    logicHeight: 1080,
    orientation: Orientation.LANDSCAPE,
    scaleMode: ScaleMode.FILL,
    fillMode: FillMode.AUTO, // WIDTH | HEIGHT | AUTO
    renderer: {
        background: {type: "color", value: "#ffffff"},
        antialias: false,
        maxResolution: 1,
        autoDensity: true,
        autoStart: true
    },
    container: {
        width: "100%",
        height: "100%",
        cssBackground: {type: "color", value: "#ffffff"},
        borderRadius: "0px",
        position: "relative",
        fullscreen: true
    },
    debug: {
        showFPS: false,
        showCoordinatePoints: false,
        verbose: true
    }
};