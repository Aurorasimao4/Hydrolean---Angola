import { useState } from 'react';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export type ViewState = 'landing' | 'login' | 'register';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  return (
    <>
      {currentView === 'landing' && <Landing onNavigate={setCurrentView} />}
      {currentView === 'login' && <Login onNavigate={setCurrentView} />}
      {currentView === 'register' && <Register onNavigate={setCurrentView} />}
    </>
  );
}

export default App;
