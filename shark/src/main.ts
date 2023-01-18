import { io, Socket } from "socket.io-client";
import fetch  from "node-fetch";
import {  PlayerCreated, PublicArenaCreated } from './arena';
import { BeatUpdate, DeadBeatUpdate, SharkMode } from "./beatEvents";
import { CommandUpdate } from "./playerCommands";
import { ServerToClientEvents } from "./serverToClientEvents";

const api_root = "http://192.168.130.142:3000";
const socket: Socket<ServerToClientEvents, any> = io(api_root);
type beatUpdateDelegate = (update : BeatUpdate | DeadBeatUpdate) => void;
type commandUpdateDelegate = (update: CommandUpdate) => void;

let beatUpdate : beatUpdateDelegate = _ => {};
let commandUpdate : commandUpdateDelegate = _ => {};
const doResultLogging = false;

function logResult(result: CommandUpdate) {
    if (doResultLogging)
        console.log('**Command result**', result);
}

socket.on('commandUpdate', (update => {
    commandUpdate(update);
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
            { port: portSpeed, starboard: starboardSpeed},
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
    const arenaId = "0000-T0P4";
    const player_id = "3ab602f5-1652-44d7-bfa5-5d5b8826776f";
    //const arena = await createArena(); 
    //const player = await createShark(arenaId,"BIGRBOAT");
    //console.log(player.playerId);
    sharkControlClient.takeControl(arenaId,player_id);
    sharkControlClient.getBeatUpdate((update)=>{
        console.log(update);
    });
    //sharkControlClient.setSharkMode(arenaId,player_id,"attack")
    sharkControlClient.fireTorpedo(arenaId,player_id,Math.PI)
    sharkControlClient.fireLaser(arenaId,player_id);


    // const shark = await createShark(arena.data.arenaId,"BIGRBOAT");
}



async function createArena(): Promise<PublicArenaCreated> {
    const payload = {
        arenaType: "public",
        countdownToStart: 24,
        gameLength: 720
    }
    const result = await fetch(`${api_root}/create-arena`,{
        method:"POST",
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'}
    });
    const body = await result.json();
    return body as PublicArenaCreated;
}


async function createShark(arena:string, name:string) {
    const payload = {
        sharkName:name
    }
    const result = await fetch(`${api_root}/create-public-player/${arena}`,{
        method:"POST",
        body:JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'}
    });
    const body = await result.json();
    return body as PlayerCreated;
}

main();



