import { FinSpeed, Position, Velocity } from "./spacial"

type basicShark = {
    id: string
    name: string
}

export type scannedShark = {
    sharkId: string
    name: string
    center: Position
    velocity: Velocity
    healthStatus: sharkHealthStatus
}

type scannedTorpedo = {
    position: Position,
    direction: number,
    message: string
}

export type SharkScoreUpdate = {
    sharkId: string
    sharkName: string
    points: number
    thisLifeKillCount: number
    killCount: number
    diedCount: number
}

export type BeatUpdate = {
    sharkId: string
    gameTime: number
    isAlive: 'yes'
    mode: SharkMode
    centerPoint: Position
    facing: number
    energy: number
    health: number
    torpedoCount: number
    actualFinSpeed: FinSpeed
    scores: SharkScoreUpdate[]
    events: BeatEvent[]
}

export type DeadBeatUpdate = {
    sharkId: string
    gameTime: number
    isAlive: 'no'
    events: BeatEvent[]
}

export type BeatEvent = laserFiredEvent | torpedoDetonatedEvent | torpedoLostEvent | narrowScanExecutedEvent | wideScanExecutedEvent | arenaScanExecutedEvent | scanDetectedEvent | damageTakenEvent | proximityAlarmEvent | sharkDestroyedEvent | sharkRespawnedEvent | ClassyTrashTalkOpportunityEvent | ClassyTrashTalkedEvent;

export type laserFiredEvent = {
    event: 'laserFiredEvent'
    firingSharkId: string
    commandId: string
    direction: number,
    startingPoint: {
        x: number
        y: number
    },
    endingPoint: {
        x: number
        y: number
    }
    sharkHit: basicShark | null
}

export type torpedoDetonatedEvent = {
    event: 'torpedoDetonatedEvent'
    commandId: string
    firingSharkId: string
    sharksHit: basicShark[]
    centerPoint: Position
    pointsScored: number
}

export type torpedoLostEvent = {
    event: 'torpedoLostEvent',
    commandId: string,
    lastKnownPosition: Position
}

export type narrowScanExecutedEvent = {
    event: 'narrowScanExecutedEvent'
    commandId: string
    centerPoint: Position
    direction: number
    sharks: scannedShark[]
    torpedoes: scannedTorpedo[]
}

export type wideScanExecutedEvent = {
    event: 'wideScanExecutedEvent'
    commandId: string
    centerPoint: Position
    sharks: scannedShark[]
    torpedoes: scannedTorpedo[]
}

export type arenaScanExecutedEvent = {
    event: 'arenaScanExecutedEvent'
    sharks: scannedShark[]
    torpedos: scannedTorpedo[]
}

export type scanDetectedEvent = {
    event: 'scanDetectedEvent'
    sourcePosition: Position
}

export type damageTakenEvent = {
    event: 'damageTakenEvent'
    health: number
    energy: number
    source: damageSource
}

export type proximityAlarmEvent = {
    event: 'proximityAlarmEvent'
}

export type sharkDestroyedEvent = {
    event: 'sharkDestroyedEvent'
    shark: basicShark
}

export type sharkRespawnedEvent = {
    event: 'sharkRespawnedEvent'
    shark: basicShark
}

export type ClassyTrashTalkOpportunityEvent = {
    event: 'classyTrashTalkOpportunityEvent',
    sharkId: string,
    trashTalkCode: string,
    subject: string
}

export type ClassyTrashTalkedEvent = {
    event: 'classyTrashTalkedEvent',
    sharkId: string,
    trashTalkCode: string,
    subject: string,
    message: string
}

export type damageSource =
| "Laser"
| "Torpedo";

export type SharkMode =
| 'attack'
| 'repair'
| 'stealth';