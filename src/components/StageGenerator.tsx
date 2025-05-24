import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Item } from '@/features/object/models/Item';
// PlayerHandleの型定義のインポートパスは環境に合わせて修正してください
import type { PlayerHandle } from '@/app/scenes/Game'; 

interface StageGeneratorProps {
  playerRef: React.RefObject<PlayerHandle>;
  length: number;
  itemSpacing?: number;
  itemHeight?: number;
  triggerGeneration?: boolean;
}

const StageGenerator: React.FC<StageGeneratorProps> = ({
  playerRef,
  length,
  itemSpacing = 2,
  itemHeight = 1,
  triggerGeneration = true,
}) => {
  const [itemPositions, setItemPositions] = useState<[number, number, number][]>([]);

  useEffect(() => {
    if (!triggerGeneration || !playerRef.current) {
      return;
    }

    const player = playerRef.current;
    const currentPosition = player.getPosition();
    const currentOrientation = player.getOrientation();

    if (!currentPosition || !currentOrientation) {
      console.warn('StageGenerator: Player position or orientation not available.');
      return;
    }

    const playerPos = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z);
    const playerQuat = new THREE.Quaternion(
      currentOrientation.x,
      currentOrientation.y,
      currentOrientation.z,
      currentOrientation.w
    );

    const forwardVector = new THREE.Vector3(0, 0, -1);
    forwardVector.applyQuaternion(playerQuat);
    forwardVector.normalize();

    const newPositions: [number, number, number][] = [];
    for (let i = 0; i < length; i++) {
      const distance = (i + 1) * itemSpacing;
      const itemPos = playerPos.clone().add(forwardVector.clone().multiplyScalar(distance));
      newPositions.push([itemPos.x, itemHeight, itemPos.z]);
    }
    setItemPositions(newPositions);

  }, [playerRef, length, itemSpacing, itemHeight, triggerGeneration]);

  if (!triggerGeneration) {
    return null;
  }

  return (
    <>
      {itemPositions.map((pos, index) => (
        <Item
          key={`stage-item-${index}`}
          playerRef={playerRef} 
          transform={pos}
          threshold={1}
        />
      ))}
    </>
  );
};

export default StageGenerator;
