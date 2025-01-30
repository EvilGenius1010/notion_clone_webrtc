"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinoLogger = void 0;
// import { WebSocketServer } from "ws";
const WebSocket = require('ws');
// import { createRoomMS } from "./mediasoup";
exports.pinoLogger = require("pino-http");
const http = require("http");
const express = require('express');
const app = express();
const server = http.createServer(app);
// const wss = new WebSocketServer({noServer:true})
const mediasoup = require("mediasoup");
app.use(express.json());
//global middleware to allow render to accept requests from any origin.
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*" //change to website url in prod
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader("Content-Type", "application/json");
    // res.setHeader("Access-Control-Allow-Credentials", true);
    // res.setHeader("Access-Control-Allow-Private-Network", true);
    //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
    // res.setHeader("Access-Control-Max-Age", 7200);
    next();
});
app.use((req, res, next) => {
    //authentication middleware
    next();
});
app.use((0, exports.pinoLogger)());
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
const SERVER_PORT = 3000;
const mediasoupWorkers = [];
const rooms = new Map();
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Create a MediaSoup Worker
    const worker = yield mediasoup.createWorker();
    mediasoupWorkers.push(worker);
    // Handle worker lifecycle
    worker.on('died', () => {
        console.error('Mediasoup Worker died');
        process.exit(1);
    });
    console.log(`Mediasoup Worker created (pid: ${worker.pid})`);
    // Set up WebSocket server
    const wss = new WebSocket.Server({ port: SERVER_PORT });
    console.log(`WebSocket server running on ws://localhost:${SERVER_PORT}`);
    wss.on('connection', (ws) => {
        console.log('New client connected');
        ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
            const data = JSON.parse(message);
            const { action, roomId, clientId } = data;
            if (action === 'createRoom') {
                if (rooms.has(roomId)) {
                    ws.send(JSON.stringify({ error: 'Room already exists' }));
                    return;
                }
                // Create a new Router for the room
                const router = yield worker.createRouter({ mediaCodecs: [
                        {
                            kind: "audio",
                            mimeType: "audio/opus",
                            clockRate: 48000,
                            channels: 2
                        },
                        {
                            kind: "video",
                            mimeType: "video/VP8",
                            clockRate: 90000,
                            parameters: { "x-google-start-bitrate": 1000 }
                        }
                    ] });
                rooms.set(roomId, { router, peers: new Map() });
                ws.send(JSON.stringify({ action: 'roomCreated', routerRtpCapabilities: router.rtpCapabilities }));
                console.log(`Room ${roomId} created`);
            }
            if (action === 'joinRoom') {
                const room = rooms.get(roomId);
                if (!room) {
                    ws.send(JSON.stringify({ error: 'Room not found' }));
                    return;
                }
                const { router, peers } = room;
                // Create a transport for the client
                const transport = yield router.createWebRtcTransport({
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
                console.log(`Client ${clientId} joined room ${roomId}`);
            }
            if (action === 'connectTransport') {
                const { dtlsParameters } = data;
                const room = rooms.get(roomId);
                const peer = room.peers.get(clientId);
                yield peer.transport.connect({ dtlsParameters });
                ws.send(JSON.stringify({ action: 'transportConnected' }));
                console.log(`Client ${clientId} transport connected`);
            }
            if (action === 'produce') {
                const { kind, rtpParameters } = data;
                const room = rooms.get(roomId);
                const peer = room.peers.get(clientId);
                const producer = yield peer.transport.produce({ kind, rtpParameters });
                peer.producer = producer;
                ws.send(JSON.stringify({ action: 'produced', id: producer.id }));
                console.log(`Client ${clientId} started producing ${kind}`);
            }
            if (action === 'consume') {
                const { producerId } = data;
                const room = rooms.get(roomId);
                const peer = room.peers.get(clientId);
                const consumer = yield peer.transport.consume({
                    producerId,
                    rtpCapabilities: room.router.rtpCapabilities,
                });
                ws.send(JSON.stringify({
                    action: 'consumed',
                    id: consumer.id,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                }));
                console.log(`Client ${clientId} consuming ${consumer.kind}`);
            }
        }));
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
}))();
