import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../../hooks/useFirebase';
import type { GameSessionData, SignalingData, PlayerState } from '../types';

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

export class FirestoreSignalingService extends SimpleEventEmitter {
  private sessionId: string | null = null;
  private playerId: string;
  private unsubscribers: (() => void)[] = [];

  constructor(playerId: string) {
    super();
    this.playerId = playerId;
  }

  // ゲームセッションを作成（ホスト用）
  async createSession(maxPlayers: number = 4): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Firestore: Creating session ${sessionId} for player ${this.playerId}`);
    
    const sessionData: GameSessionData = {
      id: sessionId,
      hostId: this.playerId,
      players: {},
      maxPlayers,
      gameState: 'waiting',
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    try {
      console.log('Firestore: Writing session data to Firestore...');
      await setDoc(doc(db, 'game_sessions', sessionId), {
        ...sessionData,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      this.sessionId = sessionId;
      console.log(`Firestore: Successfully created session ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error('Firestore: Failed to create session:', error);
      throw error;
    }
  }

  // セッションに参加
  async joinSession(sessionId: string): Promise<GameSessionData> {
    try {
      console.log(`Firestore: Attempting to join session ${sessionId} as player ${this.playerId}`);
      const sessionRef = doc(db, 'game_sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        console.error(`Firestore: Session ${sessionId} not found`);
        throw new Error(`Session ${sessionId} not found`);
      }
      
      const sessionData = sessionDoc.data() as GameSessionData;
      console.log('Firestore: Found session data:', sessionData);
      
      // プレイヤーをセッションに追加
      console.log(`Firestore: Adding player ${this.playerId} to session`);
      await updateDoc(sessionRef, {
        [`players.${this.playerId}`]: {
          id: this.playerId,
          position: { x: 280, y: 5, z: -123 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          points: 0,
          patience: 0,
          isGameOver: false,
          lastUpdate: Date.now()
        },
        lastActivity: serverTimestamp()
      });

      this.sessionId = sessionId;
      console.log(`Firestore: Successfully joined session ${sessionId}`);
      return sessionData;
    } catch (error) {
      console.error(`Firestore: Failed to join session ${sessionId}:`, error);
      throw error;
    }
  }

  // セッションから離脱
  async leaveSession(): Promise<void> {
    if (!this.sessionId) return;

    try {
      const sessionRef = doc(db, 'game_sessions', this.sessionId);
      
      // プレイヤーをセッションから削除
      const batch = writeBatch(db);
      batch.update(sessionRef, {
        [`players.${this.playerId}`]: null,
        lastActivity: serverTimestamp()
      });

      await batch.commit();
      
      console.log(`Firestore: Left session ${this.sessionId}`);
      this.sessionId = null;
    } catch (error) {
      console.error('Firestore: Failed to leave session:', error);
    }
  }

  // シグナリングデータを送信
  async sendSignalingData(data: Omit<SignalingData, 'timestamp'>): Promise<void> {
    if (!this.sessionId) {
      console.warn('Firestore: No active session for signaling');
      return;
    }

    try {
      const signalingRef = doc(collection(db, 'signaling'));
      await setDoc(signalingRef, {
        ...data,
        sessionId: this.sessionId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Firestore: Failed to send signaling data:', error);
    }
  }

  // プレイヤーの状態を更新
  async updatePlayerState(playerState: Partial<PlayerState>): Promise<void> {
    if (!this.sessionId) return;

    try {
      const sessionRef = doc(db, 'game_sessions', this.sessionId);
      await updateDoc(sessionRef, {
        [`players.${this.playerId}`]: {
          ...playerState,
          id: this.playerId,
          lastUpdate: Date.now()
        },
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Firestore: Failed to update player state:', error);
    }
  }

  // セッション状態を監視
  subscribeToSession(sessionId: string): void {
    this.unsubscribeAll();
    this.sessionId = sessionId;

    // セッションデータの監視
    const sessionRef = doc(db, 'game_sessions', sessionId);
    const unsubscribeSession = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data() as GameSessionData;
        this.emit('session-updated', sessionData);
      } else {
        console.warn('Firestore: Session not found');
        this.emit('session-ended');
      }
    }, (error) => {
      console.error('Firestore: Session subscription error:', error);
      this.emit('session-error', error);
    });

    // シグナリングデータの監視
    const signalingQuery = query(
      collection(db, 'signaling'),
      where('sessionId', '==', sessionId),
      where('targetPlayerId', 'in', [this.playerId, 'all'])
    );

    const unsubscribeSignaling = onSnapshot(signalingQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as SignalingData;
          
          // 自分が送信したシグナリングデータは無視
          if (data.playerId !== this.playerId) {
            this.emit('signaling-data', data);
          }

          // 処理済みのシグナリングデータを削除
          deleteDoc(change.doc.ref).catch(console.error);
        }
      });
    }, (error) => {
      console.error('Firestore: Signaling subscription error:', error);
    });

    this.unsubscribers.push(unsubscribeSession, unsubscribeSignaling);
  }

  // 利用可能なセッションを検索
  subscribeToAvailableSessions(): void {
    const sessionsQuery = query(
      collection(db, 'game_sessions'),
      where('gameState', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const availableSessions: GameSessionData[] = [];
      
      snapshot.forEach((doc) => {
        const sessionData = doc.data() as GameSessionData;
        const playerCount = Object.keys(sessionData.players || {}).length;
        
        // プレイヤー数が上限未満のセッションのみ
        if (playerCount < sessionData.maxPlayers) {
          availableSessions.push(sessionData);
        }
      });

      this.emit('available-sessions', availableSessions);
    }, (error) => {
      console.error('Firestore: Available sessions subscription error:', error);
    });

    this.unsubscribers.push(unsubscribe);
  }

  // 全ての購読を解除
  unsubscribeAll(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }

  // リソースのクリーンアップ
  async cleanup(): Promise<void> {
    this.unsubscribeAll();
    await this.leaveSession();
    this.removeAllListeners();
  }
}
