//VRController.tsx
import { useFrame } from '@react-three/fiber'
import { useXRControllerLocomotion, useXRInputSourceState, XROrigin } from '@react-three/xr'
import type { PlayerMoveProps } from '../types.ts'
import * as THREE from 'three'

export function VRController({
  playerJump,
  playerMove,
}: {
  playerJump?: () => void
  playerMove: (params: PlayerMoveProps) => void
}) {
  const controllerRight = useXRInputSourceState('controller', 'right')

  const physicsMove = (velocity: THREE.Vector3, rotationYVelocity: number) => {
    playerMove({
      forward: false,
      backward: false,
      left: false,
      right: false,
      rotationYVelocity,
      newVelocity: velocity,
    })
  }

  useXRControllerLocomotion(physicsMove, { speed: 5 })

  useFrame(() => {
    if (controllerRight?.gamepad?.['a-button']?.state === 'pressed') {
      playerJump?.()
    }
  })

  return <XROrigin position={[0, -1.25, 0]} />
}
