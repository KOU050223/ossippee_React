import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Scene.tsx
import React, { Suspense, useRef, useEffect } from 'react';
import { createXRStore, XR, IfInSessionMode } from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, PointerLockControls, Sky } from '@react-three/drei';
import { Physics } from "@react-three/rapier";
import { Ground } from "@/features/background/components/Ground";
import { Player } from "@/features/character/components/Player";
import GLTFModel from '@/features/object/components/GLTFModel';
import ItemGenerator from '@/components/ItemGenerator';
import GoalGenerator from '@/components/GoalGenerator';
import BackgroundMusic from '@/components/BackgroundMusic';
import OrientationManager from '@/components/OrientationManager';
const orientationPointsData = [
    {
        id: 'point1',
        triggerPosition: { x: 38.19, y: 1.05, z: -126.0 },
        lookAtTarget: { x: 415, y: 1.05, z: -122.9 }, // 注視点
        // targetRotation: { x: 0, y: -1 * Math.sin(Math.PI / 4), z: 0, w: Math.cos(Math.PI / 4) }, // Y軸に90度回転
        threshold: 10,
    },
    {
        id: 'point2',
        triggerPosition: { x: 415, y: 1.05, z: -122.9 },
        lookAtTarget: { x: 420, y: 1, z: -452.12 }, // 注視点
        targetRotation: { x: 0, y: 0, z: 0, w: 1 }, // 正面を向く (無回転)
        threshold: 10,
    },
    {
        id: 'point3',
        triggerPosition: { x: 420, y: 1, z: -452.12 },
        lookAtTarget: { x: 543, y: 1, z: -440 }, // 注視点
        threshold: 15,
    },
    {
        id: 'point4',
        triggerPosition: { x: 543, y: 1, z: -440 },
        lookAtTarget: { x: 549, y: 1, z: -506 }, // 注視点
        threshold: 7,
    },
    //   {
    //     id: 'pointX', 
    //     triggerPosition: { x: 420, y: 1, z: -452.12 },
    //     targetRotation: { x: 0, y: -1 * Math.sin(Math.PI / 4), z: 0, w: 1 }, // 右を向く (無回転)
    //     threshold: 10,
    //   },
    //   {
    //     id: 'turnRightTest', // 右を向くテスト
    //     triggerPosition: { x: 0, y: 1, z: 5 }, // トリガー位置は適宜調整してください
    //     relativeYaw: -Math.PI / 2, // 右に90度回転 (時計回りなのでマイナス)
    //     threshold: 1.0,
    //   },
];
const Scene = ({ gameStarted, goalCount, initialGoalPos, onPointChange, onGameOver, onPatienceChange, }) => {
    const store = createXRStore();
    const playerRef = useRef(null);
    // ポイント監視（例：Rapier のコライダーイベントや useFrame 内で検出したら onPointChange を呼ぶ）
    useEffect(() => {
        // ここではsetInterval例ですが、理想は Rapier の onCollisionEnter イベントで直接呼ぶ
        const iv = setInterval(() => {
            const pt = playerRef.current?.getPoint() ?? 0;
            onPointChange(pt);
            if (playerRef.current?.isGameOver())
                onGameOver();
            // 我慢ゲージの取得＆更新コールバック
            const patience = playerRef.current?.getPatience?.() ?? 0;
            onPatienceChange(patience);
        }, 100);
        return () => clearInterval(iv);
    }, [onPointChange, onGameOver]);
    return (_jsx(KeyboardControls, { map: [
            { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
            { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
            { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
            { name: 'right', keys: ['ArrowRight', 'KeyD'] },
            { name: 'jump', keys: ['Space'] },
        ], children: _jsx(Canvas, { camera: { fov: 45, position: [280, 5, -123] }, children: _jsxs(XR, { store: store, children: [_jsx(BackgroundMusic, { url: "/pepsiman_full.mp3", loop: true, volume: 0.3 }), _jsx(Sky, { distance: 450000, sunPosition: [50, 50, 50], inclination: 0, azimuth: 0.25 }), _jsx("ambientLight", { intensity: 7 }), _jsx("directionalLight", { position: [50, 50, 50], intensity: 2 }), _jsx("spotLight", { position: [10, 10, 10], angle: 0.15, penumbra: 1, intensity: Math.PI }), _jsx("pointLight", { position: [-10, -10, -10], intensity: Math.PI }), _jsxs(Physics, { gravity: [0, -18, 0], children: [_jsx(Ground, {}), _jsx(Player, { ref: playerRef, disableForward: !gameStarted, gameStarted: gameStarted, position: [280, 5, -123] }), _jsx(IfInSessionMode, { deny: ['immersive-ar', 'immersive-vr'], children: _jsx(PointerLockControls, {}) }), _jsx(Suspense, { fallback: null, children: _jsx(GLTFModel, { modelUrl: '/public/PQ_Remake_AKIHABARA.glb', position: [-50, -3.7, 50], scale: [10, 10, 10], rotation: [0, 0, 0], colliderType: 'trimesh' }) })] }), _jsx(ItemGenerator, { playerRef: playerRef, numberOfItems: 20, itemAreaRange: 60, minDistance: 10, itemHeight: 1 }), _jsx(GoalGenerator, { playerRef: playerRef, numberOfGoals: goalCount, goalAreaRange: 100, minDistance: 200, initialPosition: initialGoalPos }), _jsx(OrientationManager, { playerRef: playerRef, orientationPoints: orientationPointsData })] }) }) }));
};
// props が変わらない限り再レンダーしないようにメモ化
export default React.memo(Scene);
