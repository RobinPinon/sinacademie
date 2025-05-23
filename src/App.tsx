import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import CounterPage from './pages/CounterPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';
import ApprovedRoute from './components/ApprovedRoute';
import Navbar from './components/Navbar';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import DefenseDetails from './pages/DefenseDetails';
import DefensePage from './pages/DefensePage';
import MonstersPage from './pages/MonstersPage';
import BuildsPage from './pages/BuildsPage';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ApprovedRoute>
                      <Profile />
                    </ApprovedRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/counter"
                element={
                  <PrivateRoute>
                    <ApprovedRoute>
                      <CounterPage />
                    </ApprovedRoute>
                  </PrivateRoute>
                }
              />
              <Route 
                path="/counter/:slug" 
                element={
                  <PrivateRoute>
                    <ApprovedRoute>
                      <DefensePage />
                    </ApprovedRoute>
                  </PrivateRoute>
                }
              />
              <Route path="/defense/:id" element={<DefenseDetails />} />
              <Route path="/defense/:slug" element={<DefensePage />} />
              <Route path="/monsters" element={<MonstersPage />} />
              <Route
                path="/builds"
                element={
                  <PrivateRoute>
                    <ApprovedRoute>
                      <BuildsPage />
                    </ApprovedRoute>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
