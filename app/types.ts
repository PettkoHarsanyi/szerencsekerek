export type Player = {
    id?: number,
    name: string
}

export type PlayerDto = {
    name: string
}

export type Message = {
    id: number,
    sender: Player,
    message: string
}

export type MessageDto = {
    sender: Player,
    message: string
}