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
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { RigidBody, MeshCollider, RapierRigidBody } from "@react-three/rapier";
import { useMemo, memo, forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

// --------------------
// 型定義
// --------------------
export type GLTFModelProps = {
  /** 読み込む .gltf / .glb のパス（必須） */
  modelUrl: string;
  /** three.js の scale */
  scale?: [number, number, number];
  /** three.js の position */
  position?: [number, number, number];
  /** three.js の rotation(Euler) */
  rotation?: [number, number, number];
  /** Rapier RigidBody type  (default: "fixed") */
  rigidBodyType?: "dynamic" | "fixed" | "kinematicPosition" | "kinematicVelocity";
  /** コライダー種類 ("trimesh" | "hull")  */
  colliderType?: "trimesh" | "hull";
  /** 物理判定を付けるかどうか (default: true) */
  withPhysics?: boolean;
  /** RigidBody に渡す追加プロパティ */
  rigidBodyProps?: Omit<ComponentPropsWithoutRef<typeof RigidBody>, "children" | "type">;
};

// --------------------
// 実装
// --------------------
const GLTFModel = forwardRef<RapierRigidBody, GLTFModelProps>(
  (
    {
      modelUrl,
      scale = [1, 1, 1],
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      rigidBodyType = "fixed",
      colliderType = "trimesh",
      withPhysics = true,
      rigidBodyProps,
    },
    ref,
  ) => {
    // GLTF の読み込み
    const gltf = useLoader(GLTFLoader, modelUrl);

    // 既存シーンを clone して使いまわす（GLTFLoader が返す scene は共有されるため）
    const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

    // ----------------- 物理なしの場合 -----------------
    if (!withPhysics) {
      return (
        <primitive
          object={scene}
          scale={scale}
          position={position}
          rotation={rotation}
        />
      );
    }

    // ----------------- 物理ありの場合 -----------------
    return (
      <RigidBody
        type={rigidBodyType}
        colliders={false}
        ref={ref as any}
        {...rigidBodyProps}
      >
        <MeshCollider type={colliderType}>
          <primitive
            object={scene}
            scale={scale}
            position={position}
            rotation={rotation}
          />
        </MeshCollider>
      </RigidBody>
    );
  },
);

export default memo(GLTFModel);
