import { Button } from '@chakra-ui/react';
import { useUserId } from '@/hooks/useUserId';

const Flutter = () => {
  const { userId } = useUserId();
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="/web/index.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Flutter App"
      />
      {/* React 内で gameState 更新など他処理も可能 */}
      <Button onClick={handleNextClick}>次へ</Button>
    </div>
  );
};

export default Flutter;
