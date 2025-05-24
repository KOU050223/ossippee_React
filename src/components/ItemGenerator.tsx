import React from 'react';
import { Item } from '@/features/object/models/Item';
import type { PlayerHandle } from '@/features/character/components/Player';

interface ItemGeneratorProps {
  playerRef: React.RefObject<PlayerHandle>;
  numberOfItems?: number;
  itemAreaRange?: number;
  minDistance?: number;
  itemHeight?: number;
}

const ItemGenerator: React.FC<ItemGeneratorProps> = ({
  playerRef,
  numberOfItems = 10,
  itemAreaRange = 50,
  minDistance = 5,
  itemHeight = 1,
}) => {
  // プレイヤーの現在座標を取得
  const playerPos = playerRef.current?.getPosition?.() || { x: 0, y: 1, z: 0 };

  // ユーザー中心でminDistance以上itemAreaRange以下のランダムな距離・角度で生成
  const generateRandomPosition = (): [number, number, number] => {
    const theta = Math.random() * Math.PI * 2;
    const r = minDistance + Math.random() * (itemAreaRange - minDistance);
    const x = playerPos.x + Math.cos(theta) * r;
    const y = itemHeight;
    const z = playerPos.z + Math.sin(theta) * r;
    return [x, y, z];
  };

  const items = Array.from({ length: numberOfItems }, () => generateRandomPosition());

  return (
    <>
      {items.map((itemPosition, index) => (
        <Item
          key={index}
          playerRef={playerRef}
          transform={itemPosition}
          threshold={1}
        />
      ))}
    </>
  );
};

export default ItemGenerator;
