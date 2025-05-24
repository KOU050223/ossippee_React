import { Button } from '@chakra-ui/react';

const GameOverModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ background: 'white', padding: 32, borderRadius: 8, textAlign: 'center', minWidth: 300 }}>
                <h2>ゲームオーバー</h2>
                <p>もう一度挑戦しますか？</p>
                <Button style={{ marginRight: 16 }} onClick={() => window.location.reload()}>もう一度</Button>
                <Button onClick={onClose}>やめる</Button>
            </div>
        </div>
    )
}

export default GameOverModal
