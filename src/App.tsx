import React, { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';

// モデル関係
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import BathroomWalls from './models/BathroomWalls';
import Lighting from './models/Lighting';
import ParabolicBall from './models/ParabolicBall';
import ToiletModelWithControls from './models/ToiletModel';
import ToiletModel from './models/ToiletModel';

const toiletModelUrl = '/src/assets/ToiletModel.fbx';

// モデルのロード状態を管理するコンポーネント
const ModelLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // useLoaderは特定のコンポーネント内で一度だけ呼び出す必要があるため、
  // このコンポーネントでプリロードする
  const toiletModel = useLoader(FBXLoader, toiletModelUrl);
  
  useEffect(() => {
    if (toiletModel) {
      console.log("モデルのプリロードが完了しました");
      setIsLoading(false);
    }
  }, [toiletModel]);
  
  if (isLoading) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '14px'
      }}>
        モデルを読み込み中...
      </div>
    );
  }
  
  return null;
};

// デバイスの向きコントローラー（Three.jsコンポーネント）
const DeviceOrientationCamera = () => {
  const { camera } = useThree();
  const permissionRef = useRef(false);
  const orientationHandlerRef = useRef(null);
  
  // ハンドラー関数
  orientationHandlerRef.current = (event) => {
    if (!permissionRef.current) return;
    
    // 有効な方向データがあるかチェック
    if (event.beta === null && event.gamma === null) {
      console.log("無効なデバイスの向きデータ", event);
      return;
    }
    
    // 値をログに記録（デバッグ用）
    if (Math.random() < 0.01) { // 1%の確率でログを出力（パフォーマンス向上のため）
      console.log("デバイスの向き:", 
        event.alpha ? event.alpha.toFixed(2) : "null", 
        event.beta ? event.beta.toFixed(2) : "null", 
        event.gamma ? event.gamma.toFixed(2) : "null"
      );
    }
    
    // 向きの角度を取得（nullチェック付き）
    const beta = event.beta ? event.beta * (Math.PI / 180) : 0;  // x軸回転
    const gamma = event.gamma ? event.gamma * (Math.PI / 180) : 0; // y軸回転
    
    // 回転角度を制限
    const maxTilt = Math.PI / 4; // 45度
    const clampedBeta = Math.max(-maxTilt, Math.min(maxTilt, beta));
    const clampedGamma = Math.max(-maxTilt, Math.min(maxTilt, gamma));
    
    // カメラの回転に適用
    camera.rotation.x = -clampedBeta;
    camera.rotation.y = -clampedGamma;
  };
  
  useEffect(() => {
    console.log("DeviceOrientationCameraコンポーネントがマウントされました");
    
    // カメラの初期位置
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);
    
    // 現在のハンドラー関数への参照を保存
    const currentHandler = (event) => {
      if (orientationHandlerRef.current) {
        orientationHandlerRef.current(event);
      }
    };
    
    // 許可済みの場合はイベントリスナーを設定
    if (window.deviceOrientationPermissionGranted) {
      console.log("すでに許可されています - デバイスの向きリスナーを設定します");
      permissionRef.current = true;
      window.addEventListener('deviceorientation', currentHandler);
    }
    
    // 許可イベントのリスナー
    const handlePermissionGranted = () => {
      console.log("許可イベントを受信しました - デバイスの向きリスナーを設定します");
      permissionRef.current = true;
      window.addEventListener('deviceorientation', currentHandler);
    };
    
    // タッチコントロール使用イベントリスナー
    const handleUseTouchInstead = () => {
      console.log("タッチコントロールを使用します");
      permissionRef.current = false;
      window.removeEventListener('deviceorientation', currentHandler);
    };
    
    // カスタムイベントリスナーを追加
    window.addEventListener('deviceOrientationPermissionGranted', handlePermissionGranted);
    window.addEventListener('useTouchControlsInstead', handleUseTouchInstead);
    
    // クリーンアップ
    return () => {
      console.log("コンポーネントのクリーンアップ - リスナーを削除します");
      window.removeEventListener('deviceorientation', currentHandler);
      window.removeEventListener('deviceOrientationPermissionGranted', handlePermissionGranted);
      window.removeEventListener('useTouchControlsInstead', handleUseTouchInstead);
    };
  }, [camera]);
  
  // デバッグ用：キーボードコントロール（デスクトップでのテスト用）
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowUp':
          camera.rotation.x += 0.05;
          break;
        case 'ArrowDown':
          camera.rotation.x -= 0.05;
          break;
        case 'ArrowLeft':
          camera.rotation.y += 0.05;
          break;
        case 'ArrowRight':
          camera.rotation.y -= 0.05;
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera]);
  
  return null;
};

