export type IncomingConnectionStruct = {
    type:UtilMessages,

}

export enum UtilMessages {
    createRoom,
    joinRoom,
    rejoinRoom
}

export enum RoomEntryMethods{
    FirstCome="First Come",
    InviteOnly="Invite Only"
}

type FirstComeStruct={
    limit:3,
    roomOwner:string
    creationTime:Date
}

type InviteOnlyStruct={
    limit:3,
    roomOwner:string,
    creationTime:Date
    invitedMembers:string
}

type Room ={
    roomOwner:Readonly<string>,
    limit:3,
    creationTime:Date,
    RoomEntryMethods:Readonly<RoomEntryMethods>,
    RoomMembers:string,


}