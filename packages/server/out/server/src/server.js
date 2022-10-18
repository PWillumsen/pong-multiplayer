"use strict";
exports.__esModule = true;
var socket_io_1 = require("socket.io");
var http_1 = require("http");
var game_1 = require("./game");
var nanoid_1 = require("nanoid");
var httpServer = (0, http_1.createServer)();
var state = {};
var clientRooms = {};
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});
httpServer.listen(3333);
io.on("connection", function (client) {
    client.on("keydown", handleKeyDown);
    client.on("keyup", handleKeyUp);
    client.on("newGame", handleNewGame);
    client.on("joinGame", handleJoinGame);
    function handleNewGame() {
        var roomName = (0, nanoid_1.nanoid)(7);
        clientRooms[client.id] = roomName;
        client.emit("gameCode", roomName);
        state[roomName] = (0, game_1.createGameState)();
        client.join(roomName);
        client.number = 1;
        client.emit("init", 1);
    }
    function handleJoinGame(gameCode) {
        var room = io.sockets.adapter.rooms.get(gameCode);
        console.log(room);
        var allUsers = {};
        if (room) {
            allUsers = room;
        }
        var numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }
        if (numClients === 0) {
            client.emit("unknownCode");
            return;
        }
        else if (numClients > 1) {
            client.emit("tooManyPlayers");
            return;
        }
        clientRooms[client.id] = gameCode;
        client.join(gameCode);
        client.number = 2;
        client.emit("init", 2);
        startGameInterval(gameCode);
    }
    function handleKeyDown(key) {
        var roomName = clientRooms[client.id];
        if (!roomName) {
            return;
        }
        if (key == "ArrowUp") {
            state[roomName].players[client.number - 1].velocity = -10;
        }
        else if (key == "ArrowDown") {
            state[roomName].players[client.number - 1].velocity = 10;
        }
    }
    function handleKeyUp(key) {
        var roomName = clientRooms[client.id];
        if (key === "ArrowUp" || key === "ArrowDown") {
            state[roomName].players[client.number - 1].velocity = 0;
        }
    }
});
function startGameInterval(roomName) {
    var intervalId = setInterval(function () {
        var winner = (0, game_1.gameLoop)(state[roomName]);
        if (!winner) {
            emitGameState(roomName, state[roomName]);
        }
        else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / 60);
}
function emitGameState(roomName, state) {
    io.sockets["in"](roomName).emit("gameState", JSON.stringify(state));
}
function emitGameOver(roomName, winner) {
    io.sockets["in"](roomName).emit("gameOver", JSON.stringify({ winner: winner }));
}
