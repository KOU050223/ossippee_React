/**
 * @file GLTFModel.tsx
 * @description GLTFモデルを読み込むコンポーネント
 * @user GLTFLoaderを使用してGLTFモデルを読み込む
 * @example
 * import GLTFModel from '../features/object/components/GLTFModel';
 * <GLTFModel
 *     modelUrl='/public/ToiletModel.fbx'
 *     scale={[0.01, 0.01, 0.01]}
 *     position={[0, -2.8, -2]}
 *     rotation={[0, 0, 0]}
 * />
 * 
 */

import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
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
const GLTFModel:FunctionComponent<Props> = ({modelUrl,scale,position,rotation }: Props) => {
  // GLTFをロード
  const { scene } = useLoader(GLTFLoader, modelUrl);
  return <primitive object={scene} scale={scale} position={position} rotation={rotation} />;
}

export default GLTFModel;