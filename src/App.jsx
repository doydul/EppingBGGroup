import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/Auth';
import AppScreen from './components/AppScreen';
import './styles/index.css';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {currentUser ? <AppScreen /> : <AuthScreen />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
