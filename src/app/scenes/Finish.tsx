import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';

// モデル関係
import BathroomWalls from '../../features/object/models/BathroomWalls';
import Lighting from '../../features/object/models/Lighting';
import ToiletModel from '../../features/object/models/ToiletModel';

// VR関係
const store = createXRStore();

const Finish = () => {
  return (
    <div id="canvas-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <Canvas shadows>
        <XR store={store}>
          {/* 残りのシーン要素 */}
          <Lighting />
          <BathroomWalls />
          
          {/* 重めのモデル系を別で読み込まれ次第表示にする */}
          <Suspense fallback={null}>
            <ToiletModel />
          </Suspense>
        </XR>
      </Canvas> 
    </div>
  )
}

export default Finish
