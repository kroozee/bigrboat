import { Observable } from 'rxjs';
import { Angle, ArenaId, CommandUpdate, SharkId, SharkMode } from './gameplay';

export type Shark = {
    takeControl: () => Observable<CommandUpdate>,
    setFinSpeed: (port: number, starboard: number) => Observable<CommandUpdate>,
    setSharkMode: (mode: SharkMode) => Observable<CommandUpdate>,
    performWideScan: () => Observable<CommandUpdate>,
    performNarrowScan: (direction: Angle) => Observable<CommandUpdate>,
    fireTorpedo: (direction: Angle) => Observable<CommandUpdate>,
    fireLaser: () => Observable<CommandUpdate>
};

export type CreateShark = (arenaId: ArenaId, playerId: SharkId) => Shark

export type Maneuver =
    | 'roam'
    | 'heal'
    | 'attack'
    | 'evade';
