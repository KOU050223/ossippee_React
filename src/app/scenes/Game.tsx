// src/pages/Game.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Box, Center, Button, Progress, Text } from '@chakra-ui/react';
import Scene from '@/components/Scene';
import GameOverModal from '@/components/GameOverModal';
import { useUserId, useDocument } from '@/hooks/index';

const Game: React.FC = () => {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [disableForward, setDisableForward] = useState(false);
  const [patience, setPatience] = useState(100);

  const { userId } = useUserId();
  const { data: userData } = useDocument('users', userId);
  const goalCount = userData?.foundToilet ?? 2;

  const handlePointChange = useCallback((pt: number) => {
    setCurrentPoint(pt);
  }, []);

  const handlePatienceChange = useCallback((val: number) => {
    setPatience(val);
  }, []);

  const handleGameOver = useCallback(() => {
    setShowGameOverModal(true);
  }, []);

  const initialGoalPos = useMemo(() => ({ x: 280, y: 1, z: -123 }), []);

  return (
    <Box w="100vw" h="100vh" position="relative" overflow="hidden">
      {/* ゲーム開始ボタン（中央オーバーレイ） */}
      {!gameStarted && (
        <Center
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="rgba(0,0,0,0.75)"
          zIndex="overlay"
        >
          <Button
            size="lg"
            colorScheme="teal"
            onClick={() => setGameStarted(true)}
            px={8}
            py={6}
            fontSize="2xl"
            boxShadow="lg"
          >
            ゲームを始める
          </Button>
        </Center>
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

      <Scene
        gameStarted={gameStarted}
        disableForward={disableForward}
        goalCount={goalCount}
        initialGoalPos={initialGoalPos}
        onPointChange={handlePointChange}
        onGameOver={handleGameOver}
        onPatienceChange={handlePatienceChange}
      />
    </Box>
  );
};

export default Game;
