import { useState, useEffect, useCallback, useRef } from 'react';
import { MultiplayerManager } from '../services/MultiplayerManager';
import type { 
  PlayerState, 
  GameSessionData, 
  MultiplayerGameState 
} from '../types';

export function useMultiplayer(userId: string) {
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerGameState>({
    sessionId: null,
    isHost: false,
    isConnected: false,
    connectedPlayers: [],
    gameSession: null
  });

  const [remotePlayers, setRemotePlayers] = useState<Record<string, PlayerState>>({});
  const [availableSessions, setAvailableSessions] = useState<GameSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const managerRef = useRef<MultiplayerManager | null>(null);

  // MultiplayerManagerの初期化
  useEffect(() => {
    console.log('useMultiplayer: Effect triggered with userId:', userId);
    // userIdが有効でManagerがまだ作成されていない場合のみ作成
    if (userId && userId !== 'null' && userId.trim() !== '' && !managerRef.current) {
      console.log('useMultiplayer: Creating MultiplayerManager for userId:', userId);
      managerRef.current = new MultiplayerManager(userId);
      setupEventListeners();
    } else {
      console.log('useMultiplayer: Skipping manager creation. userId:', userId, 'managerExists:', !!managerRef.current);
    }

    return () => {
      if (managerRef.current) {
        console.log('useMultiplayer: Cleaning up MultiplayerManager');
        managerRef.current.cleanup();
        managerRef.current = null;
      }
    };
  }, [userId]);

  const setupEventListeners = useCallback(() => {
    const manager = managerRef.current;
    if (!manager) return;

    // セッションイベント
    manager.on('session-created', (sessionId: string) => {
      setMultiplayerState(prev => ({ 
        ...prev, 
        sessionId, 
        isHost: true, 
        isConnected: true 
      }));
      setIsLoading(false);
      setError(null);
    });

    manager.on('session-joined', (sessionId: string) => {
      setMultiplayerState(prev => ({ 
        ...prev, 
        sessionId, 
        isHost: false, 
        isConnected: true 
      }));
      setIsLoading(false);
      setError(null);
    });

    manager.on('session-left', () => {
      setMultiplayerState({
        sessionId: null,
        isHost: false,
        isConnected: false,
        connectedPlayers: [],
        gameSession: null
      });
      setRemotePlayers({});
    });

    manager.on('session-updated', (sessionData: GameSessionData) => {
      setMultiplayerState(prev => ({ 
        ...prev, 
        gameSession: sessionData 
      }));
      
      // リモートプレイヤーの状態を更新
      const players = { ...sessionData.players };
      delete players[userId]; // 自分のデータは除外
      setRemotePlayers(players);
    });

    manager.on('session-ended', () => {
      setMultiplayerState(prev => ({ 
        ...prev, 
        isConnected: false, 
        sessionId: null 
      }));
      setError('Session ended');
    });

    // プレイヤーイベント
    manager.on('player-connected', (playerId: string) => {
      setMultiplayerState(prev => ({
        ...prev,
        connectedPlayers: [...prev.connectedPlayers, playerId]
      }));
    });

    manager.on('player-disconnected', (playerId: string) => {
      setMultiplayerState(prev => ({
        ...prev,
        connectedPlayers: prev.connectedPlayers.filter(id => id !== playerId)
      }));
      
      setRemotePlayers(prev => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
    });

    manager.on('player-state-updated', (playerId: string, playerState: Partial<PlayerState>) => {
      setRemotePlayers(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], ...playerState } as PlayerState
      }));
    });

    // セッション検索
    manager.on('available-sessions', (sessions: GameSessionData[]) => {
      setAvailableSessions(sessions);
    });

    // エラーイベント
    manager.on('error', (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    });

  }, [userId]);

  // セッション作成
  const createSession = useCallback(async (maxPlayers: number = 4) => {
    console.log('useMultiplayer: createSession called with maxPlayers:', maxPlayers);
    if (!managerRef.current) {
      console.error('useMultiplayer: No MultiplayerManager available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('useMultiplayer: Calling manager.createSession...');
      await managerRef.current.createSession(maxPlayers);
      console.log('useMultiplayer: Session creation completed');
    } catch (error) {
      console.error('useMultiplayer: Session creation failed:', error);
      setError(`Failed to create session: ${error}`);
      setIsLoading(false);
    }
  }, []);

  // セッション参加
  const joinSession = useCallback(async (sessionId: string) => {
    if (!managerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await managerRef.current.joinSession(sessionId);
    } catch (error) {
      setError(`Failed to join session: ${error}`);
      setIsLoading(false);
    }
  }, []);

  // セッション離脱
  const leaveSession = useCallback(async () => {
    if (!managerRef.current) return;

    try {
      await managerRef.current.leaveSession();
    } catch (error) {
      setError(`Failed to leave session: ${error}`);
    }
  }, []);

  // 利用可能なセッションを検索
  const searchSessions = useCallback(() => {
    if (!managerRef.current) return;
    managerRef.current.searchAvailableSessions();
  }, []);

  // プレイヤー状態の更新
  const updatePlayerState = useCallback((playerState: Partial<PlayerState>) => {
    if (!managerRef.current) return;
    managerRef.current.updatePlayerState(playerState);
  }, []);

  // アイテム収集のブロードキャスト
  const broadcastItemCollected = useCallback((itemId: string, position: { x: number; y: number; z: number }) => {
    if (!managerRef.current) return;
    managerRef.current.broadcastItemCollected(itemId, position);
  }, []);

  // ゴール到達のブロードキャスト
  const broadcastGoalReached = useCallback((goalId: string) => {
    if (!managerRef.current) return;
    managerRef.current.broadcastGoalReached(goalId);
  }, []);

  // ゲームアクションのブロードキャスト
  const broadcastGameAction = useCallback((action: string, data: any) => {
    if (!managerRef.current) return;
    managerRef.current.broadcastGameAction(action, data);
  }, []);

  // 接続状態の取得
  const getConnectionStatus = useCallback(() => {
    if (!managerRef.current) return { sessionId: null, isHost: false, connectedPlayers: 0 };
    return managerRef.current.getConnectionStatus();
  }, []);

  return {
    // 状態
    multiplayerState,
    remotePlayers,
    availableSessions,
    isLoading,
    error,

    // アクション
    createSession,
    joinSession,
    leaveSession,
    searchSessions,
    updatePlayerState,
    broadcastItemCollected,
    broadcastGoalReached,
    broadcastGameAction,
    getConnectionStatus,

    // 状態チェック用のヘルパー
    isConnected: multiplayerState.isConnected,
    isHost: multiplayerState.isHost,
    sessionId: multiplayerState.sessionId,
    connectedPlayersCount: multiplayerState.connectedPlayers.length,
    remotePlayersCount: Object.keys(remotePlayers).length
  };
}
