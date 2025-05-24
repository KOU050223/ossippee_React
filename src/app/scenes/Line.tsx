import { useUserId } from '@/hooks/useUserId'
import { useUpdateField } from '@/hooks/index'
import {
  Container,
  VStack,
  Heading,
  Text,
  Image,
  Link as ChakraLink,
  Button,
} from '@chakra-ui/react'

const Line = () => {
  const { userId } = useUserId()
  const { updateField } = useUpdateField('users')

  const onClick = async () => {
    const result = await updateField(userId, 'gameState', 'flutter')
    if (result) {
      console.log('gameState updated to flutter')
    } else {
      console.error('Failed to update gameState')
    }
  }

  return (
    <Container maxW="md" py={8}>
      <VStack spaceX={6} spaceY={6} align="stretch">
        {/* 見出し */}
        <VStack spaceX={2} spaceY={2} align="start">
          <Heading size="lg">LINE で会話を進める</Heading>
          <Text color="gray.600">
            グループLINEでうまく話を進めて、飲み会を終わらせよう
          </Text>
        </VStack>

        {/* QR とリンク */}
        <VStack spaceX={2} spaceY={2} align="center">
          <Image boxSize="120px" src="/lineQR.png" alt="LINE QRコード" />
          <ChakraLink
            href="https://line.me/R/ti/p/%40974zguze"
            color="teal.500"
          >
            https://line.me/R/ti/p/%40974zguze
          </ChakraLink>
        </VStack>

        {/* 次へボタン デバッグ用 後で消す*/}
        <Button colorScheme="teal" size="lg" onClick={onClick}>
          次へ
        </Button>
      </VStack>
    </Container>
  )
}

export default Line