// タッチコントロール
const TouchControls = () => {
  const { camera } = useThree();
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  
  const handleStart = useCallback((clientX, clientY) => {
    isDraggingRef.current = true;
    lastPosRef.current = { x: clientX, y: clientY };
  }, []);
  
  const handleMove = useCallback((clientX, clientY) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = clientX - lastPosRef.current.x;
    const deltaY = clientY - lastPosRef.current.y;
    
    // カメラの回転に適用
    camera.rotation.y -= deltaX * 0.005;
    camera.rotation.x -= deltaY * 0.005;
    
    // 回転角度を制限
    const maxTilt = Math.PI / 4; // 45度
    camera.rotation.x = Math.max(-maxTilt, Math.min(maxTilt, camera.rotation.x));
    
    lastPosRef.current = { x: clientX, y: clientY };
  }, [camera]);
  
  const handleEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);
  
  // タッチイベントハンドラー
  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleStart]);
  
  const handleTouchMove = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      e.preventDefault(); // スクロールを防止
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleMove]);
  
  // マウスイベントハンドラー
  const handleMouseDown = useCallback((e) => {
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);
  
  const handleMouseMove = useCallback((e) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);
  
  useEffect(() => {
    console.log("TouchControlsコンポーネントがマウントされました");
    
    // タッチイベントリスナー
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
    
    // マウスイベントリスナー
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('mouseleave', handleEnd);
    
    // クリーンアップ関数
    return () => {
      // タッチイベントリスナーを削除
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
      
      // マウスイベントリスナーを削除
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('mouseleave', handleEnd);
    };
  }, [
    handleTouchStart, 
    handleTouchMove, 
    handleMouseDown, 
    handleMouseMove, 
    handleEnd
  ]);
  
  return null;
};

