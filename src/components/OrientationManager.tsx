import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PlayerHandle } from '@/features/character/components/Player'; 
import * as THREE from 'three'; // THREEをインポート

interface OrientationPoint {
  id: string;
  triggerPosition: { x: number; y: number; z: number };
  lookAtTarget?: { x: number; y: number; z: number }; // オプショナルに変更
  targetRotation?: { x: number; y: number; z: number; w: number }; // 新しいプロパティ
  relativeYaw?: number; // Y軸周りの相対回転角度 (ラジアン単位)
  threshold?: number;
}

interface OrientationManagerProps {
  playerRef: React.RefObject<PlayerHandle>;
  orientationPoints: OrientationPoint[];
}

const OrientationManager: React.FC<OrientationManagerProps> = ({ playerRef, orientationPoints }) => {
  const [processedPoints, setProcessedPoints] = useState<Record<string, boolean>>({});

  useFrame(() => {
    if (!playerRef.current) return;

    const playerPosition = playerRef.current.getPosition();
    const currentOrientation = playerRef.current.getOrientation(); // 現在の向きを取得

    if (!playerPosition || !currentOrientation) return;

    orientationPoints.forEach((point) => {
      if (!processedPoints[point.id]) {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - point.triggerPosition.x, 2) +
          Math.pow(playerPosition.y - point.triggerPosition.y, 2) + // Y座標も考慮
          Math.pow(playerPosition.z - point.triggerPosition.z, 2)
        );

        if (distance < (point.threshold || 1.5)) {
          console.log(`Player reached orientation point: ${point.id}.`);
          if (point.targetRotation) {
            console.log('Setting player rotation to:', point.targetRotation);
            playerRef.current?.setPlayerRotation(point.targetRotation);
          } else if (point.lookAtTarget) { // lookAtTarget が存在する場合のみ実行
            console.log('Setting player orientation to look at:', point.lookAtTarget);
            playerRef.current?.setOrientation(
              new THREE.Vector3(point.lookAtTarget.x, point.lookAtTarget.y, point.lookAtTarget.z)
            );
          } else if (point.relativeYaw !== undefined) {
            console.log('Applying relative yaw rotation:', point.relativeYaw);
            const currentQuat = new THREE.Quaternion(
              currentOrientation.x,
              currentOrientation.y,
              currentOrientation.z,
              currentOrientation.w
            );
            const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), point.relativeYaw);
            currentQuat.multiply(yawQuat);
            playerRef.current?.setPlayerRotation({
              x: currentQuat.x,
              y: currentQuat.y,
              z: currentQuat.z,
              w: currentQuat.w,
            });
          }
          setProcessedPoints((prev) => ({ ...prev, [point.id]: true }));
        }
      }
    });
  });

  return null; 
};

export default OrientationManager;
