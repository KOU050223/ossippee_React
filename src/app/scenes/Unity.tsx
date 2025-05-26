import { useUserId, useUpdateField } from '@/hooks/index'
import { Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const Unity = () => {
    const { userId } = useUserId()
    const { updateField } = useUpdateField('users')
    const navigate = useNavigate()
    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'line');
        if (result) {
            console.log('gameState updated to line');
        } else {
            console.error('Failed to update gameState');
        }
        navigate('/line');
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
