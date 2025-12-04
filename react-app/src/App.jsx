import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardContable from './components/DashboardContable';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (credentials) => {
    setUser(credentials);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    // Limpiar datos del localStorage si es necesario
    // localStorage.removeItem('colmado_products');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Mostrar dashboard según el rol del usuario
  if (user?.role === 'accountant') {
    return <DashboardContable user={user} onLogout={handleLogout} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
