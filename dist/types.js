"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomEntryMethods = exports.UtilMessages = void 0;
var UtilMessages;
(function (UtilMessages) {
    UtilMessages[UtilMessages["createRoom"] = 0] = "createRoom";
    UtilMessages[UtilMessages["joinRoom"] = 1] = "joinRoom";
    UtilMessages[UtilMessages["rejoinRoom"] = 2] = "rejoinRoom";
})(UtilMessages || (exports.UtilMessages = UtilMessages = {}));
var RoomEntryMethods;
(function (RoomEntryMethods) {
    // FirstCome="First Come",
    RoomEntryMethods[RoomEntryMethods["InviteOnly"] = 0] = "InviteOnly";
})(RoomEntryMethods || (exports.RoomEntryMethods = RoomEntryMethods = {}));
