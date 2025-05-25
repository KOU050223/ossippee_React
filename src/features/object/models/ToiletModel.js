import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useEffect, useState, Suspense } from 'react';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from 'three';
// FBXモデルのURL（publicフォルダ内のファイルは/から始める）
// デプロイ環境でのパス問題を解決するため、複数の戦略を試行
const getToiletModelUrl = () => {
    // Vite環境でのベースURL取得
    const base = import.meta.env.BASE_URL || '/';
    const modelPath = 'ToiletModel.fbx';
    // 開発環境かどうかを判定
    const isDev = import.meta.env.DEV;
    let possibleUrls = [];
    if (isDev) {
        // 開発環境では通常のパス
        possibleUrls = [`/${modelPath}`];
    }
    else {
        // 本番環境では複数のパスパターンを試行
        const normalizedBase = base.endsWith('/') ? base : `${base}/`;
        possibleUrls = [
            `${normalizedBase}${modelPath}`,
            `/${modelPath}`,
            `./ToiletModel.fbx`,
            `/public/${modelPath}`,
            `${normalizedBase}public/${modelPath}`
        ];
    }
    console.log('🔧 ToiletModel URL構築:', {
        baseUrl: base,
        isDev,
        modelPath,
        possibleUrls,
        location: window.location.href
    });
    // 最初のURLを返す（フォールバック処理は後で実装）
    return possibleUrls[0];
};
// フォールバック用の簡易トイレモデル
const FallbackToilet = () => {
    return (_jsxs("group", { position: [0, -2.8, -2], scale: [3, 3, 3], children: [_jsxs("mesh", { position: [0, 0.5, 0], children: [_jsx("cylinderGeometry", { args: [0.4, 0.4, 0.1, 16] }), _jsx("meshStandardMaterial", { color: "white" })] }), _jsxs("mesh", { position: [0, 0, 0], children: [_jsx("cylinderGeometry", { args: [0.35, 0.3, 0.8, 16] }), _jsx("meshStandardMaterial", { color: "white" })] }), _jsxs("mesh", { position: [0, 0.8, -0.3], children: [_jsx("boxGeometry", { args: [0.6, 0.8, 0.3] }), _jsx("meshStandardMaterial", { color: "white" })] })] }));
};
// カスタムFBXローダーフック（複数URL試行機能付き）
const useFBXLoader = (initialUrl) => {
    const [fbx, setFbx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loader = new FBXLoader();
        loader.setPath('');
        // 複数のURLパターンを試行
        const tryUrls = [
            initialUrl,
            '/ToiletModel.fbx',
            './ToiletModel.fbx',
            '/public/ToiletModel.fbx',
            'ToiletModel.fbx'
        ];
        const loadModel = async () => {
            let lastError = null;
            for (const url of tryUrls) {
                try {
                    console.log(`🚀 FBXローダー: ファイル読み込み試行 ${url}`);
                    // まずファイルの存在確認
                    try {
                        const response = await fetch(url, { method: 'HEAD' });
                        if (!response.ok) {
                            throw new Error(`ファイルが見つかりません: ${url} (ステータス: ${response.status})`);
                        }
                        console.log('✅ FBXファイル存在確認成功:', url);
                    }
                    catch (fetchError) {
                        console.warn(`⚠️ FBXファイル存在確認失敗 (${url}):`, fetchError);
                        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
                        continue; // 次のURLを試行
                    }
                    const loadedFbx = await new Promise((resolve, reject) => {
                        loader.load(url, (object) => {
                            console.log('✅ FBXローダー: 読み込み成功', object);
                            resolve(object);
                        }, (progress) => {
                            console.log('📦 FBXローダー: 読み込み進行', Math.round((progress.loaded / progress.total) * 100) + '%');
                        }, (error) => {
                            console.error('❌ FBXローダー: 読み込み失敗', error);
                            reject(error);
                        });
                    });
                    setFbx(loadedFbx);
                    setLoading(false);
                    return; // 成功したので終了
                }
                catch (err) {
                    console.warn(`❌ URL ${url} での読み込み失敗:`, err);
                    lastError = err instanceof Error ? err : new Error(String(err));
                    continue; // 次のURLを試行
                }
            }
            // すべてのURLで失敗した場合
            console.error('❌ すべてのURLでFBX読み込み失敗');
            setError(lastError?.message || 'すべてのURLで読み込みに失敗しました');
            setLoading(false);
        };
        loadModel();
    }, [initialUrl]);
    return { fbx, loading, error };
};
// FBXモデルコンポーネント
const FBXToiletModel = () => {
    const toiletModelUrl = getToiletModelUrl();
    const { fbx, loading, error } = useFBXLoader(toiletModelUrl);
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
    if (loading) {
        return _jsx(FallbackToilet, {});
    }
    if (error) {
        console.warn('FBXモデルの読み込みエラー:', error);
        return _jsx(FallbackToilet, {});
    }
    if (!fbx) {
        return _jsx(FallbackToilet, {});
    }
    // プリミティブとしてFBXを直接レンダリング
    return (_jsx("primitive", { ref: modelRef, object: fbx }));
};
// メインコンポーネント
const ToiletModel = () => {
    // 追加のライトを設置（モデルを照らすため）
    const ExtraLights = () => {
        return (_jsxs(_Fragment, { children: [_jsx("pointLight", { position: [0, 0, 2], intensity: 1, color: "#ffffff" }), _jsx("pointLight", { position: [2, 0, 0], intensity: 0.8, color: "#ffeecc" }), _jsx("pointLight", { position: [-2, 0, 0], intensity: 0.8, color: "#ccffee" }), _jsx("pointLight", { position: [0, 0, -2], intensity: 0.8, color: "#eeccff" }), _jsx("ambientLight", { intensity: 0.6 })] }));
    };
    return (_jsxs(Suspense, { fallback: _jsx(FallbackToilet, {}), children: [_jsx(FBXToiletModel, {}), _jsx(ExtraLights, {})] }));
};
export default ToiletModel;
