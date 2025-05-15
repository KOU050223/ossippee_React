//Player.tsx
import { useKeyboardControls } from '@react-three/drei'
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

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

const vector3Obj = new THREE.Vector3()
const quaternionFunc = new THREE.Quaternion()
const quaternionFunc2 = new THREE.Quaternion()
const eulerAngles = new THREE.Euler()

export function Player(){
  // プレイヤーの剛体（RigidBody）への参照
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  // 物理エンジンとワールドを取得
  const { rapier, world } = useRapier()
  // キーボードコントロールを取得（forward, backward, left, right, jumpなど）
  const [, get] = useKeyboardControls()
  // ジャンプ可能かどうかのフラグ
  const [canJump, setCanJump] = useState(true)

  // プレイヤー移動関数
  const playerMove = ({
    forward,
    backward,
    left,
    right,
    rotationYVelocity,
    velocity,
    newVelocity,
  }: PlayerMoveProps) => {
    // 剛体が存在しなければ何もしない
    if (rigidBodyRef.current == null) {
      return
    }

    // 速度が未指定なら現在の剛体速度を使用
    if (!velocity) {
      velocity = rigidBodyRef.current?.linvel()
    }

    // 回転を適用
    // プレイヤーの向きをrotationYVelocityに応じて回転させる
    const { x, y, z, w } = rigidBodyRef.current.rotation()
    quaternionFunc.set(x, y, z, w)
    // rotationYVelocityに基づいてY軸周りの回転を計算し、quaternionFuncに適用
    // eulerAngles.set(0, rotationYVelocity, 0, 'YXZ')で回転を指定し、
    // setFromEulerでオイラー角をクォータニオンに変換
    quaternionFunc.multiply(quaternionFunc2.setFromEuler(eulerAngles.set(0, rotationYVelocity, 0, 'YXZ')))
    rigidBodyRef.current?.setRotation(quaternionFunc, true)

    // VRモードの場合はnewVelocityを直接適用
    if (newVelocity) {
      // VRモードではnewVelocityをそのまま利用（前後左右の移動量）
      rigidBodyRef.current?.setLinvel({ x: newVelocity.x, y: velocity?.y ?? 0, z: newVelocity.z }, true)
      return
    }

    // キーボード入力による前後左右の方向計算
    frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0))
    sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0)
    direction
      .subVectors(frontVector, sideVector)
      .applyQuaternion(quaternionFunc) // プレイヤーの現在の向きを考慮
      .setComponent(1, 0)
      .normalize()
      .multiplyScalar(SPEED)

    // 計算した方向で剛体の速度を設定
    rigidBodyRef.current?.setLinvel({ x: direction.x, y: velocity?.y ?? 0, z: direction.z }, true)
  }

  // プレイヤーのジャンプ処理
  const playerJump = (() => {
    if (!rigidBodyRef.current) return
    const position = rigidBodyRef.current.translation()
    // 下方向へのレイキャストで地面との接地判定
    const ray = new rapier.Ray(position, { x: 0, y: -1, z: 0 })
    const hit = world.castRay(ray, 1.1, true)
    const grounded = hit !== null || position.y <= 1
    if (grounded) {
      // 地面に接地しているならジャンプ可能にする
      setCanJump(true)
      if (canJump) {
        // ジャンプ力を上方向に付与
        const velocity = rigidBodyRef.current.linvel()
        rigidBodyRef.current.setLinvel({ x: velocity.x, y: 7.5, z: velocity.z }, true)
        setCanJump(false)
      }
    }
  })

  // 毎フレーム更新処理
  useFrame((state) => {
    if (rigidBodyRef.current == null) {
      return
    }
    // キーボード入力状態を取得
    const { forward, backward, left, right, jump } = get()
    const velocity = rigidBodyRef.current.linvel()

    // 速度ベクトルをコピー
    vector3Obj.set(velocity.x, velocity.y, velocity.z)

    // プレイヤーの位置にカメラを追従
    const { x, y, z } = rigidBodyRef.current.translation()
    state.camera.position.set(x, y, z)

    if (rigidBodyRef.current) {
      // キーボード操作による移動処理
      playerMove({
        forward,
        backward,
        left,
        right,
        rotationYVelocity: 0,
        velocity,
      })

      // スペースキーでジャンプ
      if (jump) {
        playerJump()
      }
    }
  })

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[0, 10, 0]}
        enabledRotations={[false, false, false]} // 回転を固定して、キャラクターが倒れないようにする
        collisionGroups={interactionGroups([0], [0])}
      >
        {/* カプセル型のコライダーでプレイヤーの当たり判定を定義 */}
        <CapsuleCollider args={[1, 0.7]} />

        {/* VRセッション中のみVRControllerを使用してVRモードの操作を有効化 */}
        <IfInSessionMode allow={['immersive-vr']}>
          <VRController playerJump={playerJump} playerMove={playerMove} />
        </IfInSessionMode>
      </RigidBody>
    </>
  )
}

export default Player