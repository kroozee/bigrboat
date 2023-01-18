import { BeatUpdate, DeadBeatUpdate } from "./beatEvents"
import { CommandUpdate } from "./playerCommands"

export type ServerToClientEvents = {
    commandUpdate: (commandUpdate: CommandUpdate) => void,
    beatUpdate: (beatUpdate: BeatUpdate | DeadBeatUpdate) => void,
    spectatorUpdate: (spectatorUpdate: any) => void
}