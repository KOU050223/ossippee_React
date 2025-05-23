import { useDocumentRealtime } from '@/hooks/useFirebase'
import { useUserId } from '@/hooks/useUserId'
import { useUpdateField } from '@/hooks/index'
import { Input, Avatar, Container, Button } from '@chakra-ui/react'


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
    const { userId, setUserId } = useUserId()

    const { data, loading, error } = useDocumentRealtime('users', userId)
    const userData = data as UserData
    const { updateField } = useUpdateField('users')
    const onClick = async () => {
        const result = await updateField(userId, 'gameState', 'unity');
        if (result) {
            console.log('gameState updated to unity');
        } else {
            console.error('Failed to update gameState');
        }
    }

    return (
        <Container>
            <img src="./lineQR.png" alt="" />
            <a>https://line.me/R/ti/p/%40974zguze</a>
            <div>ユーザーネームを以下に入れてね</div>
            <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
            />
            {loading && <p>Loading...</p>}
            {!loading && data && 
            <>
                <div>認証されています</div>
                <p>ユーザーネーム: {userData.displayName}</p>
                <div>
                    <Avatar.Root size="md">
                        <Avatar.Fallback name={userData.displayName} />
                        <Avatar.Image src={userData.pictureUrl} />
                    </Avatar.Root>
                </div>
                <pre>{JSON.stringify(data, null, 2)}</pre>
                <Button
                    color={"black"}
                    size="lg"
                    onClick={onClick}
                >
                    物語を始める
                </Button>
            </>
            }
            {error && <p>エラー: {error.message}</p>}
        </Container>
    )
}

export default Entry
