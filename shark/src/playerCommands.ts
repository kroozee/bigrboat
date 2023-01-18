import { Angle, FinSpeed } from "./spacial"

type commandStatus = 'failed' | 'succeeded' | 'in-progress'

export type CommandUpdate = {
    commandId: TransId,
    status: commandStatus,
    message: string | null
}

export function createCommandFailureUpdate(commandId : TransId, message : string) : CommandUpdate {
    return {
        commandId: commandId,
        status: 'failed',
        message: message
    }
}

export function createCommandInProgressUpdate(commandId: TransId, message : string | null = null) : CommandUpdate {
    return {
        commandId: commandId,
        status: 'in-progress',
        message: message
    }
}

export function createCommandSuccessUpdate(commandId : TransId, message : string | null = null) : CommandUpdate {
    return {
        commandId: commandId,
        status: 'succeeded',
        message: message
    }
}

export type beatCommandCollection = {
    setFinSpeed: setFinSpeed[]
    fireLaser: fireLaser[]
    fireTorpedo: fireTorpedo[]
    performNarrowScan: performNarrowScan[]
    performWideScan: performWideScan[]
    setSharkMode: setSharkMode[]
}

export type fireLaser = {
    commandId: TransId
    arenaId: TransId
    sharkId: TransId
    onUpdate: (commandUpdate : CommandUpdate) => void 
}

export type fireTorpedo = {
    commandId: TransId
    arenaId: TransId
    sharkId: TransId   
    direction: Angle
    onUpdate: (commandUpdate : CommandUpdate) => void
}

export type performNarrowScan = {
    commandId: TransId
    arenaId: TransId
    sharkId: TransId   
    direction: Angle
    onUpdate: (commandUpdate : CommandUpdate) => void
}

export type performWideScan = { 
    commandId: TransId
    arenaId: TransId
    sharkId: TransId   
    onUpdate: (commandUpdate : CommandUpdate) => void
}

export type setFinSpeed = {
    commandId: TransId
    arenaId: TransId
    sharkId: TransId    
    speed: FinSpeed
    onUpdate: (commandUpdate : CommandUpdate) => void
}

export type setSharkMode = {
    commandId: TransId
    arenaId: TransId
    sharkId: TransId   
    mode: setSharkMode
    onUpdate: (commandUpdate : CommandUpdate) => void
}
export type TransId = string;