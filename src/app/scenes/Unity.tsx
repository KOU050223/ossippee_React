import { useUserId } from '@/hooks/useUserId'

const Unity = () => {
    const { userId } = useUserId()

    return (
        <div>
            <h1>Unity</h1>
            <p>User ID: {userId}</p>
        </div>
    )
}

export default Unity
