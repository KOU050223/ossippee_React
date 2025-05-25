import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from 'three';
// FBXモデルのURL（publicフォルダ内のファイルは/から始める）
const toiletModelUrl = '/ToiletModel.fbx';
// フォールバック用の簡易トイレモデル
const FallbackToilet = () => {
    return (_jsxs("group", { position: [0, -2.8, -2], scale: [3, 3, 3], children: [_jsxs("mesh", { position: [0, 0.5, 0], children: [_jsx("cylinderGeometry", { args: [0.4, 0.4, 0.1, 16] }), _jsx("meshStandardMaterial", { color: "white" })] }), _jsxs("mesh", { position: [0, 0, 0], children: [_jsx("cylinderGeometry", { args: [0.35, 0.3, 0.8, 16] }), _jsx("meshStandardMaterial", { color: "white" })] }), _jsxs("mesh", { position: [0, 0.8, -0.3], children: [_jsx("boxGeometry", { args: [0.6, 0.8, 0.3] }), _jsx("meshStandardMaterial", { color: "white" })] })] }));
};
// FBXローダーコンポーネント
const FBXToiletModel = () => {
    const fbx = useLoader(FBXLoader, toiletModelUrl);
    const modelRef = useRef(null);
    // FBXがロードされた後の処理
    useEffect(() => {
        if (fbx) {
            console.log("トイレモデルが読み込まれました", fbx);
            // スケールと位置を調整
            fbx.scale.set(3, 3, 3);
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
                            child.material.forEach((material) => {
                                // マテリアルを白色に設定
                                material.color = new THREE.Color(0xffffff);
                                material.emissive = new THREE.Color(0x222222);
                                material.emissiveIntensity = 0.2;
                                material.metalness = 0.1;
                                material.roughness = 0.8;
                                material.side = THREE.DoubleSide; // 両面描画
                            });
                        }
                        else {
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
            if (!fbx)
                return;
            const step = 0.1;
            switch (e.key) {
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
            console.log("モデル位置:", fbx.position.x.toFixed(2), fbx.position.y.toFixed(2), fbx.position.z.toFixed(2), "回転:", fbx.rotation.y.toFixed(2), "スケール:", fbx.scale.x.toFixed(2));
            e.preventDefault();
        };
        if (fbx) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [fbx]);
    // プリミティブとしてFBXを直接レンダリング
    return (_jsx(_Fragment, { children: fbx && (_jsx("primitive", { ref: modelRef, object: fbx })) }));
};
// エラーバウンダリー付きのメインコンポーネント
const ToiletModel = () => {
    const [hasError, setHasError] = useState(false);
    // 追加のライトを設置（モデルを照らすため）
    const ExtraLights = () => {
        return (_jsxs(_Fragment, { children: [_jsx("pointLight", { position: [0, 0, 2], intensity: 1, color: "#ffffff" }), _jsx("pointLight", { position: [2, 0, 0], intensity: 0.8, color: "#ffeecc" }), _jsx("pointLight", { position: [-2, 0, 0], intensity: 0.8, color: "#ccffee" }), _jsx("pointLight", { position: [0, 0, -2], intensity: 0.8, color: "#eeccff" }), _jsx("ambientLight", { intensity: 0.6 })] }));
    };
    if (hasError) {
        console.warn('FBXモデルの読み込みに失敗しました。フォールバックモデルを使用します。');
        return (_jsxs(_Fragment, { children: [_jsx(FallbackToilet, {}), _jsx(ExtraLights, {})] }));
    }
    return (_jsx(Suspense, { fallback: _jsx(FallbackToilet, {}), children: _jsxs(ErrorBoundary, { onError: () => setHasError(true), children: [_jsx(FBXToiletModel, {}), _jsx(ExtraLights, {})] }) }));
};
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidCatch(error, errorInfo) {
        console.error('FBX loading error:', error, errorInfo);
        this.props.onError();
    }
    render() {
        return this.props.children;
    }
}
export default ToiletModel;
