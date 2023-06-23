import fetch from "node-fetch";
import { io, Socket } from "socket.io-client";
import { CommandUpdate } from "types/playerCommands";
import { BeatUpdate, DeadBeatUpdate, scannedShark, SharkMode } from "./beatEvents";
import { ServerToClientEvents } from "./serverToClientEvents";
import { Position } from './spacial';
import { ArenaSettings, PublicArenaCreated } from './types/arena';

const api_root = "http://127.0.0.1:3000";
const socket: Socket<ServerToClientEvents, any> = io(api_root);
type beatUpdateDelegate = (update: BeatUpdate | DeadBeatUpdate) => void;
type commandUpdateDelegate = (update: CommandUpdate) => void;

let beatUpdate: beatUpdateDelegate = _ => { };
let commandUpdate: commandUpdateDelegate = _ => { };
const doResultLogging = false;

function logResult(result: CommandUpdate) {
    if (doResultLogging)
        console.log('**Command result**', result);
}

socket.on('commandUpdate', (update => {
    //console.log('**Command result**', update);
    if (update.status !== "succeeded") {
        console.log(update);
    }
}));

socket.on('beatUpdate', update => {
    beatUpdate(update);
    const nonProximityEvents = update.events /*.filter(e => e.event != 'proximityAlarmEvent')*/.length > 0;
    if (nonProximityEvents) {
        //console.log('beat events detected', update)
    }
    else if (update.gameTime % 720 == 0) {
        console.log('1 minute beat Update', update)
    }
})

const createSharkControlClient = (arenaId: string, playerId: string) => ({

    getBeatUpdate: (delegate: beatUpdateDelegate) => beatUpdate = delegate,
    getCommandUpdate: (delegate: commandUpdateDelegate) => commandUpdate = delegate,

    doStuff: () => {
        socket.emit('doStuff', (result: CommandUpdate) => {
            commandUpdate(result);
            logResult(result);
        })
    },

    takeControl: () => {
        socket.emit(
            'takeControl',
            arenaId,
            playerId,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            }
        )
    },

    setFinSpeed: (portSpeed: number, starboardSpeed: number) => {
        socket.emit(
            'setFinSpeed',
            arenaId,
            playerId,
            portSpeed, 
            starboardSpeed ,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            });
    },

    setSharkMode: (mode: SharkMode) => {
        socket.emit(
            'setSharkMode',
            arenaId,
            playerId,
            mode,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            });
    },

    performWideScan: () => {
        socket.emit(
            'performWideScan',
            arenaId,
            playerId,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            });
    },

    fireLaser: () => {
        socket.emit(
            'fireLaser',
            arenaId,
            playerId,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            });
    },

    performNarrowScan: (angle: number) => {
        socket.emit(
            'performNarrowScan',
            arenaId,
            playerId,
            angle,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            });
    },

    fireTorpedo: (angle: number) => {
        socket.emit(
            'fireTorpedo',
            arenaId,
            playerId,
            angle,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            });
    }
});

socket.on('connect', () => console.log('connected!!!!!'));
socket.connect();

type Shark = ReturnType<typeof createSharkControlClient>;

const state = {
    lastForwardScanBeat: 0,
    lastCenterScanBeat: 0,
};

const beatsPerSecond = 12;
const forwardScanRateInSeconds = 0.75;
const centerScanRateInSeconds = 2;

async function main() {
    const arenaId = '0000-004J';
    const playerId = '0bf0fda7-53b4-42c4-ad77-6e82e0fc4513';
    const arena_settings = await getArenaSettings(arenaId);

    const shark = createSharkControlClient(arenaId, playerId);

    shark.takeControl();
    let healing = false;

    shark.getBeatUpdate((update: BeatUpdate | DeadBeatUpdate) => {
        if (update.isAlive === 'yes') {
            healing = false;
            if (update.health > 599 && healing === false) {
                roam(shark, update, arena_settings);
                scan(shark, update, arena_settings);
                laser(shark, update, arena_settings);
                torpedo(shark, update, arena_settings);
            } else {
                shark.setFinSpeed(0,0);
                shark.setSharkMode("repair");
                healing = true;                
            }
            if (update.health > 599) {
                healing = false;
                shark.setSharkMode("attack");
                shark.setFinSpeed(6,6);
            }

        }
    });
}