// 許可ボタンコンポーネント（キャンバスの外側のUIコンポーネント）
const PermissionButton = () => {
  const [permissionState, setPermissionState] = useState("initial"); // "initial", "checking", "granted", "denied", "error"
  const [errorMsg, setErrorMsg] = useState(null);
  
  // デバイスの向きへのアクセス許可を要求
  const requestPermission = () => {
    // 状態を更新
    setPermissionState("checking");
    setErrorMsg(null);
    
    // iOS 13+ でのリクエスト方法
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      
      console.log("iOSデバイス: 許可リクエストを開始します");
      
      // 必ずユーザーのジェスチャーハンドラー内で呼び出す（ボタンクリック内）
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          console.log("許可レスポンス:", response);
          if (response === 'granted') {
            console.log("許可が付与されました");
            setPermissionState("granted");
            window.deviceOrientationPermissionGranted = true;
            
            // モーションの許可も同時に要求（iOS）
            if (typeof DeviceMotionEvent !== 'undefined' && 
                typeof DeviceMotionEvent.requestPermission === 'function') {
              DeviceMotionEvent.requestPermission()
                .then(motionResponse => {
                  console.log("モーション許可レスポンス:", motionResponse);
                })
                .catch(err => {
                  console.warn("モーション許可エラー (無視可):", err);
                });
            }
            
            // カスタムイベントを発行（3Dコンポーネントに通知）
            try {
              console.log("カスタムイベントを発行します");
              window.dispatchEvent(new Event('deviceOrientationPermissionGranted'));
            } catch (e) {
              console.error("カスタムイベント発行エラー:", e);
              setErrorMsg("カスタムイベント発行エラー");
            }
          } else {
            console.log("許可が拒否されました");
            setPermissionState("denied");
            setErrorMsg("デバイスの向きの許可が拒否されました。ブラウザの設定からセンサーへのアクセスを許可してください。");
          }
        })
        .catch(err => {
          console.error("許可リクエストエラー:", err);
          setPermissionState("error");
          setErrorMsg(`許可リクエストエラー: ${err.message || "不明なエラー"}`);
        });
    } else {
      // 非iOS環境（Android、デスクトップなど）
      console.log("非iOSデバイス: 明示的な許可は不要です");
      
      // デバイスの向きイベントが利用可能かをチェック
      if ('DeviceOrientationEvent' in window) {
        // 一度テストイベントを試して有効かどうか確認
        const testOrientation = (event) => {
          window.removeEventListener('deviceorientation', testOrientation);
          
          if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
            console.log("デバイスの向きデータが有効です:", event);
            setPermissionState("granted");
            window.deviceOrientationPermissionGranted = true;
            window.dispatchEvent(new Event('deviceOrientationPermissionGranted'));
          } else {
            console.warn("デバイスの向きデータが無効です:", event);
            setPermissionState("denied");
            setErrorMsg("お使いのデバイスまたはブラウザではデバイスの向きセンサーが無効になっているか、サポートされていません。");
          }
        };
        
        window.addEventListener('deviceorientation', testOrientation, { once: true });
        
        // タイムアウト - 一定時間後にもイベントが発火しない場合
        setTimeout(() => {
          window.removeEventListener('deviceorientation', testOrientation);
          if (permissionState === "checking") {
            console.warn("デバイスの向きイベントタイムアウト");
            setPermissionState("error");
            setErrorMsg("デバイスの向きセンサーからの応答がありません。ブラウザの設定でセンサーへのアクセスが許可されているか確認してください。");
          }
        }, 3000);
      } else {
        console.error("DeviceOrientationEventはサポートされていません");
        setPermissionState("error");
        setErrorMsg("お使いのデバイスまたはブラウザではデバイスの向きセンサーがサポートされていません。");
      }
    }
  };
  
  // コンポーネントマウント時に自動チェック（一部環境のみ）
  useEffect(() => {
    // すでに許可されているかを自動チェック（Android、デスクトップのみ）
    const checkExistingPermission = () => {
      // iOSでは自動チェックしない（ユーザーアクションが必要）
      if (typeof DeviceOrientationEvent === 'undefined' || 
          typeof DeviceOrientationEvent.requestPermission !== 'function') {
        
        if ('DeviceOrientationEvent' in window) {
          const testOrientation = (event) => {
            window.removeEventListener('deviceorientation', testOrientation);
            
            if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
              console.log("既存の許可を検出しました");
              setPermissionState("granted");
              window.deviceOrientationPermissionGranted = true;
              window.dispatchEvent(new Event('deviceOrientationPermissionGranted'));
            }
          };
          
          window.addEventListener('deviceorientation', testOrientation, { once: true });
        }
      }
    };
    
    checkExistingPermission();
    
    // ページの表示状態が変わった時に再チェック
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkExistingPermission();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // 許可状態によって表示を変更
  if (permissionState === "granted") {
    return (
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1000,
        padding: '10px',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        borderRadius: '5px',
        fontSize: '12px',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        デバイスの向きが有効になっています。スマホを傾けて見回してください。
      </div>
    );
  }
  
  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        padding: '20px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '80%'
      }}
    >
      <button 
        onClick={requestPermission}
        disabled={permissionState === "checking"}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '5px',
          background: permissionState === "checking" ? '#888888' : '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: permissionState === "checking" ? 'default' : 'pointer',
          opacity: permissionState === "checking" ? 0.7 : 1
        }}
      >
        {permissionState === "checking" ? "確認中..." : "デバイスの向きを有効化"}
      </button>
      
      {errorMsg && (
        <div style={{ marginTop: '10px', color: '#ff6b6b', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        {permissionState === "denied" ? (
          <>または下のボタンで代替コントロールに切り替え</>
        ) : (
          <>※ iOSの場合は許可を求められます。「許可」を選択してください</>
        )}
      </div>
      
      {(permissionState === "denied" || permissionState === "error") && (
        <button 
          onClick={() => {
            window.useTouchControls = true;
            window.dispatchEvent(new Event('useTouchControlsInstead'));
            setPermissionState("granted"); // UIを非表示にするため
          }}
          style={{
            marginTop: '15px',
            padding: '8px 15px',
            fontSize: '14px',
            borderRadius: '5px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          タッチ操作で代用する
        </button>
      )}
    </div>
  );
};

const store = createXRStore();

// メインアプリコンポーネント
const App = () => {
  // 最初のロード時にデバイスチェックをする
  const [isDeviceOrientationAvailable, setIsDeviceOrientationAvailable] = useState(false);
  const [forceTouchControls, setForceTouchControls] = useState(false);
  
  // DeviceOrientationEvent APIの可用性をチェック
  useEffect(() => {
    // グローバル変数を初期化
    window.deviceOrientationPermissionGranted = false;
    window.useTouchControls = false;
    
    // デバイスの向きAPIの可用性をチェック
    if ('DeviceOrientationEvent' in window) {
      console.log("デバイスの向きがサポートされています");
      setIsDeviceOrientationAvailable(true);
    } else {
      console.log("デバイスの向きがサポートされていません");
      setIsDeviceOrientationAvailable(false);
      // タッチコントロールに強制切り替え
      window.useTouchControls = true;
      setForceTouchControls(true);
    }
    
    // タッチコントロール切り替えイベントを監視
    const handleUseTouchInstead = () => {
      console.log("タッチコントロールに切り替えます");
      setForceTouchControls(true);
    };
    
    window.addEventListener('useTouchControlsInstead', handleUseTouchInstead);
    
    // デバッグ情報を出力
    console.log("ユーザーエージェント:", navigator.userAgent);
    console.log("ウィンドウサイズ:", window.innerWidth, "x", window.innerHeight);
    console.log("ピクセル比:", window.devicePixelRatio);
    
    return () => {
      window.removeEventListener('useTouchControlsInstead', handleUseTouchInstead);
    };
  }, []);
  
  return (
    <div id="canvas-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <Canvas shadows>
        <XR store={store}>
        {/* デバイスの向きAPIが利用可能で、タッチコントロールに切り替えていない場合 */}
        {isDeviceOrientationAvailable && !forceTouchControls && <DeviceOrientationCamera />}
        
        {/* タッチコントロールは常に有効（デバイスの向きが失敗した場合のバックアップとして） */}
        <TouchControls />
        
        {/* 残りのシーン要素 */}
        <Lighting />
        <BathroomWalls />
        <ParabolicBall />
        
        {/* トイレモデルを追加 */}
        <Suspense fallback={null}>
          <ToiletModel />
        </Suspense>
        </XR>
      </Canvas>
      
      {/* モデルローディング表示 */}
      <ModelLoader />
      
      {/* デバイスの向きAPIが利用可能で、タッチコントロールに切り替えていない場合は許可ボタンを表示 */}
      {isDeviceOrientationAvailable && !forceTouchControls ? (
        <PermissionButton />
      ) : (
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 1000,
          padding: '10px',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          borderRadius: '5px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {forceTouchControls ? 
            "タッチ操作モードです。画面をドラッグして見回してください。" : 
            "デバイスの向きはサポートされていません。画面をドラッグして見回してください。"
          }
        </div>
      )}
    </div>
  );
};

export default App;