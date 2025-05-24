import { v4 as uuidv4 } from 'uuid';
import { WebRTCManager } from './WebRTCManager';
import { FirestoreSignalingService } from './FirestoreSignalingService';
import type { 
  PlayerState, 
  GameSessionData, 
  WebRTCMessage, 
  SignalingData, 
  MultiplayerGameState 
} from '../types';

// Simple EventEmitter implementation for browser compatibility
class SimpleEventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  removeAllListeners(): void {
    this.events.clear();
  }
}

export class MultiplayerManager extends SimpleEventEmitter {
  private webrtc: WebRTCManager;
  private signaling: FirestoreSignalingService;
  private playerId: string;
  private gameState: MultiplayerGameState;
  private playerUpdateInterval: NodeJS.Timeout | null = null;

  constructor(userId: string) {
    super();
    // userIdが無効（null、undefined、空文字、'null'）の場合は新しいUUIDを生成
    this.playerId = (userId && userId !== 'null' && userId.trim() !== '') ? userId : uuidv4();
    console.log('MultiplayerManager: Initialized with playerId:', this.playerId);
    
    this.webrtc = new WebRTCManager(this.playerId);
    this.signaling = new FirestoreSignalingService(this.playerId);
    
    this.gameState = {
      sessionId: null,
      isHost: false,
      isConnected: false,
      connectedPlayers: [],
      gameSession: null
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // WebRTCイベントハンドラー（PeerJSベース）
    this.webrtc.on('host-ready', (peerId: string) => {
      console.log(`Multiplayer: Host ready with ID ${peerId}`);
      this.emit('host-ready');
    });

    this.webrtc.on('peer-connected', (peerId: string) => {
      this.gameState.connectedPlayers.push(peerId);
      this.emit('player-connected', peerId);
      console.log(`Multiplayer: Player ${peerId} connected`);
    });

    this.webrtc.on('peer-disconnected', (peerId: string) => {
      this.gameState.connectedPlayers = this.gameState.connectedPlayers.filter(id => id !== peerId);
      this.emit('player-disconnected', peerId);
      console.log(`Multiplayer: Player ${peerId} disconnected`);
    });

    this.webrtc.on('message', (message: WebRTCMessage) => {
      this.handleWebRTCMessage(message);
    });

    // Firestoreシグナリングイベントハンドラー
    this.signaling.on('session-updated', (sessionData: GameSessionData) => {
      this.gameState.gameSession = sessionData;
      this.handleSessionUpdate(sessionData);
    });

    this.signaling.on('signaling-data', (data: SignalingData) => {
      this.handleSignalingData(data);
    });

    this.signaling.on('available-sessions', (sessions: GameSessionData[]) => {
      this.emit('available-sessions', sessions);
    });

    this.signaling.on('session-ended', () => {
      this.handleSessionEnded();
    });
  }

  // ホストとしてセッションを作成
  async createSession(maxPlayers: number = 4): Promise<string> {
    try {
      console.log('MultiplayerManager: Creating session with playerId:', this.playerId);
      
      // 1. 初期状態をリセット
      this.gameState = {
        sessionId: null,
        isHost: false,
        isConnected: false,
        connectedPlayers: [],
        gameSession: null
      };
      
      // 2. WebRTC初期化を先に実行（セッション作成前）
      console.log('MultiplayerManager: Initializing WebRTC as host');
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebRTC host initialization timeout'));
        }, 5000);

        this.webrtc.once('host-ready', () => {
          clearTimeout(timeout);
          console.log('MultiplayerManager: WebRTC host is ready');
          resolve();
        });

        this.webrtc.initializeAsHost();
      });
      
      // 3. Firestoreでセッション作成（WebRTCが準備完了後）
      console.log('MultiplayerManager: Creating Firestore session');
      const sessionId = await this.signaling.createSession(maxPlayers);
      console.log('MultiplayerManager: Firestore session created:', sessionId);
      
      // 4. 状態を同期的に更新
      this.gameState.sessionId = sessionId;
      this.gameState.isHost = true;
      this.gameState.isConnected = true;
      console.log('MultiplayerManager: Session state synchronized:', this.gameState);
      
      // 5. セッション監視開始
      this.signaling.subscribeToSession(sessionId);
      this.startPlayerUpdateInterval();
      
      console.log(`Multiplayer: Successfully created session ${sessionId} as host`);
      this.emit('session-created', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Multiplayer: Failed to create session:', error);
      // エラー時は状態をクリア
      this.gameState = {
        sessionId: null,
        isHost: false,
        isConnected: false,
        connectedPlayers: [],
        gameSession: null
      };
      throw error;
    }
  }

  // セッションに参加
  async joinSession(sessionId: string): Promise<void> {
    try {
      console.log('MultiplayerManager: Joining session:', sessionId);
      
      // 1. 初期状態をリセット
      this.gameState = {
        sessionId: null,
        isHost: false,
        isConnected: false,
        connectedPlayers: [],
        gameSession: null
      };
      
      // 2. Firestoreからセッション情報を取得
      const sessionData = await this.signaling.joinSession(sessionId);
      console.log('MultiplayerManager: Received session data:', sessionData);
      console.log('MultiplayerManager: Current playerId:', this.playerId);
      console.log('MultiplayerManager: Host ID from session:', sessionData.hostId);
      
      // 3. 状態を同期的に更新
      this.gameState.sessionId = sessionId;
      this.gameState.isHost = false;
      this.gameState.gameSession = sessionData;
      console.log('MultiplayerManager: Session state synchronized:', this.gameState);
      
      // 4. セッション監視開始
      this.signaling.subscribeToSession(sessionId);
      this.startPlayerUpdateInterval();
      
      // 5. ホストに接続を試行（セッション情報が確定後）
      if (sessionData.hostId && sessionData.hostId !== this.playerId) {
        console.log(`MultiplayerManager: Attempting to connect to host ${sessionData.hostId}`);
        await this.webrtc.connectToPeer(sessionData.hostId);
        this.gameState.isConnected = true;
      } else {
        console.log('MultiplayerManager: No host connection needed (same player or no host)');
        this.gameState.isConnected = true;
      }
      
      console.log(`Multiplayer: Successfully joined session ${sessionId}`);
      this.emit('session-joined', sessionId);
    } catch (error) {
      console.error('Multiplayer: Failed to join session:', error);
      // エラー時は状態をクリア
      this.gameState = {
        sessionId: null,
        isHost: false,
        isConnected: false,
        connectedPlayers: [],
        gameSession: null
      };
      throw error;
    }
  }

  // セッションから離脱
  async leaveSession(): Promise<void> {
    this.stopPlayerUpdateInterval();
    this.webrtc.disconnectAll();
    await this.signaling.leaveSession();
    
    this.gameState = {
      sessionId: null,
      isHost: false,
      isConnected: false,
      connectedPlayers: [],
      gameSession: null
    };
    
    console.log('Multiplayer: Left session');
    this.emit('session-left');
  }

  // 利用可能なセッションを検索
  searchAvailableSessions(): void {
    this.signaling.subscribeToAvailableSessions();
  }

  // プレイヤーの状態を更新
  updatePlayerState(playerState: Partial<PlayerState>): void {
    if (!this.gameState.sessionId) return;

    // Firestoreに状態を保存
    this.signaling.updatePlayerState(playerState);

    // WebRTC経由で他のプレイヤーに送信
    const message: WebRTCMessage = {
      type: 'player-update',
      playerId: this.playerId,
      data: playerState,
      timestamp: Date.now()
    };
    this.webrtc.broadcast(message);
  }

  // アイテム収集イベントを送信
  broadcastItemCollected(itemId: string, position: { x: number; y: number; z: number }): void {
    const message: WebRTCMessage = {
      type: 'item-collected',
      playerId: this.playerId,
      data: { itemId, position },
      timestamp: Date.now()
    };
    this.webrtc.broadcast(message);
  }

  // ゴール到達イベントを送信
  broadcastGoalReached(goalId: string): void {
    const message: WebRTCMessage = {
      type: 'goal-reached',
      playerId: this.playerId,
      data: { goalId },
      timestamp: Date.now()
    };
    this.webrtc.broadcast(message);
  }

  // ゲームアクションを送信
  broadcastGameAction(action: string, data: any): void {
    const message: WebRTCMessage = {
      type: 'game-action',
      playerId: this.playerId,
      data: { action, ...data },
      timestamp: Date.now()
    };
    this.webrtc.broadcast(message);
  }

  // 現在のゲーム状態を取得
  getGameState(): MultiplayerGameState {
    return { ...this.gameState };
  }

  // プレイヤーリストを取得
  getPlayerStates(): Record<string, PlayerState> {
    return this.gameState.gameSession?.players || {};
  }

  // 接続状態を取得
  getConnectionStatus(): { sessionId: string | null; isHost: boolean; connectedPlayers: number } {
    return {
      sessionId: this.gameState.sessionId,
      isHost: this.gameState.isHost,
      connectedPlayers: this.gameState.connectedPlayers.length
    };
  }

  private handleWebRTCMessage(message: WebRTCMessage): void {
    switch (message.type) {
      case 'player-update':
        this.emit('player-state-updated', message.playerId, message.data);
        break;
      case 'item-collected':
        this.emit('item-collected', message.playerId, message.data);
        break;
      case 'goal-reached':
        this.emit('goal-reached', message.playerId, message.data);
        break;
      case 'game-action':
        this.emit('game-action', message.playerId, message.data);
        break;
      default:
        console.warn('Multiplayer: Unknown message type:', message.type);
    }
  }

  // PeerJSでは自動的にシグナリングが処理されるため、
  // 手動でのシグナリング処理は不要
  private handleSignalingData(data: SignalingData): void {
    console.log('Multiplayer: Signaling data received (PeerJS handles this automatically):', data);
  }

  private handleSessionUpdate(sessionData: GameSessionData): void {
    // 新しいプレイヤーが参加した場合
    const currentPlayerIds = Object.keys(this.gameState.gameSession?.players || {});
    const newPlayerIds = Object.keys(sessionData.players || {});
    
    const joinedPlayers = newPlayerIds.filter(id => 
      !currentPlayerIds.includes(id) && id !== this.playerId
    );
    
    const leftPlayers = currentPlayerIds.filter(id => 
      !newPlayerIds.includes(id) && id !== this.playerId
    );

    // 新規参加者への接続を開始（PeerJSベース）
    joinedPlayers.forEach(playerId => {
      if (this.gameState.isHost) {
        // ホストの場合、他のプレイヤーが接続してくるのを待つ
        // PeerJSでは自動的にconnection イベントで処理される
        console.log(`Multiplayer: New player ${playerId} will connect to host`);
      } else {
        // ゲストの場合、ホストに接続を試行
        this.webrtc.connectToPeer(playerId);
      }
      this.emit('player-joined', playerId);
    });

    // 離脱者の接続を切断
    leftPlayers.forEach(playerId => {
      this.webrtc.disconnectPeer(playerId);
      this.emit('player-left', playerId);
    });

    this.emit('session-updated', sessionData);
  }

  private handleSessionEnded(): void {
    this.webrtc.disconnectAll();
    this.gameState.sessionId = null;
    this.gameState.gameSession = null;
    this.gameState.connectedPlayers = [];
    this.emit('session-ended');
  }

  private startPlayerUpdateInterval(): void {
    if (this.playerUpdateInterval) {
      clearInterval(this.playerUpdateInterval);
    }

    // 100msごとにプレイヤー状態を更新
    this.playerUpdateInterval = setInterval(() => {
      this.emit('request-player-update');
    }, 100);
  }

  private stopPlayerUpdateInterval(): void {
    if (this.playerUpdateInterval) {
      clearInterval(this.playerUpdateInterval);
      this.playerUpdateInterval = null;
    }
  }

  // リソースのクリーンアップ
  async cleanup(): Promise<void> {
    this.stopPlayerUpdateInterval();
    this.webrtc.cleanup();
    await this.signaling.cleanup();
    this.removeAllListeners();
  }
}
