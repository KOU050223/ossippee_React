// test用カメラデバッグコンポーネント
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function CameraDirectionLogger () {
  const { camera } = useThree()

  useFrame(() => {
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    console.log('camera direction:', dir.x, dir.y, dir.z)
  })

  return null          // 描画物は不要なので null を返す
}
export default CameraDirectionLogger