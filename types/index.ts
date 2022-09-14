export interface Score {
  p1: number;
  p2: number;
}

export interface Position {
  x: number;
  y: number;
};

export interface Player {
  pos: number;
  velocity: number;
};

export interface Ball {
  pos: Position;
  angle: number;
  velocity: {x: number, y:number};
}

export interface GameState {
  players: Player[];
  ball: Ball;
  score: Score;
};
