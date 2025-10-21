// Contract Types
export interface Competition {
  session_id: number;
  deadline: number;
  status: number;
  prize_pool: string;
  total_players: number;
  entry_fee: string;
}

export interface PlayerScore {
  player: string;
  total_games: number;
  total_score: number;
  rank: number;
}

// Game Types
export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isPlaying: boolean;
  isGameOver: boolean;
  speed: number;
}

// Contract Config
export const CONTRACT_CONFIG = {
  contractId: 'CD2GSUPIR2GW3Q2AMD5UJ2YHJIO546G2LZEKMTG6C3EKBUWWZAQ6DF7O',
  network: 'testnet',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
};

// Game Config
export const GAME_CONFIG = {
  gridSize: 20,
  cellSize: 25,
  initialSpeed: 150,
  speedIncrement: 5,
  maxSpeed: 50,
};