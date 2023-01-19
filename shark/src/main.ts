import { io, Socket } from "socket.io-client";
import fetch from "node-fetch";
import { ArenaSettings, PlayerCreated, PublicArenaCreated } from './arena';
import { BeatEvent, BeatUpdate, DeadBeatUpdate, narrowScanExecutedEvent, scannedShark, SharkMode } from "./beatEvents";
import { CommandUpdate } from "./playerCommands";
import { ServerToClientEvents } from "./serverToClientEvents";

const api_root = "http://192.168.130.142:3000";
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
            { port: portSpeed, starboard: starboardSpeed },
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
    lastScanBeat: 0,
};

const beatsPerSecond = 12;
const scanRateInSeconds = 0.5;

async function main() {
    const arenaId = '0006-8PUB';
    const playerId = '1af20c3a-fc6d-48f2-b656-2720f4f3dd64';
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

function scan(shark: Shark, update: BeatUpdate, arena_settings: ArenaSettings) {
    const scanRateInBeats = scanRateInSeconds * beatsPerSecond;
    const readyToScan = (update.gameTime - state.lastScanBeat) % scanRateInBeats === 0
        && update.energy > arena_settings.scan.narrowScanToll.energy;

    if (readyToScan) {
        shark.performNarrowScan(update.facing);
        state.lastScanBeat = update.gameTime;
    }
}

function getAngleTowardsCenter(update: BeatUpdate, arena_settings: ArenaSettings): number {
    const centerY = arena_settings.dimensions.height / 2;
    const centerX = arena_settings.dimensions.height / 2;

    const angleTowardsCenter = Math.atan(
        (centerY - update.centerPoint.y)
        / (centerX - update.centerPoint.x));

    const modifier = update.centerPoint.x < centerX
        ? Math.PI / 2
        : Math.PI * 1.5;

    const final = update.centerPoint.x * update.centerPoint.y >= 0
        ? modifier - angleTowardsCenter
        : modifier + angleTowardsCenter;

    return final;
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
        const nearbyShark = detectNearbyShark(update);

        if (nearbyShark) {

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
    const x = update.centerPoint.x;
    const y = update.centerPoint.y;

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
    const result = await fetch(`${api_root}/arena-settings/${arenaId}`);
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
