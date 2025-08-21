import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CreateRfpPage } from './pages/rfp/CreateRfpPage';
import { MyRfpsPage } from './pages/rfp/MyRfpsPage';
import { BrowseRfpsPage } from './pages/rfp/BrowseRfpsPage';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'dashboard', action: 'view' }}>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* RFP routes */}
            <Route 
              path="/rfps/create" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'create' }}>
                  <CreateRfpPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rfps/my" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'view' }}>
                  <MyRfpsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rfps/browse" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'view' }}>
                  <BrowseRfpsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
