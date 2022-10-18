import { Server } from 'socket.io';
import { createServer } from "http";
import { createGameState, gameLoop } from './game';
// import { nanoid } from 'nanoid';

const httpServer = createServer();



const state:  {[k: string]: any} = {};
const clientRooms:  {[k: string]: any}  = {};


const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
});

httpServer.listen(3333);

io.on("connection", client => {

  client.on("keydown", handleKeyDown);
  client.on("keyup", handleKeyUp);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  function handleNewGame() {
    const roomName = "5";
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    state[roomName] = createGameState();

    client.join(roomName);
    (client as any).number = 1;
    client.emit("init", 1);
  }

  function handleJoinGame(gameCode: string) {
    const room = io.sockets.adapter.rooms.get(gameCode);
    let numClients = 0;
    if (room){
      numClients = room.size;
    }
    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }
    clientRooms[client.id] = gameCode;
    client.join(gameCode);
    (client as any).number = 2;
    client.emit("init", 2);

    startGameInterval(gameCode);

  }

  function handleKeyDown(key: string): void {
    const roomName = clientRooms[client.id];
    
    if (!roomName) {
      return;
    }
    
    if (key == "ArrowUp") {
      
      state[roomName].players[(client as any).number - 1].velocity = -10; 
      
    } else if (key == "ArrowDown") {
      state[roomName].players[(client as any).number - 1].velocity = 10; 
    }

  }

  function handleKeyUp(key: string): void {

    const roomName = clientRooms[client.id];
    
    if (!roomName) {
      return;
    }

    if (key === "ArrowUp" || key === "ArrowDown") {
      state[roomName].players[(client as any).number - 1].velocity = 0; 
    }
  }



})

function startGameInterval(roomName: string) {
  const intervalId = setInterval(() => {

    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner)
      state[roomName] = null;
      clearInterval(intervalId);
    }


  }, 1000 / 60);
}

function emitGameState(roomName: string, state: string) {
  io.sockets.in(roomName).emit("gameState", JSON.stringify(state));
}

function emitGameOver(roomName: string, winner: number) {
  io.sockets.in(roomName).emit("gameOver", JSON.stringify({ winner }));
}
