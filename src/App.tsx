import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { useToast } from './hooks/useToast';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import NetworkStatus from './components/NetworkStatus';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import AnalysisResultsPage from './pages/AnalysisResultsPage';
import InterviewPage from './pages/InterviewPage';
import ResultsPage from './pages/ResultsPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';
import ProfileDashboard from './components/profile/ProfileDashboard';

// Toast Provider Component
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <Router>
              <div className="min-h-screen bg-white">
                <NetworkStatus />
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfileDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/history" 
                    element={
                      <ProtectedRoute>
                        <InterviewHistoryPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/upload" 
                    element={
                      <ProtectedRoute>
                        <UploadPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analysis" 
                    element={
                      <ProtectedRoute>
                        <AnalysisPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analysis-results" 
                    element={
                      <ProtectedRoute>
                        <AnalysisResultsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/interview" 
                    element={
                      <ProtectedRoute>
                        <InterviewPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/results" 
                    element={
                      <ProtectedRoute>
                        <ResultsPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </div>
            </Router>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;