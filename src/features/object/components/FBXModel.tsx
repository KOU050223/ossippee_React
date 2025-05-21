/**
 * @file FBXModel.tsx
 * @description FBXモデルを読み込むコンポーネント
 * @user FBXLoaderを使用してFBXモデルを読み込む
 * @example
 * import FBXModel from '@/features/object/components/FBXModel';
 * <FBXModel
 *     modelUrl='/public/ToiletModel.fbx'
 *     scale={[0.01, 0.01, 0.01]}
 *     position={[0, -2.8, -2]}
 *     rotation={[0, 0, 0]}
 * />
 */

import { useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import type { FunctionComponent } from 'react';

type Props =
  {
    modelUrl: string | '';
    scale?: [number, number, number] | [1, 1, 1];
    position?: [number, number, number] | [0, 0, 0];
    rotation?: [number, number, number] | [0, 0, 0];
  };

// モデルロードコンポーネント
// FBXLoaderを使用してFBXモデルを読み込む汎用的なコンポーネント

const FBXtModel: FunctionComponent<Props> = ({ modelUrl, scale } : Props) => {
  // FBXをロード
  const fbx = useLoader(FBXLoader, modelUrl);
  // モデルの参照
  const modelRef = useRef<THREE.Group>(null);

  // FBXがロードされた後の処理
  useEffect(() => {
    if (fbx) {
      console.log("モデルが読み込まれました", fbx);
      
      // スケールと位置を調整
      fbx.scale.set(scale?.[0] || 1, scale?.[1] || 1, scale?.[2] || 1);
      fbx.position.set(0, -2.8, -2);
      
      // マテリアルを調整
      fbx.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // シャドウの設定
          child.castShadow = true;
          child.receiveShadow = true;
          
          // マテリアルの調整
          if (child.material) {
            // マテリアルが配列の場合
            if (Array.isArray(child.material)) {
              child.material.forEach(material => {
                // マテリアルを白色に設定
                material.color = new THREE.Color(0xffffff);
                material.emissive = new THREE.Color(0x222222);
                material.emissiveIntensity = 0.2;
                material.metalness = 0.1;
                material.roughness = 0.8;
                material.side = THREE.DoubleSide; // 両面描画
              });
            } else {
              // 単一マテリアルの場合
              child.material.color = new THREE.Color(0xffffff);
              child.material.emissive = new THREE.Color(0x222222);
              child.material.emissiveIntensity = 0.2;
              child.material.metalness = 0.1;
              child.material.roughness = 0.8;
              child.material.side = THREE.DoubleSide; // 両面描画
            }
          }
        }
      });
    }
  }, [fbx]);
  
  // プリミティブとしてFBXを直接レンダリング
  return (
    <>
      {fbx && (
        <primitive 
          ref={modelRef}
          object={fbx} 
        />
      )}
    </>
  );
};

export default FBXtModel;