import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

// 放物線を描く球体
const ParabolicBall = () => {
  const ballRef = useRef(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: -2, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  
  // ボールの位置をリセットして発射する
  const launchBall = () => {
    setPosition({ x: 0, y: -2, z: 0 });
    // ランダムな水平方向の速度
    const randomAngle = Math.random() * Math.PI * 2;
    const horizontalSpeed = 0.05 + Math.random() * 0.05;
    setVelocity({
      x: Math.cos(randomAngle) * horizontalSpeed,
      y: 0.15, // 初期上昇速度
      z: Math.sin(randomAngle) * horizontalSpeed
    });
    setActive(true);
  };
  
  useFrame(() => {
    if (active) {
      // 重力の影響を適用
      setVelocity(prevVelocity => ({
        ...prevVelocity,
        y: prevVelocity.y - 0.005 // 重力効果
      }));
      
      // 位置を更新
      setPosition(prevPosition => ({
        x: prevPosition.x + velocity.x,
        y: prevPosition.y + velocity.y,
        z: prevPosition.z + velocity.z
      }));
      
      // ボールが下に落ちすぎたらリセット
      if (position.y < -3) {
        setActive(false);
        setTimeout(launchBall, 1000 + Math.random() * 2000);
      }
    }
  });
  
  // コンポーネントマウント時にボールの動きを開始
  useEffect(() => {
    setTimeout(launchBall, 1000);
  }, []);
  
  return (
    <mesh ref={ballRef} position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="#ffff00" />
    </mesh>
  );
};
export default ParabolicBall;