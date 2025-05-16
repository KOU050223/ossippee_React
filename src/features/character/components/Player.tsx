// src/components/Player.tsx
import { PointerLockControls, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  CapsuleCollider,
  interactionGroups,
  RapierRigidBody,
  RigidBody,
  useRapier
} from '@react-three/rapier'
import { IfInSessionMode } from '@react-three/xr'
import { useRef, useState } from 'react'
import type { PlayerMoveProps } from '../types.ts'
import { VRController } from './VRController.jsx'
import * as THREE from 'three'

//  定数 
const SPEED = 5
const direction   = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector  = new THREE.Vector3()

//  Player Component
export function Player () {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const [, get]      = useKeyboardControls()
  const { rapier, world } = useRapier()
  const [canJump, setCanJump] = useState(true)

  // 移動処理
  /** VR コントローラーから呼ばれる共通移動関数 */
  const playerMove = ({
    forward,
    backward,
    left,
    right,
    rotationYVelocity,
    newVelocity,
  }: PlayerMoveProps) => {
    if (!rigidBodyRef.current) return
    const velocity = rigidBodyRef.current.linvel()

    /* 現在の剛体回転を取得 */
    const currentQ = new THREE.Quaternion(
      rigidBodyRef.current.rotation().x,
      rigidBodyRef.current.rotation().y,
      rigidBodyRef.current.rotation().z,
      rigidBodyRef.current.rotation().w
    )

    /* rotationYVelocity が来ていれば Y 軸だけ回す（VR スティック旋回用） */
    if (rotationYVelocity !== 0) {
      currentQ.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, rotationYVelocity, 0, 'YXZ')
        )
      )
      rigidBodyRef.current.setRotation(currentQ, true)
    }

    /* VR モードで “絶対移動量” が来た場合はそれを優先 */
    if (newVelocity) {
      rigidBodyRef.current.setLinvel(
        { x: newVelocity.x, y: velocity.y, z: newVelocity.z },
        true
      )
      return
    }

    /* WASD → front / side ベクトルを合成（キーボード入力分）*/
    frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0))
    sideVector .set((left ? 1 : 0)     - (right  ? 1 : 0), 0, 0)

    direction
      .subVectors(frontVector, sideVector)
      .applyQuaternion(currentQ)        // プレイヤーの向きに合わせる
      .setY(0)
      .normalize()
      .multiplyScalar(SPEED)

    rigidBodyRef.current.setLinvel(
      { x: direction.x, y: velocity.y, z: direction.z },
      true
    )
  }

  // ジャンプ処理
  const playerJump = () => {
    if (!rigidBodyRef.current) return

    const pos = rigidBodyRef.current.translation()
    const ray = new rapier.Ray(pos, { x: 0, y: -1, z: 0 })
    const hit = world.castRay(ray, 1.1, true)
    const grounded = hit !== null || pos.y <= 1

    if (grounded) {
      setCanJump(true)
      if (canJump) {
        const vel = rigidBodyRef.current.linvel()
        rigidBodyRef.current.setLinvel({ x: vel.x, y: 7.5, z: vel.z }, true)
        setCanJump(false)
      }
    }
  }

  // 毎フレーム実行される処理
  useFrame((state) => {
    if (!rigidBodyRef.current) return

    /* 入力取得 */
    const { forward, backward, left, right, jump } = get()
    const velocity = rigidBodyRef.current.linvel()

    /* カメラのヨー角だけ抽出 */
    const camQ  = new THREE.Quaternion()
    state.camera.getWorldQuaternion(camQ)
    const yaw   = new THREE.Euler().setFromQuaternion(camQ, 'YXZ').y
    const yawQ  = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0, 'YXZ'))

    /* WASD を “視線方向” に変換 */
    frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0))
    sideVector .set((left ? 1 : 0)     - (right  ? 1 : 0), 0, 0)

    direction
      .subVectors(frontVector, sideVector)
      .applyQuaternion(yawQ)
      .normalize()
      .multiplyScalar(SPEED)

    rigidBodyRef.current.setLinvel(
      { x: direction.x, y: velocity.y, z: direction.z },
      true
    )

    /* プレイヤーモデルもカメラのヨーに合わせる */
    rigidBodyRef.current.setRotation(yawQ, true)

    /* カメラをプレイヤーに追従 */
    const p = rigidBodyRef.current.translation()
    state.camera.position.set(p.x, p.y, p.z)

    /* ジャンプ */
    if (jump) playerJump()
  })

  return (
    <>
      {/* マウスクリックでカーソルをロックして FPS 操作にする */}
      <PointerLockControls makeDefault />

      <RigidBody
        ref={rigidBodyRef}
        colliders={false}
        type="dynamic"
        mass={1}
        position={[0, 10, 0]}
        enabledRotations={[false, false, false]}          // 倒れ防止
        collisionGroups={interactionGroups([0], [0])}
      >
        {/* カプセルコライダーで当たり判定 */}
        <CapsuleCollider args={[0.7, 0.35]} />

        {/* VR セッション中だけ VRController を有効化 */}
        <IfInSessionMode allow={['immersive-vr']}>
          <VRController playerJump={playerJump} playerMove={playerMove} />
        </IfInSessionMode>
      </RigidBody>
    </>
  )
}

export default Player