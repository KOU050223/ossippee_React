import { Suspense, useRef } from 'react'; // useEffectを削除
import { createXRStore, XR, IfInSessionMode } from "@react-three/xr";
import { Canvas } from "@react-three/fiber"; // useFrame を削除 (OrientationManagerに移動)
import { KeyboardControls, PointerLockControls, Sky } from '@react-three/drei';
import { Physics } from "@react-three/rapier";
import { Ground } from "@/features/background/components/Ground";
import { Player } from "@/features/character/components/Player";
import GLTFModel from '@/features/object/components/GLTFModel';
import GoalGenerator from '@/components/GoalGenerator';
import { useUserId ,useDocument } from '@/hooks/index';
import StageGenerator from '@/components/StageGenerator';
import OrientationManager from '@/components/OrientationManager'; // 新しいコンポーネントをインポート
import type { PlayerHandle } from "@/features/character/components/Player";
import { GoalDetector } from '@/components/GoalDetector';


// 向き変更ポイントの型定義
interface OrientationPoint {
  id: string; // 各ポイントを識別するための一意なID
  triggerPosition: { x: number; y: number; z: number };
  lookAtTarget?: { x: number; y: number; z: number }; 
  targetRotation?: { x: number; y: number; z: number; w: number }; 
  relativeYaw?: number; // Y軸周りの相対回転角度 (ラジアン単位)
  threshold?: number; // 判定の閾値（オプション）
}

// 向き変更ポイントのデータ例 (JSON形式などで外部から読み込むことも可能)
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

const Game = () => {
    const store = createXRStore();
    const playerRef = useRef<PlayerHandle>(null) as React.RefObject<PlayerHandle>;
    const { userId } = useUserId();
    const { data: userData } = useDocument('users', userId); // userIdは適切な値に置き換えてください
    const goalCount = userData?.foundToilet || 1; // デフォルト値を設定

    const handleGetPosition = () => {
        if (playerRef.current) {
            const pos = playerRef.current.getPosition()
            if (pos) {
                alert(`Player position:\n x: ${pos.x.toFixed(2)} \n y: ${pos.y.toFixed(2)} \n z: ${pos.z.toFixed(2)}`)
            }
        }
    }

    return (
        <div id="canvas-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <button onClick={() => store.enterVR()}>Enter VR</button>
        <button onClick={handleGetPosition}>プレイヤーの座標を取得</button>
        <button onClick={() => {
            if (playerRef.current) {
                const orientation = playerRef.current.getOrientation()
                if (orientation) {
                    alert(`Player orientation:\n x: ${orientation.x.toFixed(2)} \n y: ${orientation.y.toFixed(2)} \n z: ${orientation.z.toFixed(2)} \n w: ${orientation.w.toFixed(2)}`)
                }
            }
        }}>getOrientation</button>
        <button onClick={() => {
            if (playerRef.current) {
                playerRef.current.toggleFreeLook()
            }
        }}>toggleFreeLook</button>
        <KeyboardControls
            map={[
            { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
            { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
            { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
            { name: 'right', keys: ['ArrowRight', 'KeyD'] },
            { name: 'jump', keys: ['Space'] },
            ]}
            >

        <Canvas camera={{ fov: 45, position: [0, 5, 10] }}>
            <XR store={store}>
            {/* debug */}
            <>
                {/* <CameraDirectionLogger/> */}
            </>
            {/* OrientationManager を Canvas 内に配置 */}
            <OrientationManager playerRef={playerRef} orientationPoints={orientationPointsData} />

            <ambientLight intensity={7} /> {/* 強度を3から5に上げました */}
            <directionalLight position={[50, 50, 50]} intensity={2} /> {/* DirectionalLightを追加 */}
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            {/* 空 */}
            <Sky
                distance={450000}
                sunPosition={[50, 50, 50]}
                inclination={0}
                azimuth={0.25}
                />
            <Physics gravity={[0, -9.81, 0]}>
                {/* 3D物体 */}
                <Ground />
                <Player 
                    ref={playerRef} 

                />
                <StageGenerator 
                    playerRef={playerRef} 
                    length={100} 
                    itemSpacing={2} 
                    itemHeight={1} 
                    triggerGeneration={true}
                />
                {/* コントロール（ブラウザのみ） */}
                <IfInSessionMode deny={['immersive-ar', 'immersive-vr']} >
                <PointerLockControls />
                </IfInSessionMode>
                {/* 重めのモデル系を別で読み込まれ次第表示にする */}
                <Suspense fallback={null}>
                    <GLTFModel 
                        modelUrl='/public/PQ_Remake_AKIHABARA.glb' 
                        position={[-50, -3.7, 50]} 
                        scale={[10,10,10]} 
                        rotation={[0,0,0]} 
                        colliderType='trimesh'
                    />
                </Suspense>
            </Physics>

            {/* ゴール検出 */}
            {/* <GoalGenerator
                playerRef={playerRef} // 型アサーションを削除し、直接 playerRef を渡す
                numberOfGoals={goalCount} // ゴールの数を指定
                goalAreaRange={20} // ゴールの生成範囲を指定
             /> */}
            {/* ゴール位置（自分で設定） */}
            <GoalDetector
                playerRef={playerRef}
                goal={[550, 1, -508]} // ゴールの位置を指定
                threshold={3} // ゴール判定の閾値
            />
            {/* UI */}
            {/* <GameUI playerRef={playerRef} /> */}
            </XR>
        </Canvas>
        </KeyboardControls>
        </div>
    )
}

export default Game
