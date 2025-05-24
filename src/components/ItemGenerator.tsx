import React, { useEffect, useState, useMemo } from 'react';
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
  // アイテム座標リストのみuseStateで保持
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

  // useMemoでアイテムリストをメモ化
  const items = useMemo(
    () =>
      itemPositions.map((pos, index) => (
        <MemoizedItem key={index} playerRef={playerRef} transform={pos} threshold={1} />
      )),
    [itemPositions, playerRef]
  );

  return <>{items}</>;
};

// Itemをmemo化
const MemoizedItem = React.memo(Item);

// 末尾でmemo化してエクスポート
export default React.memo(ItemGenerator);