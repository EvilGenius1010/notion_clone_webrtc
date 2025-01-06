import { RoomEntryMethods } from "./types"

const uniqid = require('uniqid')

export function createRoom(username:string,memberEntryMethods:RoomEntryMethods){
    const roomid =  uniqid.time(username)

}


//