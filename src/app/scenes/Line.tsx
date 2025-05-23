import { useUserId } from '@/hooks/useUserId'
import { useUpdateField } from '@/hooks/index'
import { Button } from '@chakra-ui/react'

const Line = () => {
    const { userId } = useUserId()
    const { updateField } = useUpdateField('users')
    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'flutter');
        if (result) {
            console.log('gameState updated to flutter');
        } else {
            console.error('Failed to update gameState');
        }
    }
    return (
        <div>
            <h1>LINE</h1>
            <p>グループLINEでうまいこと話を進めて飲み会を終わらせよう</p>
            <img src="./lineQR.png" alt="" />
            <a>https://line.me/R/ti/p/%40974zguze</a>

            <Button onClick={onClick} color={'white'}>次へ</Button>
        </div>
    )
}

export default Line
