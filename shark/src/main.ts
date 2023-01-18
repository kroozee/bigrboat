import {io} from "socket.io-client";
import fetch  from "node-fetch";


const api_root = "http://192.168.130.142:3000";

async function main(){
    const arena = await createArena() as any;
    const arenaId = arena.data.arenaId;
    const socket = io(api_root);
    //const shark = await createShark(arena.data.arenaId,"BIGRBOAT");
}


async function createArena(){
    const payload = {
        arenaType: "private",
        countdownToStart: 24,
        gameLength: 720,
        players: [
            { sharkName: "joe" },
            { sharkName: "bob" }
        ]
    }
    const result = await fetch(`${api_root}/create-arena`,{
        method:"POST",
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'}
    });
    const body = await result.json();
    return body;
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
    return body;
}

main();



