import { useState } from 'react';
import Prologue from './Prologue';
import Game from './Game';
import Finish from './Finish';

type View = 'prologue' | 'game' | 'finish';

function App() {
  // View型の文字列を直接保持
  const [view, setView] = useState<View>('finish');

  let content;
  switch (view) {
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
