/**
 * @file FBXModel.tsx
 * @description FBXモデルを読み込むコンポーネント
 * @user FBXLoaderを使用してFBXモデルを読み込む
 * @example
 * import FBXModel from '@/features/object/components/FBXModel';
 * <FBXModel
 *     modelUrl='/ToiletModel.fbx'
 *     scale={[0.01, 0.01, 0.01]}
 *     position={[0, -2.8, -2]}
 *     rotation={[0, 0, 0]}
 * />
 */
import type { FunctionComponent } from 'react';
type Props = {
    modelUrl: string | '';
    scale?: [number, number, number] | [1, 1, 1];
    position?: [number, number, number] | [0, 0, 0];
    rotation?: [number, number, number] | [0, 0, 0];
};
declare const FBXtModel: FunctionComponent<Props>;
export default FBXtModel;
