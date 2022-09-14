import { io } from "socket.io-client";
import type { GameState } from '../../types';

const BAT_COLOR = "#ADADAD"
const BG_COLOR = "#282828"
const BAT_HEIGHT = 100;
const BAT_WIDTH = 10;
const BALL_SIZE = 10;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 585

const socket = io("http://localhost:3333");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameover", handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on("debug", handleDebug);

const initialScreen = document.getElementById("initialScreen");
const gameScreen = document.getElementById("gameScreen");
const newGameButton = document.getElementById("newGameButton");
const joinGameButton = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput") as HTMLInputElement;
const gameCodeDisplay = document.getElementById("roomCodeDisplay");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let playerNumber: string | null;
let gameActive = false;

newGameButton?.addEventListener("click", newGame);
joinGameButton?.addEventListener("click", joinGame);

function newGame(e: { preventDefault: () => void; }) {
  e.preventDefault();
  socket.emit("newGame");
  init();
}

function joinGame(e: { preventDefault: () => void; }) {
  e.preventDefault();
  const gameCode = gameCodeInput.value;
  socket.emit("joinGame", gameCode);
  init();
}

function init(): void {

  
  initialScreen!.style.display = "none";
  gameScreen!.style.display = "block";


  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  document.addEventListener("keydown", keydownHandler)
  document.addEventListener("keyup", keyupHandler)

  paintBoard();
  gameActive = true;
}


function paintBoard() {

  // Background and bats
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Center line
  ctx.strokeStyle = BAT_COLOR;
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
}

function keydownHandler(e: KeyboardEvent) {
  socket.emit('keydown', e.key);
}


function keyupHandler(e: KeyboardEvent) {
  socket.emit('keyup', e.key);
}

function paintGame(state: GameState) {


  const { players, ball, score } = state;
  const p1 = players[0];
  const p2 = players[1];

  paintBoard();

  // Bats
  ctx.fillStyle = BAT_COLOR;
  ctx.fillRect(20, p1.pos, BAT_WIDTH, BAT_HEIGHT);
  ctx.fillRect(CANVAS_WIDTH - 20 - BAT_WIDTH, p2.pos, BAT_WIDTH, BAT_HEIGHT);

  // Ball
  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.arc(ball.pos.x, ball.pos.y!, BALL_SIZE, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Score
  ctx.font = '48px serif';
  ctx.fillText(`${score.p1}`, 50, 50);
  ctx.fillText(`${score.p2}`, CANVAS_WIDTH - 80, 50);

}


function handleInit(number: string): void {
  playerNumber = number
}


function handleGameState(state: string): void {
  if (!gameActive) {
    return
  }
  state = JSON.parse(state);
  requestAnimationFrame(() => {
    paintGame(state as unknown as GameState)
  })
}

function handleGameOver(data: string) {
  if (!gameActive) {
    return
  }
  data = JSON.parse(data);
  
  if ((data as any).winner === playerNumber) {
    alert("you win")
  } else {
    alert("you lose")
  }
  
  gameActive = false;
}

function handleGameCode(gameCode: string) {
  gameCodeDisplay!.innerText = gameCode;
}

function handleUnknownCode() { reset(); alert("unknown code") }
function handleTooManyPlayers() { reset(); alert("game full") }

function reset(){
  playerNumber = null;
  gameCodeInput.value = "";
  gameCodeDisplay!.innerText = "";
  initialScreen!.style.display = "block";
  gameScreen!.style.display = "none";
}