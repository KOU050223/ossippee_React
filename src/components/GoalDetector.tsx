import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useUpdateField, useUserId } from '@/hooks/index'
import { useState } from 'react'

// PlayerHandle から getPosition の戻り値の型をインポートするか、ここで合わせる
type PlayerPosition = { x: number; y: number; z: number } | null;

type GoalDetectorProps = {
  playerRef: React.RefObject<{ getPosition: () => PlayerPosition }> // ★変更点: getPositionの戻り値型
  goal: [number, number, number]
  threshold?: number
}

export function GoalDetector({
  playerRef,
  goal,
  threshold = 1,
}: GoalDetectorProps) {
  const _goal = new Vector3(...goal)

  const [ isGoal, setIsGoal ] = useState(false)
  const { updateField } = useUpdateField('users') // usersコレクションのパスを確認
  const { userId } = useUserId()

  useFrame(() => {
    if (!playerRef.current) {
      // console.log("GoalDetector: playerRef.current is not available yet.");
      return;
    }
    
    const pos = playerRef.current.getPosition();

    // ★変更点: pos が null でないかチェック
    if (pos === null) {
      // console.log("GoalDetector: Player position is null, skipping goal check for this frame.");
      return; // プレイヤーの位置が取得できなければ、このフレームの処理をスキップ
    }

    const distSq =
      (pos.x - _goal.x) ** 2 +
      (pos.y - _goal.y) ** 2 +
      (pos.z - _goal.z) ** 2;

    if (distSq <= threshold * threshold && !isGoal) {
      setIsGoal(true); // ゴールに到達したことを記録
      console.log('ゴールに到達しました');
      // 連続して updateField が呼ばれないように、一度ゴールしたら
      // 何らかの制御（例: stateで管理して一度だけ実行する）を検討すると良いかもしれません。
      if (userId) { // userId も存在確認するとより安全
        updateField(userId, 'gameState', 'finish');
      } else {
        console.warn("GoalDetector: userId is not available.");
      }
    }
  })

  return (
    <mesh position={goal}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
