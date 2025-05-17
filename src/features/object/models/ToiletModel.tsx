import React, { useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';

// FBXモデルのURL
const toiletModelUrl = '/src/assets/ToiletModel.fbx';

// トイレモデルコンポーネント
const ToiletModel = () => {
  // FBXをロード
  const fbx = useLoader(FBXLoader, toiletModelUrl);
  // モデルの参照
  const modelRef = useRef<THREE.Object3D | null>(null);

  // FBXがロードされた後の処理
  useEffect(() => {
    if (fbx) {
      console.log("トイレモデルが読み込まれました", fbx);
      
      // スケールと位置を調整
      fbx.scale.set(3, 3, 3);
      fbx.position.set(0, -2.8, -2);
      
      // マテリアルを調整
      fbx.traverse((child) => {
        if (child.isMesh) {
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

  // キーボードでモデルを移動できるようにする（デバッグ用）
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!fbx) return;
      
      const step = 0.1;
      
      switch(e.key) {
        case 'ArrowUp':
          fbx.position.y += step;
          break;
        case 'ArrowDown':
          fbx.position.y -= step;
          break;
        case 'ArrowLeft':
          fbx.position.x -= step;
          break;
        case 'ArrowRight':
          fbx.position.x += step;
          break;
        case 'w':
          fbx.position.z -= step;
          break;
        case 's':
          fbx.position.z += step;
          break;
        case 'a':
          fbx.rotation.y += 0.1;
          break;
        case 'd':
          fbx.rotation.y -= 0.1;
          break;
        case '+':
        case '=':
          fbx.scale.multiplyScalar(1.1);
          break;
        case '-':
          fbx.scale.multiplyScalar(0.9);
          break;
        default:
          return;
      }
      
      console.log("モデル位置:", 
        fbx.position.x.toFixed(2),
        fbx.position.y.toFixed(2),
        fbx.position.z.toFixed(2),
        "回転:", 
        fbx.rotation.y.toFixed(2),
        "スケール:", 
        fbx.scale.x.toFixed(2)
      );
      
      e.preventDefault();
    };
    
    if (fbx) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [fbx]);
  
  // 追加のライトを設置（モデルを照らすため）
  const ExtraLights = () => {
    return (
      <>
        <pointLight position={[0, 0, 2]} intensity={1} color="#ffffff" />
        <pointLight position={[2, 0, 0]} intensity={0.8} color="#ffeecc" />
        <pointLight position={[-2, 0, 0]} intensity={0.8} color="#ccffee" />
        <pointLight position={[0, 0, -2]} intensity={0.8} color="#eeccff" />
        <ambientLight intensity={0.6} />
      </>
    );
  };
  
  // プリミティブとしてFBXを直接レンダリング
  return (
    <>
      {fbx && (
        <primitive 
          ref={modelRef}
          object={fbx} 
        />
      )}
      <ExtraLights />
    </>
  );
};

export default ToiletModel;