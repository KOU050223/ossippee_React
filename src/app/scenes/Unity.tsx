import { useUserId, useCustomRouter, useUpdateField } from '@/hooks/index'
import { Button } from '@chakra-ui/react'

const Unity = () => {
    const { userId } = useUserId()
    useCustomRouter()   // gameStateのシーンに自動遷移
    const { updateField } = useUpdateField('users')
    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'line');
        if (result) {
            console.log('gameState updated to line');
        } else {
            console.error('Failed to update gameState');
        }
    }
        
    return (
        <div>
            <h1>Unity</h1>
            <p>User ID: {userId}</p>
            <Button
                onClick={onClick}
                color={"black"}
            >
                次へ
            </Button> 
        </div>
    )
}

export default Unity
