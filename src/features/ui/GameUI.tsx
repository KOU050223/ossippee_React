import { Html } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

// ────────────────────────────────── Score HUD (World-space, カメラ追従)
type GameHUD3DProps = {
  distance?: number  // デフォルトは 2
}

export function GameHUD3D({ distance = 2 }: GameHUD3DProps) {
  const [score, setScore] = useState(0)
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null!)
  const forward = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)

  // スコアイベント
  useEffect(() => {
    const handler = (e: CustomEvent<number>) => setScore((prev) => prev + (e.detail || 0))
    window.addEventListener('addScore', handler as EventListener)
    return () => window.removeEventListener('addScore', handler as EventListener)
  }, [])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    // カメラ位置・向き同期
    group.position.copy(camera.position)
    camera.getWorldDirection(forward)
    forward.normalize()
    group.position.add(forward.multiplyScalar(distance))
    group.up.copy(up)
    group.lookAt(camera.position.clone().add(forward))
  })

  return (
    <group ref={groupRef}>
      <Html transform occlude distanceFactor={10}>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '8px 12px',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '20px',
          whiteSpace: 'nowrap'
        }}>
          Score: {score}
        </div>
      </Html>
    </group>
  )
}

// ────────────────────────────────── 3D MiniMap
export function MiniMap3D({
  playerRef,
  levelSize = 1000,
  distance = 5,
}: {
  playerRef: React.RefObject<RapierRigidBody>
  levelSize?: number
  distance?: number
}) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null!)
  const forward = new THREE.Vector3()

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    group.position.copy(camera.position)
    camera.getWorldDirection(forward)
    group.position.add(forward.multiplyScalar(distance))
    group.quaternion.copy(camera.quaternion)

    const body = playerRef.current
    if (!body || typeof body.translation !== 'function') return
    let pos
    try { pos = body.translation() } catch { return }
    const dot = group.getObjectByName('playerDot') as THREE.Mesh | undefined
    if (!dot) return
    dot.position.set((pos.x / levelSize) * 2, 0.01, (pos.z / levelSize) * 2)
  })

  return (
    <group ref={groupRef}>
      <mesh rotation-x={-Math.PI / 2} scale={[2, 2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#222" side={THREE.DoubleSide} />
      </mesh>
      <mesh name="playerDot">
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial color="#0f0" />
      </mesh>
    </group>
  )
}

// ────────────────────────────────── GameUI (まとめ)
export function GameUI({ playerRef }: { playerRef: React.RefObject<RapierRigidBody> }) {
  return (
    <>
      <GameHUD3D distance={10}/>
      <MiniMap3D playerRef={playerRef} />
    </>
  )
}
