import { RoomEntryMethods,Room, IncomingConnectionStruct } from "./types"

const uniqid = require('uniqid')

export function createRoom(metadata:IncomingConnectionStruct["metadata"]):Readonly<Room>{
    const roomid =  uniqid.time(metadata.username)
    const newRoom:Readonly<Room> =  {
        roomOwner:metadata.username,
        creationTime:metadata.timestamp,
        RoomEntryMethods:metadata.roomEntry,
        RoomMembers:metadata.roomMembers,
        limit:3,
        roomId:roomid
    }
    return newRoom
}

export function checkUserPermissions(username:string){

}

//username:string,memberEntryMethods:RoomEntryMethods,timestamp:Date