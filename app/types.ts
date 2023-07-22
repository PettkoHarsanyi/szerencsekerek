export type Player = {
    id?: number,
    name: string,
    points: number,
    isSolving: boolean,
    totalPoints: number,
    spinnedPlacement: boolean,
    placementPoints: number,
}

export type Message = {
    id: number,
    sender: Player,
    message: string
}

export type Riddle = {
    title: string,
    riddle: string,
}

export type Game = {
    local: boolean,
    round: number,
    stage: GameStage,
    currentRiddle: Riddle,
    gameTable: BoardCell[][],
}

export type BoardCell = {
    x: number,
    y: number,
    letter: string,
    known: boolean,
    isPlaying: boolean,
}

export type Zone = {
    deg: number,
    value: string | number;
}

export enum GameStage {
    PLACEMENT,
    SPINNING,
    GUESSING,
    ENDGAME,
    PAUSE
}