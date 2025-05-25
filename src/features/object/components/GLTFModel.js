import { jsx as _jsx } from "react/jsx-runtime";
/*
 * GLTFModel.tsx
 * --------------------------
 * GLTF/GLB モデルを読み込み、オプションで Rapier の剛体＆コライダーを付与する汎用コンポーネント。
 *
 * @example
 * <GLTFModel
 *   modelUrl="/models/toilet.glb"
 *   scale={[0.01, 0.01, 0.01]}
 *   position={[0, -2.8, -2]}
 *   colliderType="trimesh"   // "hull" も可
 * />
 */
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RigidBody, MeshCollider, RapierRigidBody } from "@react-three/rapier";
import { useMemo, memo, forwardRef, useEffect } from "react";
// --------------------
// 実装
// --------------------
const GLTFModel = forwardRef(({ modelUrl, scale = [1, 1, 1], position = [0, 0, 0], rotation = [0, 0, 0], rigidBodyType = "fixed", colliderType = "trimesh", withPhysics = true, rigidBodyProps, }, ref) => {
    // GLTF の読み込み
    const gltf = useLoader(GLTFLoader, modelUrl);
    // 既存シーンを clone して使いまわす（GLTFLoader が返す scene は共有されるため）
    const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    // ----------------- 物理なしの場合 -----------------
    if (!withPhysics) {
        return (_jsx("primitive", { object: scene, scale: scale, position: position, rotation: rotation }));
    }
    useEffect(() => { console.log('GLTFModel mounted'); }, []);
    // ----------------- 物理ありの場合 -----------------
    return (_jsx(RigidBody, { type: rigidBodyType, colliders: false, ref: ref, ...rigidBodyProps, children: _jsx(MeshCollider, { type: colliderType, children: _jsx("primitive", { object: scene, scale: scale, position: position, rotation: rotation }) }) }));
});
export default memo(GLTFModel);