// stream updates, based on some criteria, determine what "mode" the shark should be in.
// "modes" dictate what behavior the shark engages in - roaming, attacking, healing, evading, etc.
// 

function scan(shark: Shark, update: BeatUpdate, arena_settings: ArenaSettings) {
    const forwardScanRateInBeats = Math.floor(forwardScanRateInSeconds * beatsPerSecond);
    const centerScanRateInBeats = Math.floor(centerScanRateInSeconds * beatsPerSecond);
    
    const enoughEnergy = update.energy > arena_settings.scan.narrowScanToll.energy;

    const shouldScanCenter = (update.gameTime - state.lastCenterScanBeat) % centerScanRateInBeats === 0
        && enoughEnergy;

    const shouldScanForward = (update.gameTime - state.lastForwardScanBeat) % forwardScanRateInBeats === 0
        && enoughEnergy;

    if (shouldScanCenter) {
        const angleTowardsCenter = getAngleTowardsCenter(update, arena_settings);
        shark.performNarrowScan(angleTowardsCenter);
        state.lastCenterScanBeat = update.gameTime;
    }

    if (shouldScanForward) {
        shark.performNarrowScan(update.facing);
        state.lastForwardScanBeat = update.gameTime;
    }
}

function modifyAngleForQuadrant(angle: number, sharkCenterPoint: Position, arena_settings: ArenaSettings): number {
    const centerY = arena_settings.dimensions.height / 2;
    const centerX = arena_settings.dimensions.height / 2;

    const modifier = sharkCenterPoint.x < centerX
        ? Math.PI / 2
        : Math.PI * 1.5;

    const final = (centerX - sharkCenterPoint.x) * (centerY - sharkCenterPoint.y) >= 0
        ? modifier - angle
        : modifier + angle;

    return final;
}

function getAngleTowardsPoint(ourPosition: Position, targetPosition: Position, arena_settings: ArenaSettings): number {
    const angleTowardsCenter = Math.atan(
        Math.abs(targetPosition.y - ourPosition.y)
        / Math.abs(targetPosition.x - ourPosition.x));

    return modifyAngleForQuadrant(angleTowardsCenter, ourPosition, arena_settings);
}

function getAngleTowardsCenter(update: BeatUpdate, arena_settings: ArenaSettings): number {
    return getAngleTowardsPoint(
        {x:update.positionX,y:update.positionY},
        {
            x: arena_settings.dimensions.width / 2,
            y: arena_settings.dimensions.height
        },
        arena_settings);
}

function detectNearbyShark(update: BeatUpdate): scannedShark | undefined {
    const scanExecuted = pick(update.events,
        event => event.event === 'narrowScanExecutedEvent' ? event : undefined);

    return scanExecuted?.sharks?.[0];
}

function laser(shark: Shark, update: BeatUpdate, arena_settings: ArenaSettings) {
    const nearbyShark = detectNearbyShark(update);

    if (nearbyShark && update.energy > arena_settings.laser.firingToll.energy) {
        shark.fireLaser();
    }
}

function torpedo(shark: Shark, update: BeatUpdate, arena_settings: ArenaSettings) {
    const fireTowardsCenter = () => {
        const angle = getAngleTowardsCenter(update, arena_settings);
        shark.fireTorpedo(angle);
    };

    const fireAtNearby = () => {
        const scanExecuted = pick(update.events,
            event => event.event === 'narrowScanExecutedEvent' ? event : undefined);

        const nearbyShark = scanExecuted?.sharks?.[0];

        if (scanExecuted && scanExecuted.direction !== update.facing && nearbyShark) {
            const angle = getAngleTowardsPoint({x:update.positionX,y:update.positionY},{x:nearbyShark.centerX,y:nearbyShark.centerY}, arena_settings);
            shark.fireTorpedo(angle);


            /*
            const { center: targetPosition, velocity: targetVelocity } = nearbyShark;
            const { centerPoint: ourPosition } = update;
            const targetedSharkAngle = modifyAngleForQuadrant(targetVelocity.direction, targetPosition, arena_settings);

            const angle = Math.asin(
                targetVelocity.speed /
                (arena_settings.torpedo.speed / ((90 * (Math.PI / 2)) - targetedSharkAngle - Math.atan(() / ())))
            )
            +
            Math.atan(() / ());

            const final = modifyAngleForQuadrant(angle, update.centerPoint, arena_settings);
            shark.fireTorpedo(final);
            */
        }
    };

    if (update.torpedoCount > 1) {
        fireTowardsCenter();
    } else {
        fireAtNearby();
    }
}

