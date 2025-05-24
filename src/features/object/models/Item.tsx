import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'

type ItemProps = {
    playerRef: React.RefObject<{ getPosition: () => { x: number; y: number; z: number } | null, addPoint: () => void }>; // getPositionの戻り値に | null を追加
    transform: [number, number, number];
    threshold?: number;
}

export function Item({
    playerRef,
    transform,
    threshold = 1,  // 距離の閾値
}: ItemProps) {
    const _trans = new Vector3(...transform)

    const [ isGet, setIsGet ] = useState(false)

    useFrame(() => {
        const pos = playerRef.current?.getPosition(); // playerRef.current が null でないことを確認し、getPositionを呼び出す
        if (!pos) { // pos が null の場合は処理をスキップ
            return;
        }
        const distSq =
            (pos.x - _trans.x) ** 2 +
            (pos.y - _trans.y) ** 2 +
            (pos.z - _trans.z) ** 2;

        if (distSq <= threshold * threshold && !isGet) {
            setIsGet(true);
            console.log('アイテムと接触しました');
            playerRef.current?.addPoint(); // playerRef.current が null でないことを確認
        }
    });

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
