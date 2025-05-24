import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { WebRTCMessage } from '../types';

// Simple EventEmitter implementation for browser compatibility
class SimpleEventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  once(event: string, listener: Function): void {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    this.on(event, onceWrapper);
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

export class WebRTCManager extends SimpleEventEmitter {
  private connections: Map<string, DataConnection> = new Map();
  private localPlayerId: string;
  private peer: Peer | null = null;

  constructor(playerId: string) {
    super();
    this.localPlayerId = playerId;
    console.log('WebRTCManager: Initialized with playerId:', this.localPlayerId);
  }

  // ホストとしてセッションを開始
  initializeAsHost(): void {
    console.log('WebRTC: Initializing as host with ID:', this.localPlayerId);
    
    // 既存のpeerがある場合はクリーンアップ
    if (this.peer) {
      this.peer.destroy();
    }
    
    this.peer = new Peer(this.localPlayerId);
    
    this.peer.on('open', (id) => {
      console.log('WebRTC: Host peer connected with ID:', id);
      this.emit('host-ready', id);
    });

    this.peer.on('connection', (conn) => {
      console.log('WebRTC: Incoming connection from:', conn.peer);
      this.handleIncomingConnection(conn);
    });

    this.peer.on('error', (error) => {
      console.error('WebRTC Host Error:', error);
      this.emit('error', error);
    });

    this.peer.on('disconnected', () => {
      console.log('WebRTC: Host peer disconnected, attempting to reconnect');
      this.peer?.reconnect();
    });
  }

  // ピアとして他のプレイヤーに接続
  async connectToPeer(peerId: string): Promise<void> {
    console.log(`WebRTC: Attempting to connect to peer ${peerId}`);
    if (!this.peer) {
      console.log('WebRTC: Creating new peer for connection');
      this.peer = new Peer(this.localPlayerId);
      
      await new Promise<void>((resolve, reject) => {
        this.peer!.on('open', () => {
          console.log('WebRTC: Peer opened, ready to connect');
          resolve();
        });
        this.peer!.on('error', (error) => {
          console.error('WebRTC: Peer initialization error:', error);
          reject(error);
        });
      });
    }

    try {
      console.log(`WebRTC: Initiating connection to ${peerId}`);
      const conn = this.peer.connect(peerId);
      this.handleOutgoingConnection(conn, peerId);
    } catch (error) {
      console.error('WebRTC: Failed to connect to peer', peerId, error);
      this.emit('connection-failed', peerId, error);
    }
  }

  private handleIncomingConnection(conn: DataConnection): void {
    const peerId = conn.peer;
    console.log('WebRTC: Incoming connection from', peerId);

    conn.on('open', () => {
      console.log('WebRTC: Connection established with', peerId);
      this.connections.set(peerId, conn);
      this.emit('peer-connected', peerId);
    });

    conn.on('data', (data: any) => {
      this.handleMessage(peerId, data as WebRTCMessage);
    });

    conn.on('close', () => {
      console.log('WebRTC: Connection closed with', peerId);
      this.connections.delete(peerId);
      this.emit('peer-disconnected', peerId);
    });

    conn.on('error', (error: any) => {
      console.error('WebRTC: Connection error with', peerId, error);
      this.connections.delete(peerId);
      this.emit('peer-disconnected', peerId);
    });
  }

  private handleOutgoingConnection(conn: DataConnection, peerId: string): void {
    console.log('WebRTC: Outgoing connection to', peerId);

    conn.on('open', () => {
      console.log('WebRTC: Connection established with', peerId);
      this.connections.set(peerId, conn);
      this.emit('peer-connected', peerId);
    });

    conn.on('data', (data: any) => {
      this.handleMessage(peerId, data as WebRTCMessage);
    });

    conn.on('close', () => {
      console.log('WebRTC: Connection closed with', peerId);
      this.connections.delete(peerId);
      this.emit('peer-disconnected', peerId);
    });

    conn.on('error', (error: any) => {
      console.error('WebRTC: Connection error with', peerId, error);
      this.connections.delete(peerId);
      this.emit('peer-disconnected', peerId);
    });
  }

  private handleMessage(peerId: string, message: WebRTCMessage): void {
    console.log('WebRTC: Received message from', peerId, message);
    this.emit('message', peerId, message);
  }

  // メッセージを特定のピアに送信
  sendToPeer(peerId: string, message: WebRTCMessage): void {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      try {
        conn.send(message);
      } catch (error) {
        console.error('WebRTC: Failed to send message to', peerId, error);
      }
    } else {
      console.warn('WebRTC: No connection to peer', peerId);
    }
  }

  // メッセージを全ピアに送信
  broadcastMessage(message: WebRTCMessage): void {
    this.connections.forEach((conn, peerId) => {
      if (conn.open) {
        try {
          conn.send(message);
        } catch (error) {
          console.error('WebRTC: Failed to broadcast message to', peerId, error);
        }
      }
    });
  }

  // 接続されているピアのIDを取得
  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys()).filter(
      peerId => this.connections.get(peerId)?.open
    );
  }

  // 接続されているピアの数を取得
  getConnectedPeerCount(): number {
    return this.getConnectedPeers().length;
  }

  // 特定のピアとの接続を切断
  disconnectPeer(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
      this.emit('peer-disconnected', peerId);
    }
  }

  // 全ての接続を切断
  disconnectAll(): void {
    this.connections.forEach((conn) => {
      conn.close();
    });
    this.connections.clear();
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    this.emit('disconnected');
  }

  // WebRTCマネージャーの状態を取得
  getStatus() {
    return {
      isInitialized: this.peer !== null,
      isConnected: this.peer?.open || false,
      connectedPeers: this.getConnectedPeers(),
      localPlayerId: this.localPlayerId
    };
  }

  // レガシーメソッド（互換性のため）
  broadcast(message: WebRTCMessage): void {
    this.broadcastMessage(message);
  }

  getConnectionStatus(): { connected: number; total: number } {
    const connected = this.getConnectedPeerCount();
    return { connected, total: connected };
  }

  cleanup(): void {
    this.disconnectAll();
  }

  removeAllListeners(): void {
    // SimpleEventEmitterに実装済み
  }
}
