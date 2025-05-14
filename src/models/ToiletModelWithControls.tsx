import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';

// FBXモデルのURL
const toiletModelUrl = '/src/assets/ToiletModel.fbx';

// メインコンポーネント - Canvas外のUIと内部の3Dシーンを管理
const ToiletModelWithControls = () => {
  // 現在のカラーモード（デバッグ用）
  const [colorMode, setColorMode] = useState('white');
  // モデルの位置情報を保持
  const [modelInfo, setModelInfo] = useState({
    position: [0, -2.8, 0],
    rotation: [0, 0, 0],
    scale: [3, 3, 3]
  });

  // モードを変更する関数
  const changeMode = (mode) => {
    if (mode === 'rotating') {
      setColorMode(prev => prev === 'rotating' ? 'white' : 'rotating');
    } else {
      setColorMode(mode);
    }
  };

  // 外部UI - Canvas外のHTML要素
  const MaterialControl = () => (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '10px',
      borderRadius: '5px',
      color: 'white',
      fontSize: '12px',
      zIndex: 1000,
      pointerEvents: 'auto', // クリックを有効化
      userSelect: 'none', // テキスト選択を無効化
    }}>
      <div>現在のモード: {colorMode}</div>
      <div>
        {['white', 'colored', 'emissive', 'red', 'flip-normals', 'rotating'].map(mode => (
          <button 
            key={mode}
            onClick={() => changeMode(mode)}
            style={{
              margin: '5px',
              padding: '5px 10px',
              backgroundColor: colorMode === mode ? '#007bff' : '#6c757d',
              border: 'none',
              borderRadius: '3px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {mode}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '5px' }}>
        位置: ({modelInfo.position.map(v => parseFloat(v).toFixed(2)).join(', ')}), 
        回転: ({modelInfo.rotation.map(v => parseFloat(v).toFixed(2)).join(', ')}), 
        スケール: {parseFloat(modelInfo.scale[0]).toFixed(2)}
      </div>
      <div style={{ marginTop: '5px' }}>
        ショートカット: 1-5 = マテリアル変更, R = 回転, 矢印キー = 移動, A/D = 回転, +/- = サイズ
      </div>
    </div>
  );

  // 3Dシーン内のトイレモデル
  const ToiletModel3D = () => {
    // FBXをロード
    const fbx = useLoader(FBXLoader, toiletModelUrl);
    // モデルの参照
    const modelRef = useRef();

    // FBXがロードされた後の処理
    useEffect(() => {
      if (fbx && modelRef.current) {
        console.log("トイレモデルが読み込まれました", fbx);
        
        // スケールと位置を調整
        fbx.scale.set(...modelInfo.scale);
        fbx.position.set(...modelInfo.position);
        fbx.rotation.set(...modelInfo.rotation);
        
        // マテリアルを調整
        applyMaterials(colorMode);
      }
    }, [fbx, colorMode]);

    // 異なるマテリアルを適用する関数
    const applyMaterials = (mode) => {
      if (!fbx) return;
      
      console.log(`マテリアルモード変更: ${mode}`);
      
      fbx.traverse((child) => {
        if (child.isMesh) {
          console.log("メッシュ名:", child.name);
          
          // シャドウの設定
          child.castShadow = true;
          child.receiveShadow = true;
          
          // 法線を反転（テスト用）
          if (mode === 'flip-normals') {
            if (child.geometry) {
              child.geometry.computeVertexNormals();
              // 法線を反転
              for (let i = 0; i < child.geometry.attributes.normal.array.length; i++) {
                child.geometry.attributes.normal.array[i] *= -1;
              }
              child.geometry.attributes.normal.needsUpdate = true;
            }
          }
          
          // マテリアルを作成または更新
          let materials = [];
          if (child.material) {
            if (Array.isArray(child.material)) {
              materials = child.material;
            } else {
              materials = [child.material];
            }
          }
          
          // 既存のマテリアルがない場合は新しいマテリアルを作成
          if (materials.length === 0) {
            const newMaterial = new THREE.MeshStandardMaterial();
            materials = [newMaterial];
            if (Array.isArray(child.material)) {
              child.material = [newMaterial];
            } else {
              child.material = newMaterial;
            }
          }
          
          // マテリアルに設定を適用
          materials.forEach(material => {
            switch (mode) {
              case 'white':
                material.color = new THREE.Color(0xffffff);
                material.emissive = new THREE.Color(0x222222);
                material.emissiveIntensity = 0.2;
                break;
              case 'colored':
                // 各メッシュに異なる色を割り当て
                material.color = new THREE.Color(
                  0.5 + Math.random() * 0.5,
                  0.5 + Math.random() * 0.5,
                  0.5 + Math.random() * 0.5
                );
                material.emissive = new THREE.Color(
                  0.1 + Math.random() * 0.1,
                  0.1 + Math.random() * 0.1,
                  0.1 + Math.random() * 0.1
                );
                material.emissiveIntensity = 0.3;
                break;
              case 'emissive':
                // 発光マテリアル
                material.color = new THREE.Color(0x111111);
                material.emissive = new THREE.Color(0xffffff);
                material.emissiveIntensity = 1.0;
                break;
              case 'red':
                // 赤色マテリアル
                material.color = new THREE.Color(0xff0000);
                material.emissive = new THREE.Color(0x330000);
                material.emissiveIntensity = 0.5;
                break;
              default:
                material.color = new THREE.Color(0xffffff);
            }
            
            // 共通の設定
            material.metalness = 0.1;
            material.roughness = 0.8;
            material.side = THREE.DoubleSide; // 両面描画
          });
        }
      });
    };

    // モデルを回転させる
    useFrame((state, delta) => {
      if (modelRef.current && colorMode === 'rotating') {
        modelRef.current.rotation.y += delta * 0.5;
      }
    });

    // キーボードでモデルを移動できるようにする（デバッグ用）
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (!fbx) return;
        
        const step = 0.1;
        let positionChanged = false;
        let rotationChanged = false;
        let scaleChanged = false;
        
        // モデルの現在の情報をコピー
        const newPosition = [...modelInfo.position];
        const newRotation = [...modelInfo.rotation];
        const newScale = [...modelInfo.scale];
        
        switch(e.key) {
          case 'ArrowUp':
            newPosition[1] += step;
            positionChanged = true;
            break;
          case 'ArrowDown':
            newPosition[1] -= step;
            positionChanged = true;
            break;
          case 'ArrowLeft':
            newPosition[0] -= step;
            positionChanged = true;
            break;
          case 'ArrowRight':
            newPosition[0] += step;
            positionChanged = true;
            break;
          case 'w':
            newPosition[2] -= step;
            positionChanged = true;
            break;
          case 's':
            newPosition[2] += step;
            positionChanged = true;
            break;
          case 'a':
            newRotation[1] += 0.1;
            rotationChanged = true;
            break;
          case 'd':
            newRotation[1] -= 0.1;
            rotationChanged = true;
            break;
          case '+':
          case '=':
            newScale[0] *= 1.1;
            newScale[1] *= 1.1;
            newScale[2] *= 1.1;
            scaleChanged = true;
            break;
          case '-':
            newScale[0] *= 0.9;
            newScale[1] *= 0.9;
            newScale[2] *= 0.9;
            scaleChanged = true;
            break;
          // マテリアル変更のショートカット
          case '1':
            changeMode('white');
            break;
          case '2':
            changeMode('colored');
            break;
          case '3':
            changeMode('emissive');
            break;
          case '4':
            changeMode('red');
            break;
          case '5':
            changeMode('flip-normals');
            break;
          case 'r':
            changeMode('rotating');
            break;
          default:
            return;
        }
        
        // 変更があればステートを更新
        if (positionChanged) {
          fbx.position.set(...newPosition);
          setModelInfo(prev => ({...prev, position: newPosition}));
        }
        if (rotationChanged) {
          fbx.rotation.set(...newRotation);
          setModelInfo(prev => ({...prev, rotation: newRotation}));
        }
        if (scaleChanged) {
          fbx.scale.set(...newScale);
          setModelInfo(prev => ({...prev, scale: newScale}));
        }
        
        console.log("モデル位置:", 
          fbx.position.x.toFixed(2),
          fbx.position.y.toFixed(2),
          fbx.position.z.toFixed(2),
          "回転:", 
          fbx.rotation.y.toFixed(2),
          "スケール:", 
          fbx.scale.x.toFixed(2),
          "モード:",
          colorMode
        );
        
        e.preventDefault();
      };
      
      if (fbx) {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }
    }, [fbx, colorMode, modelInfo]);
    
    // プリミティブとしてFBXを直接レンダリング
    return (
      <>
        {fbx && (
          <primitive 
            ref={modelRef}
            object={fbx} 
          />
        )}
        
        {/* モデルを照らす追加ライト */}
        <pointLight position={[0, 0, 3]} intensity={1.5} color="#ffffff" />
        <pointLight position={[3, 1, 0]} intensity={1.2} color="#ffeecc" />
        <pointLight position={[-3, 1, 0]} intensity={1.2} color="#ccffee" />
        <pointLight position={[0, 1, -3]} intensity={1.0} color="#eeccff" />
        
        {/* 環境光を増やす */}
        <ambientLight intensity={1.0} />
        
        {/* 床（シャドウ確認用） */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -3, 0]} 
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      </>
    );
  };

  // メインのレンダリング - Canvas外のUIとCanvasが分離されている
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3Dモデル */}
      <ToiletModel3D />
      
      {/* UIコントロール - Canvas外のHTML要素 */}
      <MaterialControl />
    </div>
  );
};

export default ToiletModelWithControls;