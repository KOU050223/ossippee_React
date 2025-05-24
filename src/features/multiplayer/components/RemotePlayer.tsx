import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { PlayerState } from '../types';

interface RemotePlayerProps {
  playerId: string;
  playerState: PlayerState;
  color?: string;
}

export const RemotePlayer: React.FC<RemotePlayerProps> = ({ 
  playerId, 
  playerState, 
  color = '#00ff00' 
}) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Quaternion());
  const currentPosition = useRef(new THREE.Vector3());
  const currentRotation = useRef(new THREE.Quaternion());

  // プレイヤー状態が更新された時にターゲット位置/回転を設定
  useEffect(() => {
    if (playerState.position) {
      targetPosition.current.set(
        playerState.position.x,
        playerState.position.y,
        playerState.position.z
      );
    }
    
    if (playerState.rotation) {
      targetRotation.current.set(
        playerState.rotation.x,
        playerState.rotation.y,
        playerState.rotation.z,
        playerState.rotation.w
      );
    }
  }, [playerState.position, playerState.rotation]);

  // 初期位置の設定
  useEffect(() => {
    if (rigidBodyRef.current && playerState.position) {
      currentPosition.current.set(
        playerState.position.x,
        playerState.position.y,
        playerState.position.z
      );
      
      rigidBodyRef.current.setTranslation(
        { 
          x: playerState.position.x, 
          y: playerState.position.y, 
          z: playerState.position.z 
        }, 
        true
      );
    }
  }, []);

  // スムーズな補間でリモートプレイヤーの位置と回転を更新
  useFrame((_, delta) => {
    if (!rigidBodyRef.current || !meshRef.current) return;

    const lerpFactor = Math.min(delta * 8, 1); // 8倍速で補間、最大1.0

    // 位置の補間
    currentPosition.current.lerp(targetPosition.current, lerpFactor);
    rigidBodyRef.current.setTranslation(
      {
        x: currentPosition.current.x,
        y: currentPosition.current.y,
        z: currentPosition.current.z
      },
      true
    );

    // 回転の補間（メッシュに適用）
    currentRotation.current.slerp(targetRotation.current, lerpFactor);
    meshRef.current.quaternion.copy(currentRotation.current);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      colliders={false}
      userData={{ isRemotePlayer: true, playerId }}
    >
      {/* プレイヤーの視覚的表現 */}
      <mesh ref={meshRef} castShadow>
        <capsuleGeometry args={[0.35, 1.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* プレイヤー名表示 */}
      <mesh position={[0, 2.2, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial color="white" />
      </mesh>
      
      {/* 名前テキスト（簡易版、実際のテキストレンダリングにはHTMLまたはテキストテクスチャが必要） */}
      <mesh position={[0, 2.25, 0.01]}>
        <planeGeometry args={[1.8, 0.3]} />
        <meshBasicMaterial color="black" />
      </mesh>

      {/* 当たり判定 */}
      <CapsuleCollider args={[0.7, 0.35]} />

      {/* ポイント表示（optional） */}
      {playerState.points > 0 && (
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="gold" />
        </mesh>
      )}

      {/* ゲームオーバー状態の表示 */}
      {playerState.isGameOver && (
        <mesh position={[0, 3.2, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}
    </RigidBody>
  );
};

export default RemotePlayer;