const pick = <T, R>(values: T[], chooser: (value: T) => R | undefined): R | undefined => {
    const value = values.find(value => chooser(value) !== undefined);
    return value === undefined ? undefined : chooser(value);
};

function roam(shark: Shark, update: BeatUpdate, arena_settings: ArenaSettings) {
    //console.log(update);
    const x = update.positionX;
    const y = update.positionY;

    if (closeToEdge(x, y, arena_settings)) {
        const edge = findEdge(x, y, arena_settings);
        turn(edge!, shark, update, arena_settings);
        //debugger;
    } else {
        shark.setFinSpeed(6, 6)
    }

    //
}

function turn(edge: string, shark: Shark, update: BeatUpdate, arena_settings: ArenaSettings) {
    console.log(`Edge: ${edge}    Facing: ${update.facing}`);
    switch (edge) {
        case "top":
            if (update.facing > 4.5 && update.facing < 4.71) {

                shark.setFinSpeed(6, 6);
            } else {
                shark.setFinSpeed(-1, 1);
            }
            break;
        case "bottom":
            if (update.facing > 1 && update.facing < 1.57) {
                shark.setFinSpeed(6, 6);

            } else {
                shark.setFinSpeed(-1, 1);
            }
            break;
        case "right":
            if (update.facing > 5 && update.facing < 6.28) {
                shark.setFinSpeed(6, 6);
            } else {
                shark.setFinSpeed(-1, 1);
            }
            break;
        case "left":
            if (update.facing > 2 && update.facing <= 3.14) {
                shark.setFinSpeed(6, 6);
            } else {
                shark.setFinSpeed(-1, 1);
            }
            break;
        case "rightbottom":
            if (update.facing > 5 && update.facing < 6.28) {
                shark.setFinSpeed(6, 6);
            } else {
                shark.setFinSpeed(-1, 1);
            }
            break;
        case "righttop":
            if (update.facing > 4.71 && update.facing < 4.9) {
                shark.setFinSpeed(6, 6);
            } else {
                shark.setFinSpeed(-1, 1);
            }
            break;
        case "lefttop":
            if (update.facing > 2.95 && update.facing <= 3.14) {
                shark.setFinSpeed(6, 6);
            }
            else {
                shark.setFinSpeed(-1, 1);
            }
            break;
        case "leftbottom":
            if (update.facing > 1 && update.facing < 1.57) {
                shark.setFinSpeed(6, 6);
            } else {
                shark.setFinSpeed(-1, 1);
            }
            break;
    }
}

function closeToEdge(x: number, y: number, arena_settings: ArenaSettings) {
    const allowable_closeness = 50;
    if (x <= allowable_closeness || y <= allowable_closeness) {
        return true;
    }
    if (x >= (arena_settings.dimensions.width - allowable_closeness) || y >= (arena_settings.dimensions.height - allowable_closeness)) {
        return true;
    }
    return false;
}

function findEdge(x: number, y: number, arena_settings: ArenaSettings) {
    const allowable_closeness = 50;
    let edge = ""
    if (x <= allowable_closeness) {
        edge += "left";
    }
    if (x >= (arena_settings.dimensions.width - allowable_closeness)) {
        edge += "right";
    }
    if (y <= allowable_closeness) {
        edge += "bottom";
    };
    if (y >= arena_settings.dimensions.height - allowable_closeness) {
        edge += "top";
    }
    return edge;
}

async function getArenaSettings(arenaId: string): Promise<ArenaSettings> {
    const result = await fetch(`${api_root}/arena/${arenaId}/settings`);
    const body = await result.json();
    return body as ArenaSettings;
}

async function createArena(): Promise<PublicArenaCreated> {
    const payload = {
        arenaType: "public",
        countdownToStart: 24,
        gameLength: 720
    }
    const result = await fetch(`${api_root}/create-arena`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
    });
    const body = await result.json();
    return body as any;
}


async function createShark(arena: string, name: string) {
    const payload = {
        sharkName: name
    }
    const result = await fetch(`${api_root}/create-public-player/${arena}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
    });
    const body = await result.json();
    return body as any;
}

main();
