// src/pages/Game.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Box, Center, Button, Progress, Text, VStack, HStack, Badge, Input } from '@chakra-ui/react';
import Scene from '@/components/Scene';
import GameOverModal from '@/components/GameOverModal';
import { useMultiplayer } from '@/features/multiplayer/hooks/useMultiplayer';
import { useUserId, useDocument } from '@/hooks/index';
import { MultiplayerTest } from '@/features/multiplayer/components/MultiplayerTest';

const Game: React.FC = () => {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [disableForward] = useState(false);
  const [patience, setPatience] = useState(100);
  const [showMultiplayerLobby, setShowMultiplayerLobby] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState('');
  const [showMultiplayerTest, setShowMultiplayerTest] = useState(false);

  const { userId } = useUserId();
  const { data: userData } = useDocument('users', userId);
  const goalCount = userData?.foundToilet ?? 2;

  // マルチプレイヤー機能
  const {
    remotePlayers,
    isConnected,
    isHost,
    sessionId,
    createSession,
    joinSession,
    leaveSession,
    updatePlayerState,
    isLoading,
    error,
    connectedPlayersCount,
    remotePlayersCount
  } = useMultiplayer(userId || '');

  const handlePointChange = useCallback((pt: number) => {
    setCurrentPoint(pt);
  }, []);

  const handlePatienceChange = useCallback((val: number) => {
    setPatience(val);
  }, []);

  const handleGameOver = useCallback(() => {
    setShowGameOverModal(true);
  }, []);

  // プレイヤー状態更新ハンドラー
  const handlePlayerStateUpdate = useCallback((playerState: any) => {
    updatePlayerState(playerState);
  }, [updatePlayerState]);

  // ゲーム開始ハンドラー（シングル or マルチプレイヤー）
  const handleStartSinglePlayer = useCallback(() => {
    setGameStarted(true);
    setShowMultiplayerLobby(false);
  }, []);

  const handleStartMultiplayer = useCallback(() => {
    setShowMultiplayerLobby(true);
  }, []);

  // マルチプレイヤーセッション参加後のゲーム開始
  const handleMultiplayerGameStart = useCallback(() => {
    setGameStarted(true);
    setShowMultiplayerLobby(false);
  }, []);

  const initialGoalPos = useMemo(() => ({ x: 280, y: 1, z: -123 }), []);

  return (
    <Box w="100vw" h="100vh" position="relative" overflow="hidden">
      {/* マルチプレイヤーテスト */}
      {showMultiplayerTest && (
        <Center
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="rgba(0,0,0,0.85)"
          zIndex="overlay"
        >
          <VStack gap={4}>
            <MultiplayerTest />
            <Button
              variant="outline"
              colorScheme="gray"
              onClick={() => setShowMultiplayerTest(false)}
            >
              閉じる
            </Button>
          </VStack>
        </Center>
      )}

      {/* マルチプレイヤーロビー */}
      {showMultiplayerLobby && (
        <Center
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="rgba(0,0,0,0.85)"
          zIndex="overlay"
        >
          <Box bg="white" p={8} borderRadius="lg" minW="400px">
            <VStack gap={6}>
              <Text fontSize="2xl" fontWeight="bold">マルチプレイヤー</Text>
              
              {!isConnected ? (
                <VStack gap={4} w="100%">
                  <Button
                    colorScheme="blue"
                    onClick={() => createSession(4)}
                    size="lg"
                    w="100%"
                    loading={isLoading}
                  >
                    新しいセッションを作成
                  </Button>
                  
                  <Text>または</Text>
                  
                  <Input
                    placeholder="セッションIDを入力"
                    value={joinSessionId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinSessionId(e.target.value)}
                  />
                  <Button
                    colorScheme="green"
                    onClick={() => joinSession(joinSessionId)}
                    size="lg"
                    w="100%"
                    disabled={!joinSessionId.trim()}
                    loading={isLoading}
                  >
                    セッションに参加
                  </Button>
                </VStack>
              ) : (
                <VStack gap={4} w="100%">
                  <Text>セッション: {sessionId}</Text>
                  <Text>プレイヤー数: {connectedPlayersCount + remotePlayersCount + 1}</Text>
                  {isHost && (
                    <Button
                      colorScheme="blue"
                      onClick={handleMultiplayerGameStart}
                      size="lg"
                      w="100%"
                    >
                      ゲーム開始
                    </Button>
                  )}
                  <Button
                    colorScheme="red"
                    onClick={leaveSession}
                    size="sm"
                    w="100%"
                  >
                    セッションを退出
                  </Button>
                </VStack>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowMultiplayerLobby(false)}
                size="sm"
              >
                戻る
              </Button>
              
              {error && (
                <Text color="red.500" fontSize="sm">{error}</Text>
              )}
            </VStack>
          </Box>
        </Center>
      )}

      {/* ゲーム開始ボタン（中央オーバーレイ） */}
      {!gameStarted && !showMultiplayerLobby && !showMultiplayerTest && (
        <Center
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="rgba(0,0,0,0.75)"
          zIndex="overlay"
        >            <VStack gap={6}>
              <Text fontSize="3xl" color="white" fontWeight="bold" textAlign="center">
                OSSIPPEE RUSH
              </Text>
              <VStack gap={4}>
              <Button
                size="lg"
                colorScheme="teal"
                onClick={handleStartSinglePlayer}
                px={8}
                py={6}
                fontSize="xl"
                boxShadow="lg"
                w="300px"
              >
                シングルプレイヤー
              </Button>
              <Button
                size="lg"
                colorScheme="blue"
                onClick={handleStartMultiplayer}
                px={8}
                py={6}
                fontSize="xl"
                boxShadow="lg"
                w="300px"
              >
                マルチプレイヤー
              </Button>
              <Button
                size="md"
                colorScheme="purple"
                onClick={() => setShowMultiplayerTest(true)}
                px={6}
                py={4}
                fontSize="md"
                boxShadow="md"
                w="300px"
                variant="outline"
              >
                🔧 マルチプレイヤーテスト
              </Button>
            </VStack>
          </VStack>
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

      {/* マルチプレイヤー情報表示 */}
      {gameStarted && isConnected && (
        <Box
          position="absolute"
          top="10px"
          right="10px"
          p={4}
          bg="rgba(0,0,0,0.6)"
          borderRadius="md"
          zIndex={999}
        >
          <VStack gap={2} align="start">
            <HStack gap={2}>
              <Badge colorScheme="green">オンライン</Badge>
              {isHost && <Badge colorScheme="blue">ホスト</Badge>}
            </HStack>
            <Text color="white" fontSize="sm">
              セッション: {sessionId?.slice(0, 8)}...
            </Text>
            <Text color="white" fontSize="sm">
              プレイヤー数: {Object.keys(remotePlayers).length + 1}
            </Text>
            <Button
              size="xs"
              colorScheme="red"
              onClick={leaveSession}
            >
              退出
            </Button>
          </VStack>
        </Box>
      )}

      {/* エラー表示 */}
      {error && (
        <Box
          position="absolute"
          bottom="10px"
          left="10px"
          p={3}
          bg="red.500"
          color="white"
          borderRadius="md"
          zIndex={999}
        >
          <Text fontSize="sm">{error}</Text>
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
        remotePlayers={remotePlayers}
        onPlayerStateUpdate={handlePlayerStateUpdate}
        enableMultiplayer={isConnected}
      />
    </Box>
  );
};

export default Game;
