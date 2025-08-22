import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CreateRfpPage } from './pages/rfp/CreateRfpPage';
import { EditRfpPage } from './pages/rfp/EditRfpPage';
import { MyRfpsPage } from './pages/rfp/MyRfpsPage';
import { BrowseRfpsPage } from './pages/rfp/BrowseRfpsPage';
import { CreateResponsePage } from './pages/response/CreateResponsePage';
import { MyResponsesPage } from './pages/response/MyResponsesPage';
import { RfpResponsesPage } from './pages/response/RfpResponsesPage';
import { RfpDetailPage } from './pages/rfp/RfpDetailPage';
import { ResponseDetailPage } from './pages/response/ResponseDetailPage';
import AuditTrailPage from './pages/audit/AuditTrailPage';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <Layout>
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
              <Route 
                path="/rfps/:rfpId/edit" 
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'edit' }}>
                    <EditRfpPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rfps/:rfpId" 
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'view' }}>
                    <RfpDetailPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Response routes */}
              <Route 
                path="/responses/create" 
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'create' }}>
                    <CreateResponsePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/responses/create/:rfpId" 
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'create' }}>
                    <CreateResponsePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/responses/my" 
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'view' }}>
                    <MyResponsesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rfps/:rfpId/responses" 
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'view' }}>
                    <RfpResponsesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/responses/:responseId" 
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'view' }}>
                    <ResponseDetailPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Audit Trail routes */}
              <Route 
                path="/audit" 
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'admin', action: 'view' }}>
                    <AuditTrailPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect root to dashboard or login */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </Router>
          <Toaster richColors position="top-right" />
        </WebSocketProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
