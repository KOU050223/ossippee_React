import { useDocumentRealtime } from '@/hooks/useFirebase'
import { useUserId } from '@/hooks/useUserId'
import { useUpdateField } from '@/hooks/index'
import {
    Container,
    VStack,
    HStack,
    Box,
    Heading,
    Text,
    Input,
    Avatar,
    Button,
    Link as ChakraLink,
    Image,
    Spinner,
} from '@chakra-ui/react'

type UserData = {
    id: string
    userId: string
    displayName: string
    statusMessage: string
    pictureUrl: string
    gameState: string
    nomiPoint: number
}

const Entry = () => {
    const { userId, setUserId } = useUserId();
    const { data, loading, error } = useDocumentRealtime('users', userId || 'dummy');
    const userData = data as UserData;
    const isValidUserId = userId && userId !== 'null' && userId.trim() !== '';
    const { updateField } = useUpdateField('users')

    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'unity')
        if (!result) {
            console.error('Failed to update gameState')
        }
    }

    return (
        <Container maxW="md" py={8}>
            <VStack spaceX={6} spaceY={6} align="stretch">
                {/* LINE QR とリンク */}
                <VStack spaceX={2} spaceY={2} align="center">
                    <Image boxSize="120px" src="/lineQR.png" alt="LINE QRコード" />
                    <ChakraLink
                        href="https://line.me/R/ti/p/%40974zguze"
                        color="teal.500"
                    >
                        LINEで友達追加
                    </ChakraLink>
                </VStack>

                {/* ユーザーID 入力 */}
                <Box>
                    <Heading size="md" mb={2}>
                        ユーザーネームを入力してください
                    </Heading>
                    <Input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter user ID"
                        size="lg"
                    />
                </Box>

                {/* ローディング */}
                {loading && (
                    <HStack justify="center">
                        <Spinner size="lg" />
                        <Text>読み込み中...</Text>
                    </HStack>
                )}

                {error && (
                    <Box>
                        {error.message}
                    </Box>
                )}

                {/* 認証後のカード */}
                {isValidUserId && !loading && data && (
                    <Box
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        boxShadow="md"
                        textAlign="center"
                    >
                        <VStack spaceX={4}>
                            <Avatar.Root size="md">
                                <Avatar.Fallback name={userData.displayName} />
                                <Avatar.Image src={userData.pictureUrl} />
                            </Avatar.Root>
                            <Heading size="lg">{userData.displayName} さん</Heading>
                            <Text color="gray.600">{userData.statusMessage}</Text>
                            <Button colorScheme="teal" size="lg" onClick={onClick}>
                                物語を始める
                            </Button>
                        </VStack>
                    </Box>
                )}
            </VStack>
        </Container>
    )
}

export default Entry
