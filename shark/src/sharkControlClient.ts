import { io, Socket } from "socket.io-client";
import { BeatUpdate, DeadBeatUpdate } from "./beatEvents";
import { CommandUpdate } from "./playerCommands";
import { ServerToClientEvents } from "./serverToClientEvents";

const socket: Socket<ServerToClientEvents, SharkCommands> = io();
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
}
type SharkCommands = {
    getBeatUpdate:()=> beatUpdateDelegate;
    getCommandUpdate: ()=> commandUpdateDelegate;
    doStuff: ()=> void;
    takeControl
    setFinSpeed
    setSharkMode
    performWideScan
    fireLaser
    performNarrowScan
    fireTorpedo
}