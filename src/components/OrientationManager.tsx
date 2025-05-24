import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PlayerHandle } from '@/app/scenes/Game'; 

interface OrientationPoint {
  id: string;
  triggerPosition: { x: number; y: number; z: number };
  lookAtTarget: { x: number; y: number; z: number };
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
    if (!playerPosition) return;

    orientationPoints.forEach((point) => {
      if (!processedPoints[point.id]) {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - point.triggerPosition.x, 2) +
          Math.pow(playerPosition.y - point.triggerPosition.y, 2) +
          Math.pow(playerPosition.z - point.triggerPosition.z, 2)
        );

        if (distance < (point.threshold || 1.5)) {
          console.log(`Player reached orientation point: ${point.id}. Setting orientation.`);
          playerRef.current?.setOrientation(point.lookAtTarget);
          setProcessedPoints((prev) => ({ ...prev, [point.id]: true }));
        }
      }
    });
  });

  return null; 
};

export default OrientationManager;
