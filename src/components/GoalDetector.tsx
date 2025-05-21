import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useUpdateField, useUserId } from '@/hooks/index'

type GoalDetectorProps = {
  playerRef: React.RefObject<{ getPosition: () => { x: number; y: number; z: number } }>
  goal: [number, number, number]
  threshold?: number
}

export function GoalDetector({
  playerRef,
  goal,
  threshold = 1,
}: GoalDetectorProps) {
  const _goal = new Vector3(...goal)

  const { updateField } = useUpdateField('users')
  const { userId } = useUserId()

  useFrame(() => {
    if (!playerRef.current) return
    const pos = playerRef.current.getPosition()
    const distSq =
      (pos.x - _goal.x) ** 2 +
      (pos.y - _goal.y) ** 2 +
      (pos.z - _goal.z) ** 2

    if (distSq <= threshold * threshold) {
      console.log('ゴールに到達しました')
      updateField(userId,'gameState','finish')
    }
  })

  return null
}
