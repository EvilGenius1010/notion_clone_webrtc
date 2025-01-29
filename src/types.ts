export type IncomingConnectionStruct = {
    type:UtilMessages,
    metadata:Metadata
}

type Metadata={
    username:string,
    timestamp:Date,
    roomEntry:RoomEntryMethods,
    roomMembers:string[3]
}

export enum UtilMessages {
    createRoom,
    joinRoom,
    rejoinRoom
}

export enum RoomEntryMethods{
    // FirstCome="First Come",
    InviteOnly
}

// type FirstComeStruct={
//     limit:3,
//     roomOwner:string
//     creationTime:Date
// }

type InviteOnlyStruct={
    limit:3,
    roomOwner:string,
    creationTime:Date
    invitedMembers:string
}

export type Room ={
    roomId:string,
    roomOwner:Readonly<string>,
    limit:3,
    creationTime:Date,
    RoomEntryMethods:Readonly<RoomEntryMethods>,
    RoomMembers:string[3],
}