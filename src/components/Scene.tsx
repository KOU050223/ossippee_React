// src/components/Scene.tsx
import React, { Suspense, useRef, useEffect } from 'react';
import { createXRStore, XR, IfInSessionMode } from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, PointerLockControls, Sky } from '@react-three/drei';
import { Physics } from "@react-three/rapier";
import { Ground } from "@/features/background/components/Ground";
import { Player } from "@/features/character/components/Player";
import GLTFModel from '@/features/object/components/GLTFModel';
import ItemGenerator from '@/components/ItemGenerator';
import GoalGenerator from '@/components/GoalGenerator';
import BackgroundMusic from '@/components/BackgroundMusic';
import OrientationManager from '@/components/OrientationManager';
import type { PlayerHandle } from "@/features/character/components/Player";

interface SceneProps {
  gameStarted: boolean;
  disableForward: boolean;
  goalCount: number;
  initialGoalPos: { x: number; y: number; z: number };
  onPointChange: (pt: number) => void;
  onGameOver: () => void;
  onPatienceChange: (val: number) => void;
}


// 向き変更ポイントの型定義
interface OrientationPoint {
  id: string; // 各ポイントを識別するための一意なID
  triggerPosition: { x: number; y: number; z: number };
  lookAtTarget?: { x: number; y: number; z: number }; 
  targetRotation?: { x: number; y: number; z: number; w: number }; 
  relativeYaw?: number; // Y軸周りの相対回転角度 (ラジアン単位)
  threshold?: number; // 判定の閾値（オプション）
}

const orientationPointsData: OrientationPoint[] = [
  {
    id: 'point1',
    triggerPosition: { x: 38.19, y: 1.05, z: -126.0 },
    lookAtTarget: {  x: 415, y: 1.05, z: -122.9 }, // 注視点
    // targetRotation: { x: 0, y: -1 * Math.sin(Math.PI / 4), z: 0, w: Math.cos(Math.PI / 4) }, // Y軸に90度回転
    threshold: 10, 
  },
  {
    id: 'point2',
    triggerPosition: { x: 415, y: 1.05, z: -122.9 },
    lookAtTarget: { x: 420, y: 1, z: -452.12 }, // 注視点
    targetRotation: { x: 0, y: 0 , z: 0, w: 1 }, // 正面を向く (無回転)
    threshold: 10,
  },
  {
    id: 'point3', 
    triggerPosition: { x: 420, y: 1, z: -452.12 },
    lookAtTarget: { x: 543, y: 1, z: -440 }, // 注視点
    threshold: 15,
  },
  {
    id: 'point4', 
    triggerPosition: { x: 543, y: 1, z: -440 },
    lookAtTarget: { x: 549, y: 1, z: -506 }, // 注視点
    threshold: 7,
  },
//   {
//     id: 'pointX', 
//     triggerPosition: { x: 420, y: 1, z: -452.12 },
//     targetRotation: { x: 0, y: -1 * Math.sin(Math.PI / 4), z: 0, w: 1 }, // 右を向く (無回転)
//     threshold: 10,
//   },
//   {
//     id: 'turnRightTest', // 右を向くテスト
//     triggerPosition: { x: 0, y: 1, z: 5 }, // トリガー位置は適宜調整してください
//     relativeYaw: -Math.PI / 2, // 右に90度回転 (時計回りなのでマイナス)
//     threshold: 1.0,
//   },
];

const Scene: React.FC<SceneProps> = ({
  gameStarted,
  disableForward,
  goalCount,
  initialGoalPos,
  onPointChange,
  onGameOver,
  onPatienceChange,
}) => {
  const store = createXRStore();
  const playerRef = useRef<PlayerHandle>(null as unknown as PlayerHandle);

  // ポイント監視（例：Rapier のコライダーイベントや useFrame 内で検出したら onPointChange を呼ぶ）
  useEffect(() => {
    // ここではsetInterval例ですが、理想は Rapier の onCollisionEnter イベントで直接呼ぶ
    const iv = setInterval(() => {
      const pt = playerRef.current?.getPoint() ?? 0;
      onPointChange(pt);
      if (playerRef.current?.isGameOver()) onGameOver();
      // 我慢ゲージの取得＆更新コールバック
      const patience = playerRef.current?.getPatience?.() ?? 0;
      onPatienceChange(patience);
    }, 100);
    return () => clearInterval(iv);
  }, [onPointChange, onGameOver]);

  return (
    <KeyboardControls
        map={[
            { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
            { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
            { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
            { name: 'right', keys: ['ArrowRight', 'KeyD'] },
            { name: 'jump', keys: ['Space'] },
    ]}>
      <Canvas camera={{ fov: 45, position: [280,5,-123] }}>
        <XR store={store}>
          <BackgroundMusic url="/pepsiman_full.mp3" loop volume={0.3} />

          <Sky distance={450000} sunPosition={[50,50,50]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={7} />
          <directionalLight position={[50,50,50]} intensity={2} />
          <spotLight position={[10,10,10]} angle={0.15} penumbra={1} intensity={Math.PI} />
          <pointLight position={[-10,-10,-10]} intensity={Math.PI} />

          <Physics gravity={[0,-18,0]}>
            <Ground />
            <Player
              ref={playerRef}
              disableForward={!gameStarted}
              gameStarted={gameStarted}
              position={[280,5,-123]}
            />
            <IfInSessionMode deny={['immersive-ar','immersive-vr']}>
              <PointerLockControls />
            </IfInSessionMode>
            <Suspense fallback={null}>
              <GLTFModel
                modelUrl='/public/PQ_Remake_AKIHABARA.glb'
                position={[-50,-3.7,50]}
                scale={[10,10,10]}
                rotation={[0,0,0]}
                colliderType='trimesh'
              />
            </Suspense>
          </Physics>

          <ItemGenerator
            playerRef={playerRef}
            numberOfItems={20}
            itemAreaRange={60}
            minDistance={10}
            itemHeight={1}
          />

          <GoalGenerator
            playerRef={playerRef}
            numberOfGoals={goalCount}
            goalAreaRange={100}
            minDistance={200}
            initialPosition={initialGoalPos}
          />

          <OrientationManager
            playerRef={playerRef}
            orientationPoints={orientationPointsData}
          />
        </XR>
      </Canvas>
    </KeyboardControls>
  );
};

// props が変わらない限り再レンダーしないようにメモ化
export default React.memo(Scene);
