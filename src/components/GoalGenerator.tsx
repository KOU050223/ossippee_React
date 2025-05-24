import React from 'react';
import { GoalDetector } from '@/components/GoalDetector';
// import { useUserId, useDocument } from '@/hooks/index'; // 未使用のためコメントアウト
import type { PlayerHandle } from '@/features/character/components/Player'; // PlayerHandle をインポート

interface GoalGeneratorProps {
  playerRef: React.RefObject<PlayerHandle>; // PlayerHandle を使用
  numberOfGoals?: number; // オプションでゴールの数を指定できるようにする
  goalAreaRange?: number; // オプションでゴールの生成範囲を指定できるようにする
  minDistance?: number; // 追加: ユーザーからの最小距離
  initialPosition?: { x: number; y: number; z: number }; // 追加: 初期座標をpropsで受け取れるように
}

const GoalGenerator: React.FC<GoalGeneratorProps> = ({ playerRef, numberOfGoals = 5, goalAreaRange = 20, minDistance = 8, initialPosition }) => {
    // 初期座標をpropsから受け取る。なければplayerRefから取得
    const playerPos = initialPosition || playerRef.current?.getPosition?.() || { x: 0, y: 1, z: 0 };

    // ゴール位置配列をuseStateで保持し、初回マウント時のみ生成
    const [goals, setGoals] = React.useState<[number, number, number][]>([]);
    React.useEffect(() => {
        const generateRandomPosition = (): [number, number, number] => {
            const theta = Math.random() * Math.PI * 2;
            const r = minDistance + Math.random() * (goalAreaRange - minDistance);
            const x = playerPos.x + Math.cos(theta) * r;
            const y = 1;
            const z = playerPos.z + Math.sin(theta) * r;
            return [x, y, z];
        };
        setGoals(Array.from({ length: numberOfGoals }, () => generateRandomPosition()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
        console.log("ゴール位置を生成しました:", Array.from({ length: numberOfGoals }, () => generateRandomPosition())); 
    }, []); // 初回のみ生成（playerPosを依存に含めると毎回再生成されるので含めない）

    return (
        <>
            {goals.map((goalPosition, index) => (
                <GoalDetector
                    key={index}
                    playerRef={playerRef}
                    goal={goalPosition}
                    threshold={1}
                />
            ))}
        </>
    );
};

export default GoalGenerator;
