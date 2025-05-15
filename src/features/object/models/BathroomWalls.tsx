// 部屋の壁
const BathroomWalls = () => {
  return (
    <group>
      {/* 床 */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#d3d3d3" />
      </mesh>
      
      {/* 壁 */}
      <mesh position={[0, 0, -3]} rotation={[0, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      <mesh position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      <mesh position={[3, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      <mesh position={[0, 0, 3]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      {/* 天井 */}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    </group>
  );
};
export default BathroomWalls;