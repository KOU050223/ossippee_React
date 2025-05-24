import { Entry, Unity, Line, Flutter, Prologue, Game, Finish } from './scenes/index';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCustomRouter } from '@/hooks/index';

// type View = 'entry' | 'unity' | 'line' | 'flutter' | 'prologue' | 'game' | 'finish';

// useCustomRouterを呼び出すための新しいコンポーネント
const RouterEffects = () => {
  useCustomRouter();
  return null; // このコンポーネントは何もレンダリングしない
};

function App() {
  return (
    <>
      <Router>
        {/* テスト用に自動遷移を外す */}
        {/* <RouterEffects />  */}
        <Routes>
          <Route path='/' element={<Entry />}/>
          <Route path='entry' element={<Entry />} />
          <Route path='unity' element={<Unity />} />
          <Route path='line' element={<Line />} />
          <Route path='flutter' element={<Flutter />} />
          {/* <Route path='prologue' element={<Prologue />} /> */}
          <Route path='react' element={<Game/>} />
          <Route path='finish' element={<Finish />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
