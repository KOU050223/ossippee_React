// src/pages/Game.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Progress, Box, Text } from '@chakra-ui/react';
import Scene from '@/components/Scene';
import GameOverModal from '@/components/GameOverModal';
import { useUserId, useDocument } from '@/hooks/index';

const Game: React.FC = () => {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [disableForward, setDisableForward] = useState(false);
  const [patience, setPatience] = useState(100);  // ← 我慢ゲージ

  const { userId } = useUserId();
  const { data: userData } = useDocument('users', userId);
  const goalCount = userData?.foundToilet ?? 2;

  // シーンから呼ばれるコールバックを安定化
  const handlePointChange = useCallback((pt: number) => {
    setCurrentPoint(pt);
  }, []);

  const handleGameOver = useCallback(() => {
    setShowGameOverModal(true);
  }, []);

  // シーンから呼ばれる「我慢ゲージ更新用コールバック」
  const handlePatienceChange = useCallback((val: number) => {
    setPatience(val);
  }, []);

  const initialGoalPos = useMemo(() => ({ x: 280, y: 1, z: -123 }), []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* ゲーム開始ボタン */}
      {!gameStarted && (
        <div className="start-overlay">
          <button onClick={() => setGameStarted(true)}>ゲームを始める</button>
        </div>
      )}

      {/* UI オーバーレイ */}
      {gameStarted && (
        <Box
           position="absolute"
           top="10px"
           left="10px"
           p={4}
           bg="rgba(0,0,0,0.6)"
           borderRadius="md"
           zIndex={999}
         >
            <Text color="white" mb={2}>我慢ゲージ</Text>
                <Progress.Root max={100} value={patience} size="sm" colorPalette="cyan" mb={4}>
                <Progress.Track>
                    <Progress.Range />
                </Progress.Track>
                </Progress.Root>
            <Text color="white">ポイント: {currentPoint}</Text>
         </Box>
      )}

      {showGameOverModal && (
        <GameOverModal onClose={() => setShowGameOverModal(false)} />
      )}

      {/* メモ化した Scene を配置 */}
      <Scene
        gameStarted={gameStarted}
        disableForward={disableForward}
        goalCount={goalCount}
        initialGoalPos={initialGoalPos}
        onPointChange={handlePointChange}
        onGameOver={handleGameOver}
        onPatienceChange={handlePatienceChange}
      />
    </div>
  );
};

export default Game;
