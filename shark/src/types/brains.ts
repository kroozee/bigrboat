import { IO } from 'fp-ts/lib/IO';
import { Option } from 'fp-ts/lib/Option';
import { SharkHealthStatus, Velocity } from './gameplay';

export type ManeuverName =
    | 'roam'
    | 'evasion'
    | 'stealthEvasion'
    | 'torpedoAttack';

export type Maneuver = {
    name: ManeuverName
    priority: number
}

export type EnemyShark = {
    positionX: number
    positionY: number
    velocity: Velocity
    healthStatus: SharkHealthStatus
}

export type Situation = {
    currentManeuver: Option<Maneuver>
    positionX: number
    positionY: number
    velocity: Velocity
    health: number
    energy: number
    torpedos: number
    recentlyScannedEnemies: EnemyShark[]
};

export type SharkSee = (situation: Situation) => Maneuver;
export type SharkDo = (maneuver: Maneuver) => IO<void>;