import { useState } from 'react';
import { Entry, Unity, Line, Flutter, Prologue, Game, Finish } from './scenes/index';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// type View = 'entry' | 'unity' | 'line' | 'flutter' | 'prologue' | 'game' | 'finish';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Entry />}/>
          <Route path='unity' element={<Unity />} />
          <Route path='line' element={<Line />} />
          <Route path='flutter' element={<Flutter />} />
          <Route path='prologue' element={<Prologue />} />
          <Route path='game' element={<Game/>} />
          <Route path='finish' element={<Finish />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
