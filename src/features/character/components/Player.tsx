import * as THREE from 'three'; // THREE をインポート
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
import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import type { PlayerMoveProps } from '../types.ts' 
import { VRController } from './VRController.jsx' 

const SPEED = 30;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

const PATIENCE_INCREASE_INTERVAL = 10; // 我慢ゲージが増加する間隔 (ms)
const PATIENCE_INCREASE_AMOUNT = 10 // 我慢ゲージの増加量

export interface PlayerHandle {
  getPosition: () => { x: number; y: number; z: number } | null;
  getOrientation: () => { x: number; y: number; z: number; w: number } | null;
  setOrientation: (target: THREE.Vector3) => void; // THREE.Vector3 を使用
  setPlayerRotation: (rotation: THREE.Quaternion | { y: number }) => void; // THREE.Quaternion を使用
  toggleFreeLook: () => void;
  addPoint: () => void;
  getPoint: () => number;
  increasePatience: (amount: number) => void;
  decreasePatience: (amount: number) => void;
  getPatience: () => number;
  isGameOver: () => boolean;
}

const MAX_PATIENCE = 100; // 我慢ゲージの最大値

export interface PlayerProps {
  disableForward?: boolean;
  gameStarted?: boolean;
  position?: [number, number, number]; // 追加
}

