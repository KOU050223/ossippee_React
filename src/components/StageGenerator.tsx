import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Item } from '@/features/object/models/Item';
import type { PlayerHandle } from '@/features/character/components/Player'; 

interface StageGeneratorProps {
  playerRef: React.RefObject<PlayerHandle>;
  length: number;
  itemSpacing?: number;
  itemHeight?: number;
  triggerGeneration?: boolean;
  startPosition?: [number, number, number]; // 追加
}

const StageGenerator: React.FC<StageGeneratorProps> = ({
  playerRef,
  length,
  itemSpacing = 6, // デフォルトをさらに広めに
  itemHeight = 1,
  triggerGeneration = true,
  startPosition, // 追加
}) => {
  const [itemPositions, setItemPositions] = useState<[number, number, number][]>([]);

  useEffect(() => {
    if (!triggerGeneration || !playerRef.current) {
      return;
    }

    const player = playerRef.current;
    const currentPosition = player.getPosition();
    const currentOrientation = player.getOrientation();

    if (!currentOrientation) {
      console.warn('StageGenerator: Player orientation not available.');
      return;
    }

    // スタート座標を指定できるように
    const basePos = startPosition
      ? new THREE.Vector3(...startPosition)
      : currentPosition
        ? new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z)
        : new THREE.Vector3(0, 1, 0);
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
      // 直線上＋ランダムノイズでばらけさせる（ノイズ幅を拡大）
      const noiseX = (Math.random() - 0.5) * 5; // -2.5〜+2.5程度
      const noiseZ = (Math.random() - 0.5) * 5;
      const itemPos = basePos.clone().add(forwardVector.clone().multiplyScalar(distance));
      itemPos.x += noiseX;
      itemPos.z += noiseZ;
      newPositions.push([itemPos.x, itemHeight, itemPos.z]);
    }
    setItemPositions(newPositions);

  }, [playerRef, length, itemSpacing, itemHeight, triggerGeneration, startPosition]);

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
