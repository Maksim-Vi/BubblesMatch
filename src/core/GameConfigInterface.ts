export enum Orientation {
    LANDSCAPE = "landscape",
    PORTRAIT = "portrait"
}

export enum ScaleMode {
    FIT = "fit",
    FILL = "fill",
    STRETCH = "stretch"
}

export enum FillMode {
    /** Scale by width - fills width, may crop top/bottom */
    WIDTH = "width",
    /** Scale by height - fills height, may crop left/right */
    HEIGHT = "height",
    /** Auto - uses Math.max to fill entire screen (current behavior) */
    AUTO = "auto"
}

export type RendererBackground =
    | { type: "color"; value: number | string }
    | { type: "image"; src: string };

export interface IGameConfig {
    /**
     * Логічна ширина гри в пікселях
     * Це розмір, в якому ви розробляєте гру
     */
    logicWidth: number;

    /**
     * Логічна висота гри в пікселях
     */
    logicHeight: number;

    /**
     * Орієнтація гри
     */
    orientation: Orientation;

    /**
     * Режим масштабування
     */
    scaleMode: ScaleMode;

    /**
     * Режим заповнення при ScaleMode.FILL
     * - WIDTH: масштабування по ширині (може обрізати верх/низ)
     * - HEIGHT: масштабування по висоті (може обрізати ліво/право)
     * - AUTO: автоматично (Math.max - заповнює весь екран)
     */
    fillMode?: FillMode;

    /**
     * Renderer settings
     */
    renderer: {
        /**
         * Колір фону (hex)
         */
        background?: RendererBackground;

        /**
         * Увімкнути антиаліасинг
         * Покращує якість, але може знизити FPS
         */
        antialias: boolean;

        /**
         * Максимальний device pixel ratio
         * Обмежує resolution для покращення продуктивності
         */
        maxResolution: number;

        /**
         * Auto density - автоматично використовує devicePixelRatio
         */
        autoDensity: boolean;

        /**
         * Auto start ticker
         */
        autoStart: boolean;
    };

    /**
     * CSS стилі для game container
     * Якщо null - використовуються автоматичні розрахунки
     * Якщо задано - використовуються ці значення (можна перевизначити вручну)
     */
    container: {
        /**
         * Ширина контейнера (CSS)
         * Приклади: "100vw", "800px", "80%"
         * null = автоматично
         */
        width: string | null;

        /**
         * Висота контейнера (CSS)
         * Приклади: "100vh", "600px", "90%"
         * null = автоматично
         */
        height: string | null;

        /**
         * CSS background для контейнера
         */
        cssBackground: RendererBackground;

        /**
         * Border radius для контейнера
         */
        borderRadius: string;

        /**
         * Позиціонування контейнера
         */
        position: "relative" | "absolute" | "fixed";

        /**
         * Якщо true - контейнер займе 100% viewport
         */
        fullscreen: boolean;
    };

    /**
     * Debug налаштування
     */
    debug: {
        /**
         * Показувати FPS
         */
        showFPS: boolean;

        /**
         * Показувати debug точки координат
         */
        showCoordinatePoints: boolean;

        /**
         * Виводити лог в консоль
         */
        verbose: boolean;
    };
}



// ============================================
// ПРИКЛАДИ КОНФІГУРАЦІЙ ДЛЯ РІЗНИХ ТИПІВ ІГОР
// ============================================

/**
 * Приклад 1: Мобільна портретна гра (9:16)
 */
export const MOBILE_PORTRAIT_CONFIG: IGameConfig = {
    logicWidth: 720,
    logicHeight: 1280,
    orientation: Orientation.PORTRAIT,
    scaleMode: ScaleMode.FIT,
    renderer: {
        background: {type: "color", value: 0x000000},
        antialias: true,
        maxResolution: 2,
        autoDensity: true,
        autoStart: true
    },
    container: {
        width: "min(100vw, 100vh * (16 / 9))",
        height: "min(100vh, 100vw / (16 / 9))",
        cssBackground: {type: "color", value: "#ffffff"},
        borderRadius: "0px",
        position: "fixed",
        fullscreen: true
    },
    debug: {
        showFPS: true,
        showCoordinatePoints: false,
        verbose: false
    }
};

/**
 * Приклад 2: Desktop гра (16:9)
 */
export const DESKTOP_CONFIG: IGameConfig = {
    logicWidth: 1920,
    logicHeight: 1080,
    orientation: Orientation.LANDSCAPE,
    scaleMode: ScaleMode.FIT,
    renderer: {
        background: {type: "color", value: 0x1a1a1a},
        antialias: true,
        maxResolution: 2,
        autoDensity: true,
        autoStart: true
    },
    container: {
        width: "min(100vw, 100vh * (16 / 9))",
        height: "min(100vh, 100vw / (16 / 9))",
        cssBackground: {type: "color", value: "#ffffff"},
        borderRadius: "8px",
        position: "relative",
        fullscreen: false
    },
    debug: {
        showFPS: false,
        showCoordinatePoints: false,
        verbose: false
    }
};

/**
 * Приклад 3: Фіксований розмір гри (800x600)
 */
export const FIXED_SIZE_CONFIG: IGameConfig = {
    logicWidth: 800,
    logicHeight: 600,
    orientation: Orientation.LANDSCAPE,
    scaleMode: ScaleMode.FIT,
    renderer: {
        background: {type: "color", value: 0x333333},
        antialias: true,
        maxResolution: 1,
        autoDensity: true,
        autoStart: true
    },
    container: {
        width: "800px",
        height: "600px",
        cssBackground: {type: "color", value: "#ffffff"},
        borderRadius: "4px",
        position: "relative",
        fullscreen: false
    },
    debug: {
        showFPS: true,
        showCoordinatePoints: true,
        verbose: true
    }
};

/**
 * Приклад 4: Повноекранна гра без обмежень
 */
export const FULLSCREEN_CONFIG: IGameConfig = {
    logicWidth: 1920,
    logicHeight: 1080,
    orientation: Orientation.LANDSCAPE,
    scaleMode: ScaleMode.FILL,
    fillMode: FillMode.AUTO,
    renderer: {
        background: {type: "color", value: 0x333333},
        antialias: false,  // Вимкнено для кращої продуктивності
        maxResolution: 1,
        autoDensity: true,
        autoStart: true
    },
    container: {
        width: "100vw",
        height: "100vh",
        cssBackground: {type: "color", value: "#ffffff"},
        borderRadius: "0px",
        position: "fixed",
        fullscreen: true
    },
    debug: {
        showFPS: false,
        showCoordinatePoints: false,
        verbose: false
    }
};
