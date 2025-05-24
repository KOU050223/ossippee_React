import React, { useEffect, useState } from 'react';
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
  // アイテム座標リストをuseStateで保持
  const [itemPositions, setItemPositions] = useState<[number, number, number][]>([]);

  // 初回のみ生成
  useEffect(() => {
    if (itemPositions.length === 0 && playerRef.current) {
      const playerPos = playerRef.current.getPosition?.() || { x: 0, y: 1, z: 0 };
      const generateRandomPosition = (): [number, number, number] => {
        const theta = Math.random() * Math.PI * 2;
        const r = minDistance + Math.random() * (itemAreaRange - minDistance);
        const x = playerPos.x + Math.cos(theta) * r;
        const y = itemHeight;
        const z = playerPos.z + Math.sin(theta) * r;
        return [x, y, z];
      };
      setItemPositions(Array.from({ length: numberOfItems }, generateRandomPosition));
    }
  }, [playerRef, numberOfItems, itemAreaRange, minDistance, itemHeight, itemPositions.length]);

  // アイテム取得時にそのアイテムだけ消す
  const handleItemGet = (index: number) => {
    setItemPositions((prev) => prev.map((pos, i) => (i === index ? null : pos)).filter(Boolean) as [number, number, number][]);
  };

  return (
    <>
      {itemPositions.map((pos, index) =>
        pos ? (
          <Item
            key={index}
            playerRef={playerRef}
            transform={pos}
            threshold={1}
          />
        ) : null
      )}
    </>
  );
};

export default ItemGenerator;