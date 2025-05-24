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

export type PlayerHandle = {
  getPosition: () => { x: number; y: number; z: number } | null; // getPositionの戻り値を修正
  addPoint: () => void;
  setOrientation: (lookAtPoint: { x: number; y: number; z: number }) => void; // lookAtPointの型を具体的に
  toggleFreeLook: () => void;
  getOrientation: () => { x: number; y: number; z: number; w: number } | null; // getOrientationの戻り値を修正
}

// 向き変更ポイントの型定義
interface OrientationPoint {
  id: string; // 各ポイントを識別するための一意なID
  triggerPosition: { x: number; y: number; z: number };
  lookAtTarget: { x: number; y: number; z: number };
  threshold?: number; // 判定の閾値（オプション）
}

// 向き変更ポイントのデータ例 (JSON形式などで外部から読み込むことも可能)
const orientationPointsData: OrientationPoint[] = [
  {
    id: 'point1',
    triggerPosition: { x: 38.19, y: 1.05, z: -126.0 },
    lookAtTarget: { x: 0.72, y: 0, z: -0.69 },
    threshold: 2, // この距離以内に入ったらトリガー
  },
  {
    id: 'point2',
    triggerPosition: { x: 10, y: 1, z: 10 },
    lookAtTarget: { x: 15, y: 1, z: 10 },
    threshold: 1.5,
  },
  // さらにポイントを追加できます
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
            <GoalGenerator
                playerRef={playerRef as React.RefObject<{ getPosition: () => { x: number; y: number; z: number } }>}
                numberOfGoals={goalCount} // ゴールの数を指定
                goalAreaRange={20} // ゴールの生成範囲を指定
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
