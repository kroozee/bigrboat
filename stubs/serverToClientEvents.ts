export type ServerToClientEvents = {
    commandUpdate: (commandUpdate: CommandUpdate) => void,
    beatUpdate: (beatUpdate: BeatUpdate | DeadBeatUpdate) => void,
    spectatorUpdate: (spectatorUpdate: SpectatorGameBeat) => void
}