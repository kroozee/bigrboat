import { io, Socket } from "socket.io-client";
import fetch from "node-fetch";
import { ArenaSettings, PlayerCreated, PublicArenaCreated } from './arena';
import { BeatUpdate, DeadBeatUpdate, SharkMode } from "./beatEvents";
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
    if(update.status !== "succeeded"){
        console.log(update);
    }
}));

socket.on('beatUpdate', update => {
    beatUpdate(update);
    const nonProximityEvents = update.events /*.filter(e => e.event != 'proximityAlarmEvent')*/.length > 0;
    if (nonProximityEvents) {
        console.log('beat events detected', update)
    }
    else if (update.gameTime % 720 == 0) {
        console.log('1 minute beat Update', update)
    }
})

export const sharkControlClient = {

    getBeatUpdate: (delegate: beatUpdateDelegate) => beatUpdate = delegate,
    getCommandUpdate: (delegate: commandUpdateDelegate) => commandUpdate = delegate,

    doStuff: () => {
        socket.emit('doStuff', (result: CommandUpdate) => {
            commandUpdate(result);
            logResult(result);
        })
    },

    takeControl: (arenaId: string, playerId: string) => {
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

    setFinSpeed: (arenaId: string, playerId: string, portSpeed: number, starboardSpeed: number) => {
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

    setSharkMode: (arenaId: string, playerId: string, mode: SharkMode) => {
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

    performWideScan: (arenaId: string, playerId: string) => {
        socket.emit(
            'performWideScan',
            arenaId,
            playerId,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            });
    },

    fireLaser: (arenaId: string, playerId: string) => {
        socket.emit(
            'fireLaser',
            arenaId,
            playerId,
            (result: CommandUpdate) => {
                commandUpdate(result);
                logResult(result);
            });
    },

    performNarrowScan: (arenaId: string, playerId: string, angle: number) => {
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

    fireTorpedo: (arenaId: string, playerId: string, angle: number) => {
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
};

socket.on('connect', () => console.log('connected!!!!!'));
socket.connect();

async function main() {
    console.log('started');
    //const arena = await createArena(); 
    const arenaId = "0002-DYGH";
    const arena_call = await fetch(`${api_root}/arena-settings/${arenaId}`);
    const arena_settings = await arena_call.json() as ArenaSettings;
    //const player = await createShark(arenaId,"BIGRBOAT");

    const player_id = "0002-DYH2"

    //console.log(player.playerId);
    sharkControlClient.takeControl(arenaId, player_id);
    let move = false;
    const in_action = false;
    sharkControlClient.setFinSpeed(arenaId, player_id, 5, 5)

    sharkControlClient.getBeatUpdate((update: any) => {
        roam(arenaId, player_id, update, arena_settings);
    });



    // const shark = await createShark(arena.data.arenaId,"BIGRBOAT");
}

function roam(a_id: string, p_id: string, update: BeatUpdate, arena_settings: ArenaSettings) {
    //console.log(update);
    const x = update.centerPoint.x;
    const y = update.centerPoint.y;
    let left = 0;
    let right = 0;
    if (closeToEdge(x, y, arena_settings)) {
        sharkControlClient.setFinSpeed(a_id, p_id, 0, 0);
        const edge = findEdge(x, y, arena_settings);
        turn(edge!, a_id, p_id, update, arena_settings);
        //debugger;
    } else {
        sharkControlClient.setFinSpeed(a_id, p_id, 5, 5)
    }

    //
}

function turn(edge: string, a_id: string, p_id: string, update: BeatUpdate, arena_settings: ArenaSettings) {
    console.log(update.facing);
    switch (edge) {
        case "top":
            if (update.facing > 3.1 && update.facing < 3.2) {
                sharkControlClient.setFinSpeed(a_id, p_id, 5, 5);
            } else {
                sharkControlClient.setFinSpeed(a_id, p_id, 0, 5);
            }
            break;
        case "bottom":
            if (update.facing > 4.71 && update.facing < 4.72) {
                sharkControlClient.setFinSpeed(a_id, p_id, 5, 5);
            } else {
                sharkControlClient.setFinSpeed(a_id, p_id,0,5);
            }
            break;
        case "right":
            if (update.facing > 0.1 && update.facing < 0.3) {
                sharkControlClient.setFinSpeed(a_id, p_id, 5, 5);
            } else {
                sharkControlClient.setFinSpeed(a_id, p_id, 0, 5);
            }
            break;
        case "left":
            if (update.facing > 6 && update.facing <= 6.2) {
                sharkControlClient.setFinSpeed(a_id, p_id, 5, 5);
            } else {
                sharkControlClient.setFinSpeed(a_id, p_id, 5, 0);
            }
            break;
    }
}
function closeToEdge(x: number, y: number, arena_settings: ArenaSettings) {
    if (x <= 70 || y <= 70) {
        return true;
    }
    if (x >= (arena_settings.dimensions.width - 70) || y >= (arena_settings.dimensions.height - 70)) {
        return true;
    }
    return false;
}
function findEdge(x: number, y: number, arena_settings: ArenaSettings) {
    if (x <= 70) {
        return "left";
    }
    if (x >= (arena_settings.dimensions.width - 70)) {
        return "right";
    }
    if (y <= 70) {
        return "bottom";
    };
    if (y >= arena_settings.dimensions.width - 70) {
        return "top";
    }
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



