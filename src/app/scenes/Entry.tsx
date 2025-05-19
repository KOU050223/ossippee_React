import { useDocument } from '@/hooks/useFirebase'
import { useUserId } from '@/hooks/useUserId'
import { Input, Avatar, Container } from '@chakra-ui/react'

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

    const { data, loading, error } = useDocument('users', userId)
    const userData = data as UserData
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
                <Avatar.Root size="md">
                    <Avatar.Fallback name={userData.displayName} />
                    <Avatar.Image src={userData.pictureUrl} />
                </Avatar.Root>
                {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
            </>
            }
            {error && <p>エラー: {error.message}</p>}
        </Container>
    )
}

export default Entry
