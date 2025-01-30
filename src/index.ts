import { WebSocketServer } from "ws";
import { createServer } from 'http';
import { Request,Response } from "express";
import { IncomingConnectionStruct, Room, UtilMessages } from "./types";
import { checkUserPermissions, createRoom } from "./utils";
// import { createRoomMS } from "./mediasoup";
export const pinoLogger = require("pino-http")
const http = require("http");
const express = require('express')
const app = express();
const server = http.createServer(app)
const wss = new WebSocketServer({noServer:true})


app.use(express.json())

//global middleware to allow render to accept requests from any origin.
app.use((req: Request, res: Response, next: any) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*" //change to website url in prod
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Content-Type", "application/json")
  // res.setHeader("Access-Control-Allow-Credentials", true);
  // res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  // res.setHeader("Access-Control-Max-Age", 7200);

  next();
});

app.use((req: Request, res: Response, next: any) => {
//authentication middleware

next();
})

app.use(pinoLogger())





// wss.on('connection',(ws)=>{
//     ws.on('error', console.error);

//     ws.on('message',(data:any)=>{ //remove the any
//         // let inputData = data as IncomingConnectionStruct
//         const data1 = data as IncomingConnectionStruct
//         if(data1.type===UtilMessages.createRoom){
//           app.log.info("Testing pino logger")
//           // createRoom()
//         }

//         else if(data1.type===UtilMessages.joinRoom){
  //             //check if corresponds to invites sent out.
  //         }
  //         else if(data1.type===UtilMessages.rejoinRoom){
//             //check if already exists in array of ppl whove been sent invites or have previously joined
//         }


//     })
// })

const mediasoup = require("mediasoup")
const SERVER_PORT=8080;
const rooms: Map<string, { router: mediasoup.Router, peers: Map<string, any> }> = new Map();
const mediasoupWorkers = [];


(async()=>{

    // Create a MediaSoup Worker
    const worker = await mediasoup.createWorker();
    mediasoupWorkers.push(worker);
  
    // Handle worker lifecycle
    worker.on('died', () => {
      console.error('Mediasoup Worker died');
      process.exit(1);
    });
  
    console.log(`Mediasoup Worker created (pid: ${worker.pid})`);

    const app = express();
    const server = createServer(app); // Create HTTP server from Express app
  
    // Create a WebSocket server with `noServer: true`
    const wss = new WebSocketServer({ noServer: true });
  
    console.log(`WebSocket server will run on ws://localhost:${SERVER_PORT}/ws`);
  


     // WebSocket upgrade handling
  server.on('upgrade', (request, socket, head) => {
    if (request.url === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy(); // Close connection if not intended for WebSocket
    }
  });

  wss.on('connection',(ws)=>{
    
  ws.on('error', console.error);
  ws.on('message',async(data:IncomingConnectionStruct)=>{
    if(data.type===UtilMessages.createRoom){
          //write logic to write to db
          checkUserPermissions(data.metadata.username); //checks if such a username exists.
          const newRoom:Readonly<Room> = createRoom(data.metadata)
          //check if roomId already exists and if not, then push to db.
          // const { roomCreated, mediaSoupWorkers } = await createRoomMS(rooms, workers, newRoom);
          // rooms=roomCreated
        

          //create router for the room
          const router = await worker.createRouter({ mediaCodecs: [] }); // No audio/video, only data

          rooms.set(newRoom.roomId,{router,peers:newRoom.RoomMembers})

          pinoLogger.info(`Room created with roomID ${newRoom.roomId}.`)
          ws.send(JSON.stringify({ action: 'roomCreated', routerRtpCapabilities: router.rtpCapabilities }));
          return {router}
        }   
        
        if(data.type===UtilMessages.joinRoom){
          //check if allowed to join by querying db
          //get info of room from db
          
          const { router, peers } = rooms;

          // Create a transport for the client
          const transport = await router.createWebRtcTransport({
            listenIps: [{ ip: '127.0.0.1', announcedIp: null }], // Replace with your server's IP
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
          });
  
          // Save the client's transport
          peers.set(clientId, { transport });
          ws.send(JSON.stringify({
            action: 'joinedRoom',
            transportOptions: {
              id: transport.id,
              iceParameters: transport.iceParameters,
              iceCandidates: transport.iceCandidates,
              dtlsParameters: transport.dtlsParameters,
            },
          }));
        }
    })
})

app.listen(8080,()=>{
    console.log(`Listening on port 8080`)
})
        })()