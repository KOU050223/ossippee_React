import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUserId, useUpdateField } from '@/hooks/index';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
const Unity = () => {
    const { userId } = useUserId();
    const { updateField } = useUpdateField('users');
    const navigate = useNavigate();
    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'line');
        if (result) {
            console.log('gameState updated to line');
        }
        else {
            console.error('Failed to update gameState');
        }
        navigate('/line');
    };
    return (_jsxs("div", { children: [_jsx("h1", { children: "Unity" }), _jsxs("p", { children: ["User ID: ", userId] }), _jsx(Button, { onClick: onClick, color: "black", children: "\u6B21\u3078" })] }));
};
export default Unity;
