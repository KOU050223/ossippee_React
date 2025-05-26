import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
// モデル関係
import BathroomWalls from '@/features/object/models/BathroomWalls';
import Lighting from '@/features/object/models/Lighting';
import ToiletModel from '@/features/object/models/ToiletModel';
import { useUserId } from '@/hooks/useUserId';
import { useUpdateField } from '@/hooks/index';
import { useNavigate } from 'react-router-dom';
// VR関係
const store = createXRStore();
const Finish = () => {
    const { userId } = useUserId();
    const { updateField } = useUpdateField('users');
    const navigate = useNavigate();
    const onClick = async () => {
        console.log(userId);
        const result = await updateField(userId, 'gameState', 'entry');
        if (result) {
            console.log('gameState updated to /');
        }
        else {
            console.error('Failed to update gameState');
        }
        navigate('/');
    };
    return (_jsxs("div", { id: "canvas-container", style: { width: '100vw', height: '100vh', overflow: 'hidden' }, children: [_jsx("button", { onClick: () => store.enterAR(), children: "Enter AR" }), _jsx("button", { onClick: () => {
                    onClick();
                }, children: "\u623B\u308B" }), _jsx(Canvas, { shadows: true, children: _jsxs(XR, { store: store, children: [_jsx(Lighting, {}), _jsx(BathroomWalls, {}), _jsx(Suspense, { fallback: null, children: _jsx(ToiletModel, {}) })] }) })] }));
};
export default Finish;
