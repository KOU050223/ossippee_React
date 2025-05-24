import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const BackgroundMusic = ({ url, loop, volume }: { url: string, loop: boolean, volume?: number }) => {
  const { camera } = useThree();
  const [listener, setListener] = useState<THREE.AudioListener | null>(null);
  const soundRef = useRef<THREE.Audio | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    setListener(audioListener);

    const loader = new THREE.AudioLoader();
    loader.load(
      url,
      (buffer) => {
        if (audioListener) {
          const sound = new THREE.Audio(audioListener);
          sound.setBuffer(buffer);
          sound.setLoop(loop);
          sound.setVolume(volume !== undefined ? volume : 0.5);
          soundRef.current = sound;
          setIsLoaded(true);
          console.log('BGM loaded:', url);
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (err: unknown) => { // エラーの型を unknown に変更
        console.error('An error happened during BGM loading:', err);
      }
    );

    return () => {
      if (soundRef.current && soundRef.current.isPlaying) {
        soundRef.current.stop();
      }
      if (listener) {
        camera.remove(listener);
      }
      soundRef.current = null;
      setListener(null);
      setIsLoaded(false);
      setIsPlaying(false);
    };
  }, [url, loop, volume, camera]);

  // ユーザーの最初のインタラクションで再生を開始する
  useEffect(() => {
    const playSoundOnFirstInteraction = () => {
      if (soundRef.current && isLoaded && !isPlaying) {
        try {
          soundRef.current.play();
          setIsPlaying(true);
          console.log("BGM playback started.");
          // 一度再生を開始したら、このイベントリスナーは不要なので削除
          document.removeEventListener('click', playSoundOnFirstInteraction);
          document.removeEventListener('keydown', playSoundOnFirstInteraction);
        } catch (error: any) { // エラーの型をanyに設定
          console.error("Error attempting to play BGM:", error);
        }
      }
    };

    // 複数のインタラクションタイプに対応
    document.addEventListener('click', playSoundOnFirstInteraction);
    document.addEventListener('keydown', playSoundOnFirstInteraction);

    return () => {
      document.removeEventListener('click', playSoundOnFirstInteraction);
      document.removeEventListener('keydown', playSoundOnFirstInteraction);
    };
  }, [isLoaded, isPlaying]); // isLoaded と isPlaying を依存配列に追加

  return null;
};

export default BackgroundMusic;