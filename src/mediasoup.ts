// import { Room } from "./types";

// const mediasoup = require("mediasoup")

// export async function createRoomMS(roomCreated:Map<any,any>,mediaSoupWorkers:any,roomData:Readonly<Room>){
    
//     const worker = await mediasoup.createWorker();
//     mediaSoupWorkers.push(worker)

//     // Handle worker lifecycle
//     worker.on('died', () => {
//         console.error('Mediasoup Worker died');
//         process.exit(1);
//     });
//     // console.log(`Mediasoup Worker created (pid: ${worker.pid})`);

//     //create router for the room
//     const router = await worker.createRouter({ mediaCodecs: [] }); // No audio/video, only data



//     roomCreated.set(roomData,{router})

//     return {roomCreated,mediaSoupWorkers}

// }

// // export async function 

