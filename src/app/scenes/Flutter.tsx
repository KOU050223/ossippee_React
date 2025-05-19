import { useUserId } from '@/hooks/useUserId'
import { useCustomRouter, useUpdateField } from '@/hooks/index'
import { Button } from '@chakra-ui/react'


const Flutter = () => {
    const { userId } = useUserId()
    useCustomRouter()   // gameStateのシーンに自動遷移
    const { updateField } = useUpdateField('users')
    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'prologue');
        if (result) {
            console.log('gameState updated to prologue');
        } else {
            console.error('Failed to update gameState');
        }
    }
    return (
        <div>
            <h1>Flutter</h1>
            <p>Flutterの画面です</p>
            <Button onClick={onClick}>次へ</Button>
        </div>
    )
}

export default Flutter
