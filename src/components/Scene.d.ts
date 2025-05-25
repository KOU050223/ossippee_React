import React from 'react';
interface SceneProps {
    gameStarted: boolean;
    goalCount: number;
    initialGoalPos: {
        x: number;
        y: number;
        z: number;
    };
    onPointChange: (pt: number) => void;
    onGameOver: () => void;
    onPatienceChange: (val: number) => void;
}
declare const _default: React.NamedExoticComponent<SceneProps>;
export default _default;
