// ライティングセットアップ
const Lighting = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" />
    </>
  );
};
export default Lighting;