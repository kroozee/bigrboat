import { Brand } from './utility';

export type ArenaId = Brand<string, 'ArenaId'>;
export type SharkId = Brand<string, 'SharkId'>;
export type CommandId = Brand<string, 'CommandId'>;

export type Angle = Brand<number, 'Radians'>;

type BasicShark = {
    id: SharkId
    name: string
}

type DamageSource = 'laser' | 'torpedo' | 'wall'

type ScannedShark = {
    sharkId: SharkId
    name: string
    centerX: number
    centerY: number
    velocity: Velocity
    healthStatus: SharkHealthStatus
}

type ScannedTorpedo = {
    positionX: number
    positionY: number
    direction: number
    message: string
}

export type SharkMode = 'attack' | 'repair' | 'stealth';
type SharkHealthStatus = 'healthy' | 'crippled' | 'immobilized'

type Velocity = {
    speed: number;
    direction: Angle;
};

export type CommandUpdate = {
    commandId: CommandId,
    status: 'failed' | 'succeeded' | 'in-progress',
    message: string | null
};

type AliveBeatUpdate = {
    sharkId: SharkId
    gameTime: number
    isAlive: 'yes'
    mode: SharkMode
    positionX: number
    positionY: number
    facing: number
    energy: number
    health: number
    torpedoCount: number
    portFinSpeedActual: number
    starboardFinSpeedActual: number
    scores: SharkScoreUpdate[]
    events: BeatEvent[]
};

type DeadBeatUpdate = {
    sharkId: SharkId
    gameTime: number
    isAlive: 'no'
    respawnAt: number
    events: BeatEvent[]
};

export type BeatUpdate =
    | AliveBeatUpdate
    | DeadBeatUpdate;

export type BeatEvent =
    | SharkScoreUpdate
    | DeadBeatUpdate
    | DamageTakenEvent
    | LaserFiredEvent
    | NarrowScanExecutedEvent
    | ProximityAlarmEvent
    | ScanDetectedEvent
    | SharkDestroyedEvent
    | SharkRespawnedEvent
    | TorpedoDetonatedEvent
    | TorpedoLostEvent
    | WideScanExecutedEvent;

type SharkScoreUpdate = {
    sharkId: SharkId
    sharkName: string
    points: number
    thisLifeKillCount: number
    killCount: number
    diedCount: number
}

type DamageTakenEvent = {
    event: 'damageTakenEvent'
    health: number
    energy: number
    source: DamageSource
}

type LaserFiredEvent = {
    event: 'laserFiredEvent'
    firingsharkId: SharkId
    commandId: CommandId
    direction: number
    startingPointX: number
    startingPointY: number
    endingPointX: number
    endingPointY: number
    sharkHit: BasicShark | null
}

type NarrowScanExecutedEvent = {
    event: 'narrowScanExecutedEvent'
    commandId: CommandId
    scanFromX: number
    scanFromY: number
    direction: number
    sharks: ScannedShark[]
    torpedoes: ScannedTorpedo[]
}

type ProximityAlarmEvent = {
    event: 'proximityAlarmEvent'
}

type ScanDetectedEvent = {
    event: 'scanDetectedEvent'
    sourcePositionX: number
    sourcePositionY: number
}

type SharkDestroyedEvent = {
    event: 'sharkDestroyedEvent'
    shark: BasicShark
}

type SharkRespawnedEvent = {
    event: 'sharkRespawnedEvent'
    shark: BasicShark
}

type TorpedoDetonatedEvent = {
    event: 'torpedoDetonatedEvent'
    commandId: CommandId
    firingSharkId: string
    sharksHit: BasicShark[]
    detonationPointX: number
    detonationPointY: number
    pointsScored: number
}

type TorpedoLostEvent = {
    event: 'torpedoLostEvent',
    commandId: CommandId,
    lastKnownPositionX: number
    lastKnownPositionY: number
}

type WideScanExecutedEvent = {
    event: 'wideScanExecutedEvent'
    commandId: CommandId
    scanningsharkId: SharkId
    centerPointX: number
    centerPointY: number
    sharks: ScannedShark[]
    torpedoes: ScannedTorpedo[]
}