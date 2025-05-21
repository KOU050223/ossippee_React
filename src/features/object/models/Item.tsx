import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'

type ItemProps = {
    playerRef: React.RefObject<{ getPosition: () => { x: number; y: number; z: number }, addPoint: () => void }>
    transform: [number, number, number]
    threshold?: number
}

export function Item({
    playerRef,
    transform,
    threshold = 1,  // 距離の閾値
}: ItemProps) {
    const _trans = new Vector3(...transform)

    const [ isGet, setIsGet ] = useState(false)

    useFrame(() => {
        const pos = playerRef.current.getPosition()
        const distSq =
            (pos.x - _trans.x) ** 2 +
            (pos.y - _trans.y) ** 2 +
            (pos.z - _trans.z) ** 2

        if (distSq <= threshold * threshold && !isGet) {
            setIsGet(true) // アイテムを取得したことを記録
            console.log('アイテムと接触しました')
            // アイテムを取得したときの処理をここに追加
            // ポイント系の処理
            playerRef.current.addPoint()
        }
    })

    return (
        <>
            {!isGet && (
                <mesh position={transform}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="yellow" />
                </mesh>
            )}
        </>
    )
}

export default Item
