import { Observable } from 'rxjs';
import { Angle, ArenaId, CommandUpdate, SharkId, SharkMode } from './gameplay';

export type Shark = {
    takeControl: () => Observable<CommandUpdate>,
    setFinSpeed: (port: number, starboard: number) => Observable<CommandUpdate>,
    setSharkMode: (mode: SharkMode) => Observable<CommandUpdate>,
    performWideScan: () => Observable<CommandUpdate>,
    performNarrowScan: (direction: Angle) => Observable<CommandUpdate>,
    fireTorpedo: (direction: Angle) => Observable<CommandUpdate>,
    fireLaser: () => Observable<CommandUpdate>,
};

export type CreateShark = (arenaId: ArenaId, playerId: SharkId) => Shark;

/**
 * basically, the shark will react to what's happening around it.
 * it constantly observes the game state, and decides what to do based on it.
 * 
 * There are different maneuvers that the shark can take on, based on the game state.
 * 
 * question- how often do we need to make a decision?
 *  - need to decide even when a maneuver is happeneing, what if a higher priority maneuver gets chosen
 *  - maybe we decide on every update, but use priority to determine
 * 
 * Maneuvers are defined by
 * 1. the game state rules that trigger it to start, and a priority indicating which 
 * 2. it's usage of the shark api to accomplish the maneuver.
 * 3. the game state rules that trigger it to end.
 * 
 * Only one maneuver can be active at a time.
 * 
 * maneuver ideas
 * 1. (default) roam around the map, occasionally scanning for enemies.
 * 1. when health is low, hide and repair.
 *      1. stealth, maybe, depending on how low.
 * 1. when an enemy is detected and sufficient energy
 *      1. 0 torpedos -> laser
 *      1. >0 torpedos -> laser N times, torpedo
 *      could also factor in enemy health status, distance
 * 
 * maybe global behaviors e.g.
 * 1. stop moving and/or turn when heading off the map
 * 
 * regarding game state, i will have info about my shark's position/health/energy/ammo status
 * info about enemies is only available when scanning - position/direction/vague-health
 * 
 * idea: make type containing state I care about, combine latest of beat updates and scans for decision making.
 *      the type can assume some calculations have been made, to make decision logic clearer.
 * 
 */