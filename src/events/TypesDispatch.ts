// Game state events
export const GAME_WIN: string = 'game:win';
export const GAME_OVER: string = 'game:over';

// Score events
export const SCORE_UPDATED: string = 'game:scoreUpdated';
export const MOVES_UPDATED: string = 'game:movesUpdated';

// Screen events
export const SHOW_FINISH_SCREEN: string = 'screen:showFinish';
export const RESTART_GAME: string = 'game:restart';
export const GO_TO_LOBBY: string = 'game:goToLobby';
export const EXIT_GAME: string = 'game:exit';

// Asset events
export const ASSETS_LOAD_START: string = 'assets:loadStart';
export const ASSETS_LOAD_PROGRESS: string = 'assets:loadProgress';
export const ASSETS_LOAD_COMPLETE: string = 'assets:loadComplete';

// App events
export const RESIZE_APP: string = 'app:resize';
export const START_GAME: string = 'game:start';

// Level selection events
export const SELECT_LEVEL: string = 'level:select';
export const PLAY_CURRENT_LEVEL: string = 'level:playCurrent';
