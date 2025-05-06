import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Box } from '@mui/material';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import VerifyCertificate from './pages/VerifyCertificate';
import IssueCertificate from './pages/IssueCertificate';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <Navbar />
          <Box component="main" flexGrow={1} py={4}> {/* Main content area */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route 
                path="/issue" 
                element={
                  <PrivateRoute>
                    <IssueCertificate />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
