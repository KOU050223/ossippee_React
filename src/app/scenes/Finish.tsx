import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';

// モデル関係
import BathroomWalls from '@/features/object/models/BathroomWalls';
import Lighting from '@/features/object/models/Lighting';
import ToiletModel from '@/features/object/models/ToiletModel';

import { useUserId } from '@/hooks/useUserId';
import { useUpdateField } from '@/hooks/index';
import { useNavigate } from 'react-router-dom';


// VR関係
const store = createXRStore();

const Finish = () => {
      const { userId } = useUserId()
      const { updateField } = useUpdateField('users')
      const navigate = useNavigate()
      const onClick = async () => {
        console.log(userId);
          const result = await updateField(userId, 'gameState', 'entry');
          if (result) {
              console.log('gameState updated to /');
          } else {
              console.error('Failed to update gameState');
          }
          navigate('/');
      }
  return (
    <div id="canvas-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <button
        onClick={() => {
          onClick();
        }}
      >
        戻る
      </button>
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
