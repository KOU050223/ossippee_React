import { useState } from 'react';
import { Entry, Unity, Line, Flutter, Prologue, Game, Finish } from './scenes/index';
import './App.css';

type View = 'entry' | 'unity' | 'line' | 'flutter' | 'prologue' | 'game' | 'finish';

function App() {
  // View型の文字列を直接保持
  const [view, setView] = useState<View>('entry');

  let content;
  switch (view) {
    case 'entry':
      content = <Entry
      // onStart={() => setView('unity')} 
      />;
      break;
    case 'unity':
      content = <Unity
      // onStart={() => setView('line')}
      />;
      break;
    case 'line':
      content = <Line
      // onStart={() => setView('flutter')}
      />;
      break;
    case 'flutter':
      content = <Flutter
      // onStart={() => setView('game')} 
      />;
      break;
    case 'prologue':
      content = <Prologue
      // onStart={() => setView('game')} 
      />;
      break;
    case 'game':
      content = <Game
        onFinish={() => setView('finish')}
      />;
      break;
    case 'finish':
      content = <Finish
      // onRestart={() => setView('game')}
      // onExit={() => setView('menu')}
      />;
      break;
    default:
      content = (
        <Prologue
        // onPause={() => setView('pause')}
        // onExit={() => setView('menu')}
        />
      );
      break;
  }

  return <>{content}</>;
}

export default App;
