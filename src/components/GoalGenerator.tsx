import React from 'react';
import { GoalDetector } from '@/components/GoalDetector';
import { useUserId, useDocument } from '@/hooks/index';

interface GoalGeneratorProps {
  playerRef: React.RefObject<{ getPosition: () => { x: number; y: number; z: number } }>;
  numberOfGoals?: number; // オプションでゴールの数を指定できるようにする
  goalAreaRange?: number; // オプションでゴールの生成範囲を指定できるようにする
}

const GoalGenerator: React.FC<GoalGeneratorProps> = ({ playerRef, numberOfGoals = 5, goalAreaRange = 20 }) => {
    const { userId } = useUserId();
    // userData は現時点では使用されていませんが、将来的にゴールの数や種類を動的にするために使用できます
    const { data: userData } = useDocument('users', userId);

    // ランダムなゴール位置を生成する
    const generateRandomPosition = (): [number, number, number] => {
        const x = Math.random() * goalAreaRange * 2 - goalAreaRange; // -goalAreaRange から +goalAreaRange の範囲
        const y = 1; // y軸は1で固定
        const z = Math.random() * goalAreaRange * 2 - goalAreaRange; // -goalAreaRange から +goalAreaRange の範囲
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