// Player Component
export const Player = forwardRef<PlayerHandle, PlayerProps>(({ disableForward = false, gameStarted = true, position = [0, 4, -10] }, ref) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls(); // get関数を取得
  const { rapier, world } = useRapier();
  const [canJump, setCanJump] = useState(true);
  const [point, setPoint] = useState(0);
  const [patience, setPatience] = useState(0); // 我慢ゲージの状態
  const [isGameOver, setIsGameOver] = useState(false); // ゲームオーバー状態

  const [useFreeLook, setUseFreeLook] = useState(true); // 初期値: 自由移動モード

  // 我慢ゲージを時間経過で増加させる
  useEffect(() => {
    if (!gameStarted || isGameOver) return;
    const intervalId = setInterval(() => {
      setPatience(prevPatience => {
        const newPatience = Math.min(prevPatience + PATIENCE_INCREASE_AMOUNT, MAX_PATIENCE);
        if (newPatience >= MAX_PATIENCE) {
          setIsGameOver(true);
          console.log("ゲームオーバー");
        }
        return newPatience;
      });
    }, PATIENCE_INCREASE_INTERVAL);
    return () => clearInterval(intervalId); // クリーンアップ
  }, [isGameOver, gameStarted]);

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
      if (!gameStarted) return;
      setPoint((prevPoint) => {
        const newPoint = prevPoint + 1;
        console.log('Point:', newPoint);
        return newPoint;
      });
    },
    getPoint: () => point,
    setOrientation: (lookAtPoint: { x: number; y: number; z: number }) => {
      if (useFreeLook) {
        console.warn("Player.setOrientation: 自由移動モードでは手動の向き設定は推奨されません（カメラに依存するため）。");
        // 自由移動モードでも向きを固定したい場合は、この警告を削除し、
        // useFreeLookをfalseにするなどの制御を追加検討してください。
        // return; // 必要に応じてコメントアウト解除
      }
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
    },
    toggleFreeLook: () => {
      setUseFreeLook(prev => !prev);
    },
    getOrientation: () => { // getOrientationメソッドの実装
      if (rigidBodyRef.current) {
        const rotation = rigidBodyRef.current.rotation();
        return { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w };
      }
      console.warn("Player.getOrientation(): rigidBodyRef.current が利用できません。");
      return null;
    },
    setPlayerRotation: (rotation: THREE.Quaternion | { y: number }) => {
      if (rigidBodyRef.current) {
        if ('w' in rotation) { // Quaternion の場合
          rigidBodyRef.current.setRotation(rotation, true);
        } else { // { y: number } (relativeYaw) の場合
          const currentRotation = rigidBodyRef.current.rotation();
          const currentQuaternion = new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w);
          const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation.y);
          currentQuaternion.multiply(yawQuaternion);
          rigidBodyRef.current.setRotation(currentQuaternion, true);
        }
      }
    },
    increasePatience: (amount: number) => {
      if (!isGameOver) {
        setPatience(prev => {
          const newPatience = Math.min(prev + amount, MAX_PATIENCE);
          if (newPatience >= MAX_PATIENCE) {
            setIsGameOver(true);
          }
          return newPatience;
        });
      }
    },
    decreasePatience: (amount: number) => {
      if (!isGameOver) {
        setPatience(prev => Math.max(prev - amount, 0));
      }
    },
    getPatience: () => patience,
    isGameOver: () => isGameOver,
  }), [useFreeLook, point, patience, isGameOver, gameStarted]); 

  useEffect(() => {
    console.log(`移動モード変更: ${useFreeLook ? '自由移動モード（手動前後進）' : '固定向きモード（自動前進）'}`);
  }, [useFreeLook]);


  // 移動処理 (VR コントローラーから呼ばれる共通移動関数)
  // VR時の移動ロジックは useFreeLook モードの影響を受けない想定
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

    // VR入力に基づく前後左右
    frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .applyQuaternion(currentQ)
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
    if (!pos) {
        console.warn("Player.playerJump: Player position not available for raycasting.");
        return;
    }
    const ray = new rapier.Ray(pos, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 1.1, true);
    const grounded = hit !== null || pos.y <= 1;

    if (grounded) {
      setCanJump(true);
      if (canJump) { 
        const vel = rigidBodyRef.current.linvel();
        rigidBodyRef.current.setLinvel({ x: vel.x, y: 7.5, z: vel.z }, true);
        setCanJump(false);
      }
    }
  };

  // 毎フレーム実行される処理
  useFrame((state) => {
    if (!rigidBodyRef.current) return;
    if (!gameStarted) return;
    console.log("我慢ゲージ",patience);

    // ★変更点: forward, backward を入力から取得するように戻す
    const { forward, backward, left, right, jump } = get();
    const velocity = rigidBodyRef.current.linvel();

    // --- 移動と回転のモード切り替え ---
    if (useFreeLook) {
      // 【自由移動モード】 (カメラに追従、手動で前後左右移動)
      const camQ = new THREE.Quaternion();
      state.camera.getWorldQuaternion(camQ);
      const yaw = new THREE.Euler().setFromQuaternion(camQ, 'YXZ').y;
      const yawQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0, 'YXZ'));

      // ★変更点: WASD(前後左右) を “視線方向” に変換 (手動前後進)
      frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0)); // W/Sキーによる前後移動
      sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0);     // A/Dキーによる左右移動

      direction
        .subVectors(frontVector, sideVector)
        .applyQuaternion(yawQ) // カメラの向きに合わせる
        .setY(0)
        .normalize()
        .multiplyScalar(SPEED);

      // 移動ベクトルが0でなければ速度を設定 (キーが押されていないときは慣性を打ち消すため)
      if (direction.lengthSq() > 0) {
          rigidBodyRef.current.setLinvel(
            { x: direction.x, y: velocity.y, z: direction.z },
            true
          );
      } else {
          rigidBodyRef.current.setLinvel(
            { x: 0, y: velocity.y, z: 0 }, // 左右前後の動きを止める
            true
          );
      }
      
      // プレイヤーモデルもカメラのヨーに合わせる
      rigidBodyRef.current.setRotation(yawQ, true);

    } else {
      if (disableForward) {
        const velocity = rigidBodyRef.current.linvel();
        rigidBodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
        return;
      }
      // 【固定向きモード】 (カメラと独立、自動前進、左右移動のみ手動)
      const playerWorldRotation = rigidBodyRef.current.rotation();
      const playerQuaternion = new THREE.Quaternion(
        playerWorldRotation.x,
        playerWorldRotation.y,
        playerWorldRotation.z,
        playerWorldRotation.w
      );

      frontVector.set(0, 0, -1); // 自動前進 (プレイヤーのローカルZ軸負方向)
      sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0); // A/Dキーによる左右移動

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
      // プレイヤーモデルの回転はカメラのヨー角に合わせない
    }
    // --- ここまで移動と回転のモード切り替え ---

    // カメラをプレイヤーの位置に追従 (全モード共通)
    const p = rigidBodyRef.current.translation();
    if (p) {
      state.camera.position.set(p.x, p.y, p.z);
    }

    // ジャンプ入力処理 (全モード共通)
    if (jump) {
        playerJump(); 
    }
  });

  return (
    <>
      <PointerLockControls makeDefault />
      <RigidBody
        ref={rigidBodyRef}
        colliders={false}
        type="dynamic"
        mass={1}
        position={position} // ここで反映
        rotation={[0, -0.28, 0]}
        enabledRotations={[false, false, false]}
        collisionGroups={interactionGroups([0], [0])}
      >
        <CapsuleCollider args={[0.7, 0.35]} />
        <IfInSessionMode allow={['immersive-vr']}>
          <VRController playerJump={playerJump} playerMove={playerMove} />
        </IfInSessionMode>
      </RigidBody>
    </>
  );
});

export default Player;