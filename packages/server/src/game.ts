import type { GameState } from "@pong-socket/types";

const FRAME_RATE = 20;
const BAT_HEIGHT = 100;
const CANVAS_HEIGHT = 585;
const CANVAS_WIDTH = 800;

function createGameState(): GameState {

  return {
    players: [{
      pos:
        200, velocity: 0,
    }, {
      pos:
        100, velocity: 0,
    }], ball: {
      pos:
        { x: 100, y: 100 }, angle: -0.25 * Math.PI, velocity: {x: 10, y: 10},
    },
    score: { p1: 0, p2: 0 }
  };

}

function gameLoop(state: GameState): number {

  const { players, ball, score } = state;
  const p1 = players[0];
  const p2 = players[1];

  p1.pos += p1.velocity;
  p2.pos += p2.velocity;


  
  // Check bat for out of bounds
  if (p1.pos < 0) {
    p1.pos = 0;
  }
  if (p2.pos < 0) {
    p2.pos = 0;
  }
  if (p1.pos + BAT_HEIGHT > CANVAS_HEIGHT) {
    p1.pos = CANVAS_HEIGHT - BAT_HEIGHT;
    p1.velocity = 0;
  }
  if (p2.pos + BAT_HEIGHT > CANVAS_HEIGHT) {
    p2.pos = CANVAS_HEIGHT - BAT_HEIGHT;
    p2.velocity = 0;
  }


  // detectCollision(state);

  // Did ball hit paddle?
  if (p1.pos < ball.pos.y && ball.pos.y < p1.pos + BAT_HEIGHT && ball.pos.x < 30) {
    ball.velocity.x *= -1;
  }
  if (p2.pos < ball.pos.y && ball.pos.y < p2.pos + BAT_HEIGHT && ball.pos.x > CANVAS_WIDTH - 30) {
    ball.velocity.x *= -1;
  }

  
  // update ball pos
  ball.pos.x += Math.sin(ball.angle) * ball.velocity.x;
  ball.pos.y += Math.cos(ball.angle) * ball.velocity.y;

  if (ball.pos.y < 0 || ball.pos.y > CANVAS_HEIGHT) {
    ball.velocity.y *= -1;
  }
  
  
  // Check if goal
  if (ball.pos.x < 5) {
    score.p2 += 1;
    resetObjects(state);
  }
  if (ball.pos.x > CANVAS_WIDTH - 5) {
    score.p1 += 1;
    resetObjects(state);
  }

  // if (score.p1 === 3){
  //   return 1
  // } else if (score.p2 === 3){
  //   return 2
  // }else {
  //   return 0
  // }
  return 0
}

function resetObjects(state: GameState) {

  const { ball, players } = state;
  const p1 = players[0];
  const p2 = players[1];

  ball.pos.x = CANVAS_WIDTH / 2;
  ball.pos.y = CANVAS_HEIGHT / 2;
  ball.velocity.x = (Math.random() < 0.5) ? 10 : -10;
  ball.velocity.y = (Math.random() < 0.5) ? 10 : -10;
  ball.angle = (Math.random() > 0.5 ? 1 : -1) * Math.random() *1.5;
  p1.pos = CANVAS_HEIGHT / 2;
  p2.pos = CANVAS_HEIGHT / 2;

}


function detectCollision(state: GameState): number {
  return 0
}

export { FRAME_RATE, createGameState, gameLoop };