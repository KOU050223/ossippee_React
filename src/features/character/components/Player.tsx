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
import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import type { PlayerMoveProps } from '../types.ts' 
import { VRController } from './VRController.jsx' 
import * as THREE from 'three'

// 定数
const SPEED = 10;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

type PlayerHandle = {
  getPosition: () => { x: number; y: number; z: number } | null;
  addPoint: () => void;
  setOrientation: (lookAtPoint: { x: number; y: number; z: number }) => void;
};

// Player Component
export const Player = forwardRef<PlayerHandle, {}>((_, ref) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const [canJump, setCanJump] = useState(true);
  const [point, setPoint] = useState(0);

  // 親コンポーネントに公開するメソッド
  useImperativeHandle(ref, () => ({
    getPosition: () => {
      const currentRigidBody = rigidBodyRef.current;
      if (currentRigidBody) {
        const pos = currentRigidBody.translation();
        if (pos) {
          return { x: pos.x, y: pos.y, z: pos.z };
        }
      }
      console.warn("Player.getPosition(): rigidBodyRef.current またはその translation が利用できません。");
      return null;
    },
    addPoint: () => {
      setPoint((prevPoint) => {
        const newPoint = prevPoint + 1;
        console.log('Point:', newPoint);
        return newPoint;
      });
    },
    setOrientation: (lookAtPoint: { x: number; y: number; z: number }) => {
      if (rigidBodyRef.current) {
        const currentPosition = rigidBodyRef.current.translation();
        if (!currentPosition) {
          console.warn("Player.setOrientation: プレイヤーの現在位置が取得できません。");
          return;
        }

        const targetVec = new THREE.Vector3(lookAtPoint.x, lookAtPoint.y, lookAtPoint.z);
        const currentPosVec = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z);

        if (currentPosVec.equals(targetVec)) {
          console.warn("Player.setOrientation: 目標地点が現在位置と同じです。");
          return;
        }
        
        const matrix = new THREE.Matrix4();
        matrix.lookAt(currentPosVec, targetVec, new THREE.Vector3(0, 1, 0));
        const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
        
        rigidBodyRef.current.setRotation(quaternion, true);
      } else {
        console.warn("Player.setOrientation: rigidBodyRef.current が利用できません。");
      }
    }
  }), []);

  // 移動処理 (VR コントローラーから呼ばれる共通移動関数)
  const playerMove = ({
    forward,
    backward,
    left,
    right,
    rotationYVelocity,
    newVelocity,
  }: PlayerMoveProps) => {
    if (!rigidBodyRef.current) return;
    const velocity = rigidBodyRef.current.linvel();

    const currentRigidBodyRotation = rigidBodyRef.current.rotation();
    const currentQ = new THREE.Quaternion(
      currentRigidBodyRotation.x,
      currentRigidBodyRotation.y,
      currentRigidBodyRotation.z,
      currentRigidBodyRotation.w
    );

    if (rotationYVelocity !== 0) {
      currentQ.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, rotationYVelocity, 0, 'YXZ')
        )
      );
      rigidBodyRef.current.setRotation(currentQ, true);
    }

    if (newVelocity) {
      rigidBodyRef.current.setLinvel(
        { x: newVelocity.x, y: velocity.y, z: newVelocity.z },
        true
      );
      return;
    }

    frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .applyQuaternion(currentQ) // プレイヤーの現在の向きに合わせる
      .setY(0)
      .normalize()
      .multiplyScalar(SPEED);

    rigidBodyRef.current.setLinvel(
      { x: direction.x, y: velocity.y, z: direction.z },
      true
    );
  };

  // ジャンプ処理
  const playerJump = () => {
    if (!rigidBodyRef.current) return;

    const pos = rigidBodyRef.current.translation();
    if (!pos) { // 安全のためのチェック
        console.warn("Player.playerJump: Player position not available for raycasting.");
        return;
    }
    const ray = new rapier.Ray(pos, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 1.1, true);
    const grounded = hit !== null || pos.y <= 1; // pos.y <=1 はフォールバック的な接地判定

    if (grounded) {
      setCanJump(true); // 再度ジャンプ可能に
      // 以前のコードでは if(canJump) のブロックが接地判定とcanJump両方に依存していました。
      // 接地したら常にジャンプ可能にするか、canJumpフラグを厳密に使うかで挙動が変わります。
      // ここでは接地したらジャンプ準備完了とし、実際にjump入力があったときにcanJumpをチェックします。
      // (useFrame内のjump呼び出しでcanJumpが再度チェックされる想定でしたが、
      // playerJumpが直接呼ばれるならこの中でcanJumpをチェックして消費するのが自然です)
      // 以下は元のロジックに近い形でcanJumpをすぐに消費します。
      if (canJump) { 
        const vel = rigidBodyRef.current.linvel();
        rigidBodyRef.current.setLinvel({ x: vel.x, y: 7.5, z: vel.z }, true);
        setCanJump(false); // ジャンプしたらfalseに
      }
    }
  };

  // 毎フレーム実行される処理
  useFrame((state) => {
    if (!rigidBodyRef.current) return;

    const { /* forward, backward, */ left, right, jump } = get();
    const velocity = rigidBodyRef.current.linvel();

    const playerWorldRotation = rigidBodyRef.current.rotation();
    const playerQuaternion = new THREE.Quaternion(
      playerWorldRotation.x,
      playerWorldRotation.y,
      playerWorldRotation.z,
      playerWorldRotation.w
    );

    frontVector.set(0, 0, -1); // 常に前進 (プレイヤーのローカルZ軸負方向)
    sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0); // 左右入力 (プレイヤーのローカルX軸方向)

    direction
      .subVectors(frontVector, sideVector)
      .applyQuaternion(playerQuaternion) // プレイヤー自身の現在の向きに合わせる
      .setY(0) 
      .normalize()
      .multiplyScalar(SPEED);

    rigidBodyRef.current.setLinvel(
      { x: direction.x, y: velocity.y, z: direction.z },
      true
    );

    // プレイヤーモデルの回転はカメラのヨー角に合わせない (削除済み)

    // カメラをプレイヤーの位置に追従
    const p = rigidBodyRef.current.translation();
    if (p) {
      state.camera.position.set(p.x, p.y, p.z);
    }

    // ジャンプ入力処理
    if (jump) {
        // playerJump内で接地判定とcanJumpフラグのチェックが行われる
        playerJump(); 
    }
  });

  return (
    <>
      <PointerLockControls makeDefault />
      <RigidBody
        ref={rigidBodyRef}
        colliders={false} // 手動でCapsuleColliderを設定するためfalse
        type="dynamic"
        mass={1}
        position={[0, 10, 0]} // 初期位置
        enabledRotations={[false, false, false]} // 物理演算による回転を無効化
        collisionGroups={interactionGroups([0], [0])} // 必要に応じて調整
      >
        <CapsuleCollider args={[0.7, 0.35]} /> {/* 半径0.35, 高さ0.7*2 のカプセル */}
        <IfInSessionMode allow={['immersive-vr']}>
          <VRController playerJump={playerJump} playerMove={playerMove} />
        </IfInSessionMode>
      </RigidBody>
    </>
  );
});

export default Player;