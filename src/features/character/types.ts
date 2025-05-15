// Character types
export interface PlayerMoveProps {
    forward?: boolean;
    backward?: boolean;
    left?: boolean;
    right?: boolean;
    rotationYVelocity: number;
    velocity?: { x: number; y: number; z: number };
    newVelocity?: { x: number; y: number; z: number };
}
