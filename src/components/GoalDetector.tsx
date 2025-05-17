import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

type GoalDetectorProps = {
  playerRef: React.RefObject<{ getPosition: () => { x: number; y: number; z: number } }>
  goal: [number, number, number]
  threshold?: number
  onReach: () => void
}

export function GoalDetector({
  playerRef,
  goal,
  threshold = 1,
  onReach
}: GoalDetectorProps) {
  const _goal = new Vector3(...goal)

  useFrame(() => {
    if (!playerRef.current) return
    const pos = playerRef.current.getPosition()
    const distSq =
      (pos.x - _goal.x) ** 2 +
      (pos.y - _goal.y) ** 2 +
      (pos.z - _goal.z) ** 2

    if (distSq <= threshold * threshold) {
      onReach()
    }
  })

  return null
}
