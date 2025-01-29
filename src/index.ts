import { WebSocketServer } from "ws";
import { Request,Response } from "express";
import { IncomingConnectionStruct, Room, UtilMessages } from "./types";
import { checkUserPermissions, createRoom } from "./utils";
const pinoLogger = require("pino-http")
const express = require('express')
const app = express();
// const wss = new WebSocket(`ws://localhost:${process.env.PORT}`)
const wss = new WebSocketServer(app)

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


wss.on('connection',(ws)=>{
    ws.on('error', console.error);
    ws.on('message',(data:IncomingConnectionStruct)=>{
        if(data.type===UtilMessages.createRoom){
          //write logic to write to db
          checkUserPermissions(data.metadata.username); //checks if such a username exists.
          const newRoom:Readonly<Room> = createRoom(data.metadata)
          //push to db

          

        }    
    })
})

app.listen(process.env.PORT,()=>{
    console.log(`Listening on port ${process.env.PORT}`)
})