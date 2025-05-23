import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useState, useMemo } from 'react'

type ItemProps = {
  playerRef: React.RefObject<{
    getPosition: () => { x: number; y: number; z: number } | null
    addPoint: () => void
    decreasePatience: (amount: number) => void
  }>
  transform: [number, number, number]
  threshold?: number
}

export function Item({
  playerRef,
  transform,
  threshold = 1,
}: ItemProps) {
  const _trans = useMemo(() => new Vector3(...transform), [transform])
  const [visible, setVisible] = useState(true)

  // 1回だけ Audio オブジェクトを作る
  const se = useMemo(() => {
    const audio = new Audio('/get.mp3')
    audio.volume = 0.5
    return audio
  }, [])

  useFrame(() => {
    if (!visible) return
    const pos = playerRef.current?.getPosition()
    if (!pos) return

    const distSq =
      (pos.x - _trans.x) ** 2 +
      (pos.y - _trans.y) ** 2 +
      (pos.z - _trans.z) ** 2

    if (distSq <= threshold * threshold) {
      setVisible(false)
      console.log('アイテムと接触しました')

      // SE を鳴らす
      se.currentTime = 0
      se.play().catch((e) => {
        console.warn('Audio play failed:', e)
      })

      playerRef.current?.addPoint()
      playerRef.current?.decreasePatience(1) // アイテム取得時に我慢ゲージを1減少
    }
  })

  if (!visible) return null;

  return (
    <mesh position={transform}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  )
}

export default Item
