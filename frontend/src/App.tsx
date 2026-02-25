import { useState } from 'react';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { authInfo } from './lib/api';

export type ViewState = 'landing' | 'login' | 'register' | 'dashboard';

function App() {
  // If a valid token exists, go straight to dashboard
  const [currentView, setCurrentView] = useState<ViewState>(
    authInfo.isAuthenticated() ? 'dashboard' : 'landing'
  );

  return (
    <>
      {currentView === 'landing' && <Landing onNavigate={setCurrentView} />}
      {currentView === 'login' && <Login onNavigate={setCurrentView} />}
      {currentView === 'register' && <Register onNavigate={setCurrentView} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
    </>
  );
}

export default App;
