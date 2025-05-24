import React from 'react';
import { GoalDetector } from '@/components/GoalDetector';
// import { useUserId, useDocument } from '@/hooks/index'; // 未使用のためコメントアウト
import type { PlayerHandle } from '@/features/character/components/Player'; // PlayerHandle をインポート

interface GoalGeneratorProps {
  playerRef: React.RefObject<PlayerHandle>; // PlayerHandle を使用
  numberOfGoals?: number; // オプションでゴールの数を指定できるようにする
  goalAreaRange?: number; // オプションでゴールの生成範囲を指定できるようにする
  minDistance?: number; // 追加: ユーザーからの最小距離
}

const GoalGenerator: React.FC<GoalGeneratorProps> = ({ playerRef, numberOfGoals = 5, goalAreaRange = 20, minDistance = 8 }) => {
    // ユーザーの現在座標を取得
    const playerPos = playerRef.current?.getPosition?.() || { x: 0, y: 1, z: 0 };

    // ユーザー中心でminDistance以上goalAreaRange以下のランダムな距離・角度で生成
    const generateRandomPosition = (): [number, number, number] => {
        const theta = Math.random() * Math.PI * 2; // 0〜2πのランダム角度
        const r = minDistance + Math.random() * (goalAreaRange - minDistance); // minDistance〜goalAreaRange
        const x = playerPos.x + Math.cos(theta) * r;
        const y = 1;
        const z = playerPos.z + Math.sin(theta) * r;
        return [x, y, z];
    };

    const goals = Array.from({ length: numberOfGoals }, () => generateRandomPosition());
    return (
        <>
            {goals.map((goalPosition, index) => (
                <GoalDetector
                    key={index} // リストレンダリングのための一意なキー
                    playerRef={playerRef}
                    goal={goalPosition}
                    threshold={1} // ゴール判定の閾値
                    // goalId={`goal-${index}`} // 必要であれば、各ゴールにIDを付与
                    // onGoalReached={(goalId) => console.log(`${goalId} reached!`)} // ゴール到達時の処理
                />
            ))}
        </>
    );
};

export default GoalGenerator;
