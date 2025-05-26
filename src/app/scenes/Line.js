import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUserId } from '@/hooks/useUserId';
import { useUpdateField } from '@/hooks/index';
import { Container, VStack, Heading, Text, Image, Link as ChakraLink, Button, } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
const Line = () => {
    const { userId } = useUserId();
    const { updateField } = useUpdateField('users');
    const navigate = useNavigate();
    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'flutter');
        if (result) {
            console.log('gameState updated to flutter');
        }
        else {
            console.error('Failed to update gameState');
        }
        navigate('/flutter');
    };
    return (_jsx(Container, { maxW: "md", py: 8, children: _jsxs(VStack, { spaceX: 6, spaceY: 6, align: "stretch", children: [_jsxs(VStack, { spaceX: 2, spaceY: 2, align: "start", children: [_jsx(Heading, { size: "lg", children: "LINE \u3067\u4F1A\u8A71\u3092\u9032\u3081\u308B" }), _jsx(Text, { color: "gray.600", children: "\u30B0\u30EB\u30FC\u30D7LINE\u3067\u3046\u307E\u304F\u8A71\u3092\u9032\u3081\u3066\u3001\u98F2\u307F\u4F1A\u3092\u7D42\u308F\u3089\u305B\u3088\u3046" })] }), _jsxs(VStack, { spaceX: 2, spaceY: 2, align: "center", children: [_jsx(Image, { boxSize: "120px", src: "/lineQR.png", alt: "LINE QR\u30B3\u30FC\u30C9" }), _jsx(ChakraLink, { href: "https://line.me/R/ti/p/%40974zguze", color: "teal.500", children: "https://line.me/R/ti/p/%40974zguze" })] }), _jsx(Button, { colorScheme: "teal", size: "lg", onClick: onClick, children: "\u6B21\u3078" })] }) }));
};
export default Line;
