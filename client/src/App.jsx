import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Feed from './pages/Feed.jsx';
import Saved from './pages/Saved.jsx';
import Profile from './pages/Profile.jsx';
import Trending from './pages/Trending.jsx';
import ArticleDetails from './pages/ArticleDetails.jsx';
import Footer from './components/Footer.jsx';
import Chatbot from './components/Chatbot.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout><Feed /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <PrivateRoute>
                <Layout><Saved /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout><Profile /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/trending"
            element={
              <PrivateRoute>
                <Layout><Trending /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/articles/:id"
            element={
              <PrivateRoute>
                <Layout><ArticleDetails /></Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/login" 
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            } 
          />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            },
          }}
        />
        <Chatbot />
      </AuthProvider>
    </ThemeProvider>
  );
}


