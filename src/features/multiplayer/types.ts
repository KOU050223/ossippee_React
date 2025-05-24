// Multiplayer Types
export interface PlayerState {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  points: number;
  patience: number;
  isGameOver: boolean;
  lastUpdate: number;
}

export interface GameSessionData {
  id: string;
  hostId: string;
  players: Record<string, PlayerState>;
  maxPlayers: number;
  gameState: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  lastActivity: number;
}

export interface WebRTCMessage {
  type: 'player-update' | 'item-collected' | 'goal-reached' | 'game-action';
  playerId: string;
  data: any;
  timestamp: number;
}

export interface SignalingData {
  type: 'offer' | 'answer' | 'ice-candidate' | 'player-joined' | 'player-left';
  sessionId: string;
  playerId: string;
  targetPlayerId?: string;
  data: any;
  timestamp: number;
}

export interface MultiplayerGameState {
  sessionId: string | null;
  isHost: boolean;
  isConnected: boolean;
  connectedPlayers: string[];
  gameSession: GameSessionData | null;
}
