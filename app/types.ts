export type Player = {
    id?: number,
    name: string,
    points?: number,
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
    players?: Player[];
}

export type BoardCell = {
    x: number,
    y: number,
    letter: string,
    known: boolean,
    isPlaying: boolean,
}