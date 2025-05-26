import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDocumentRealtime } from '@/hooks/useFirebase';
import { useUserId } from '@/hooks/useUserId';
import { useUpdateField } from '@/hooks/index';
import { Container, VStack, HStack, Box, Heading, Text, Input, Avatar, Button, Link as ChakraLink, Image, Spinner, } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
const Entry = () => {
    const { userId, setUserId } = useUserId();
    const { data, loading, error } = useDocumentRealtime('users', userId || 'dummy');
    const userData = data;
    const isValidUserId = userId && userId !== 'null' && userId.trim() !== '';
    const { updateField } = useUpdateField('users');
    const navigate = useNavigate();
    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'unity');
        if (!result) {
            console.error('Failed to update gameState');
        }
        navigate('/unity');
    };
    return (_jsx(Container, { maxW: "md", py: 8, children: _jsxs(VStack, { spaceX: 6, spaceY: 6, align: "stretch", children: [_jsxs(VStack, { spaceX: 2, spaceY: 2, align: "center", children: [_jsx(Image, { boxSize: "120px", src: "/lineQR.png", alt: "LINE QR\u30B3\u30FC\u30C9" }), _jsx(ChakraLink, { href: "https://line.me/R/ti/p/%40974zguze", color: "teal.500", children: "LINE\u3067\u53CB\u9054\u8FFD\u52A0" })] }), _jsxs(Box, { children: [_jsx(Heading, { size: "md", mb: 2, children: "\u30E6\u30FC\u30B6\u30FCID\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx(Input, { value: userId, onChange: (e) => setUserId(e.target.value), placeholder: "Enter user ID", size: "lg" })] }), loading && (_jsxs(HStack, { justify: "center", children: [_jsx(Spinner, { size: "lg" }), _jsx(Text, { children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] })), error && (_jsx(Box, { children: error.message })), isValidUserId && !loading && data && (_jsx(Box, { p: 4, borderWidth: "1px", borderRadius: "lg", boxShadow: "md", textAlign: "center", children: _jsxs(VStack, { spaceX: 4, children: [_jsxs(Avatar.Root, { size: "md", children: [_jsx(Avatar.Fallback, { name: userData.displayName }), _jsx(Avatar.Image, { src: userData.pictureUrl })] }), _jsxs(Heading, { size: "lg", children: [userData.displayName, " \u3055\u3093"] }), _jsx(Text, { color: "gray.600", children: userData.statusMessage }), _jsx(Button, { colorScheme: "teal", size: "lg", onClick: onClick, children: "\u7269\u8A9E\u3092\u59CB\u3081\u308B" })] }) }))] }) }));
};
export default Entry;
