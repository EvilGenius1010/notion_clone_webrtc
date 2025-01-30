"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.checkUserPermissions = checkUserPermissions;
const uniqid = require('uniqid');
function createRoom(metadata) {
    const roomid = uniqid.time(metadata.username);
    const newRoom = {
        roomOwner: metadata.username,
        creationTime: metadata.timestamp,
        RoomEntryMethods: metadata.roomEntry,
        RoomMembers: metadata.roomMembers,
        limit: 3,
        roomId: roomid
    };
    return newRoom;
}
function checkUserPermissions(username) {
}
//username:string,memberEntryMethods:RoomEntryMethods,timestamp:Date
