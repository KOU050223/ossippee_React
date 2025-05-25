import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Entry, Unity, Line, Flutter, Game, Finish } from './scenes/index';
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
    return (_jsx(_Fragment, { children: _jsxs(Router, { children: [_jsx(RouterEffects, {}), _jsxs(Routes, { children: [_jsx(Route, { path: '/', element: _jsx(Entry, {}) }), _jsx(Route, { path: 'entry', element: _jsx(Entry, {}) }), _jsx(Route, { path: 'unity', element: _jsx(Unity, {}) }), _jsx(Route, { path: 'line', element: _jsx(Line, {}) }), _jsx(Route, { path: 'flutter', element: _jsx(Flutter, {}) }), _jsx(Route, { path: 'react', element: _jsx(Game, {}) }), _jsx(Route, { path: 'finish', element: _jsx(Finish, {}) })] })] }) }));
}
export default App;
