import { Suspense, useRef } from 'react';
import { createXRStore, XR, IfInSessionMode } from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, PointerLockControls, Sky } from '@react-three/drei';
import { Physics } from "@react-three/rapier";
import { Ground } from "../../features/background/components/Ground";
import { Player } from "../../features/character/components/Player";
import GLTFModel from '../../features/object/components/GLTFModel';
// import CameraDirectionLogger from '@/devtools/CameraDirectionLogger';
// import UITest from '../../devtools/UITest';
// import { GameUI } from '@/features/ui/GameUI';
import { GoalDetector } from '../../components/GoalDetector';

type PlayerHandle = {
  getPosition: () => { x: number; y: number; z: number }
}

type GameProps = {
    onFinish: () => void
}

const Game:React.FC<GameProps> = ({ onFinish }) => {
    const store = createXRStore();
    const playerRef = useRef<PlayerHandle>(null);

    const goal: [number, number, number] = [10, 1, -5];

    // const handleGetPosition = () => {
    //     if (playerRef.current) {
    //         const pos = playerRef.current.getPosition()
    //         alert(`Player position:\n x: ${pos.x.toFixed(2)} \n y: ${pos.y.toFixed(2)} \n z: ${pos.z.toFixed(2)}`)
    //     }
    // }

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
                <Ground />
                <Player ref={playerRef} />                
                {/* コントロール（ブラウザのみ） */}
                <IfInSessionMode deny={['immersive-ar', 'immersive-vr']} >
                <PointerLockControls />
                </IfInSessionMode>
                {/* 重めのモデル系を別で読み込まれ次第表示にする */}
                <Suspense fallback={null}>
                {/* <GLTFModel
                    modelUrl='/public/city.glb'
                    position={[4, 3, 0]}
                    colliderType='hull'
                    /> */}
                </Suspense>
            </Physics>

            {/* ゴール検出 */}
            <GoalDetector
               playerRef={playerRef as React.RefObject<{ getPosition: () => { x: number; y: number; z: number } }>}
               goal={[10, 4, -5]}
               threshold={1}
               onReach={onFinish}
             />
            <mesh position={goal}>
               <sphereGeometry args={[0.5, 32, 32]} />
               <meshStandardMaterial color="red" />
             </mesh>

            {/* UI */}
            {/* <GameUI playerRef={playerRef} /> */}
            </XR>
        </Canvas>
        </KeyboardControls>
        </div>
    )
}

export default Game
