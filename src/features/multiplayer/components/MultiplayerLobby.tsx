import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Input,
  Progress,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Divider
} from '@chakra-ui/react';
import type { GameSessionData } from '../types';

interface MultiplayerLobbyProps {
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  isHost: boolean;
  isConnected: boolean;
  connectedPlayersCount: number;
  remotePlayersCount: number;
  availableSessions: GameSessionData[];
  onCreateSession: (maxPlayers: number) => Promise<void>;
  onJoinSession: (sessionId: string) => Promise<void>;
  onLeaveSession: () => Promise<void>;
  onSearchSessions: () => void;
  onStartGame: () => void;
  onClose?: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  isLoading,
  error,
  sessionId,
  isHost,
  isConnected,
  connectedPlayersCount,
  remotePlayersCount,
  availableSessions,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onSearchSessions,
  onStartGame
}) => {
  const [maxPlayers, setMaxPlayers] = React.useState(4);
  const [joinSessionId, setJoinSessionId] = React.useState('');

  const handleCreateSession = async () => {
    await onCreateSession(maxPlayers);
  };

  const handleJoinSessionById = async () => {
    if (joinSessionId.trim()) {
      await onJoinSession(joinSessionId.trim());
    }
  };

  if (isConnected && sessionId) {
    return (
      <Box p={6} bg="gray.50" borderRadius="md" minH="300px">
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Heading size="md">マルチプレイヤーセッション</Heading>
            <Badge colorScheme={isHost ? "blue" : "green"}>
              {isHost ? "ホスト" : "ゲスト"}
            </Badge>
          </HStack>

          <Box bg="white" p={4} borderRadius="md" shadow="sm">
            <Text fontSize="sm" color="gray.600" mb={2}>セッションID</Text>
            <Text fontFamily="mono" fontSize="lg" fontWeight="bold">
              {sessionId}
            </Text>
          </Box>

          <SimpleGrid columns={2} spacing={4}>
            <Box bg="white" p={4} borderRadius="md" shadow="sm">
              <Text fontSize="sm" color="gray.600">接続済みプレイヤー</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {connectedPlayersCount + 1} {/* +1 for self */}
              </Text>
            </Box>
            <Box bg="white" p={4} borderRadius="md" shadow="sm">
              <Text fontSize="sm" color="gray.600">リモートプレイヤー</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {remotePlayersCount}
              </Text>
            </Box>
          </SimpleGrid>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <HStack spacing={3}>
            {isHost && (
              <Button 
                colorScheme="blue" 
                onClick={onStartGame}
                isDisabled={connectedPlayersCount === 0}
                flex={1}
              >
                ゲーム開始
              </Button>
            )}
            <Button 
              colorScheme="red" 
              variant="outline" 
              onClick={onLeaveSession}
              flex={isHost ? 0 : 1}
            >
              セッション離脱
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6} bg="gray.50" borderRadius="md" minH="500px">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">マルチプレイヤーロビー</Heading>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* セッション作成 */}
        <Card>
          <CardHeader>
            <Heading size="md">新しいセッションを作成</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={2}>最大プレイヤー数</Text>
                <Input
                  type="number"
                  min={2}
                  max={8}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 4)}
                />
              </Box>
              <Button
                colorScheme="blue"
                onClick={handleCreateSession}
                isLoading={isLoading}
                loadingText="作成中..."
              >
                セッション作成
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Divider />

        {/* セッションIDで参加 */}
        <Card>
          <CardHeader>
            <Heading size="md">セッションIDで参加</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="セッションIDを入力"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
              />
              <Button
                colorScheme="green"
                onClick={handleJoinSessionById}
                isLoading={isLoading}
                loadingText="参加中..."
                isDisabled={!joinSessionId.trim()}
              >
                セッション参加
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Divider />

        {/* 利用可能なセッション一覧 */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">利用可能なセッション</Heading>
              <Button size="sm" onClick={onSearchSessions}>
                更新
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Box textAlign="center" py={4}>
                <Spinner />
                <Text mt={2}>セッションを検索中...</Text>
              </Box>
            ) : availableSessions.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {availableSessions.map((session) => {
                  const playerCount = Object.keys(session.players || {}).length;
                  return (
                    <Box
                      key={session.id}
                      p={4}
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="white"
                    >
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="bold" fontSize="sm">
                            セッション: {session.id.slice(-8)}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            ホスト: {session.hostId.slice(-8)}
                          </Text>
                          <Progress 
                            value={(playerCount / session.maxPlayers) * 100}
                            size="sm"
                            colorScheme="blue"
                            w="full"
                          />
                          <Text fontSize="xs" color="gray.500">
                            {playerCount}/{session.maxPlayers} プレイヤー
                          </Text>
                        </VStack>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => onJoinSession(session.id)}
                          isDisabled={playerCount >= session.maxPlayers}
                          isLoading={isLoading}
                        >
                          参加
                        </Button>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Box textAlign="center" py={8} color="gray.500">
                <Text>利用可能なセッションがありません</Text>
                <Text fontSize="sm" mt={2}>
                  新しいセッションを作成するか、後で再度確認してください
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
