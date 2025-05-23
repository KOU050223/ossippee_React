import { Suspense, useRef } from 'react';
import { createXRStore, XR, IfInSessionMode } from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, PointerLockControls, Sky } from '@react-three/drei';
import { Physics } from "@react-three/rapier";
import { Ground } from "@/features/background/components/Ground";
import { Player } from "@/features/character/components/Player";
import GLTFModel from '@/features/object/components/GLTFModel';
import { Item } from '@/features/object/models/Item';
import GoalGenerator from '@/components/GoalGenerator';
import { useUserId ,useDocument } from '@/hooks/index';

type PlayerHandle = {
  getPosition: () => { x: number; y: number; z: number }
  addPoint: () => void
  setOrientation: (orientation: any) => void
  toggleFreeLook: () => void
}

const Game = () => {
    const store = createXRStore();
    const playerRef = useRef<PlayerHandle>(null);
    const { userId } = useUserId();
    const { data: userData } = useDocument('users', userId); // userIdは適切な値に置き換えてください
    const goalCount = userData?.foundToilet || 1; // デフォルト値を設定

    const goal: [number, number, number] = [10, 1, -5];

    return (
        <div id="canvas-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <button onClick={() => store.enterVR()}>Enter VR</button>
        {/* <button onClick={handleGetPosition}>プレイヤーの座標を取得</button> */}
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

            <ambientLight intensity={3} />
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
                {/* <Ground /> */}
                <Player ref={playerRef} />           
                {/* アイテム's */}
                <Item playerRef={playerRef as React.RefObject<PlayerHandle>} transform={[0, 1, 0]} threshold={1} />
                <Item playerRef={playerRef as React.RefObject<PlayerHandle>} transform={[2, 1, 0]} threshold={1} />
                <Item playerRef={playerRef as React.RefObject<PlayerHandle>} transform={[4, 1, 0]} threshold={1} />
                <Item playerRef={playerRef as React.RefObject<PlayerHandle>} transform={[6, 1, 0]} threshold={1} />
                <Item playerRef={playerRef as React.RefObject<PlayerHandle>} transform={[8, 1, 0]} threshold={1} />
                {/* コントロール（ブラウザのみ） */}
                <IfInSessionMode deny={['immersive-ar', 'immersive-vr']} >
                <PointerLockControls />
                </IfInSessionMode>
                {/* 重めのモデル系を別で読み込まれ次第表示にする */}
                <Suspense fallback={null}>
                    <GLTFModel modelUrl='/public/PQ_Remake_AKIHABARA.glb' position={[-50, -3.7, 50]} scale={[10,10,10]} colliderType='trimesh' />
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
