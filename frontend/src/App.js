import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CertificateList from './components/CertificateList';
import CertificateVerification from './components/CertificateVerification';
import CreateCertificate from './components/CreateCertificate';
import Login from './components/Login';
import CertificateDetails from './components/CertificateDetails';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box minHeight="100vh" bgcolor="background.default">
          <Navbar />
          <Box component="main" py={4}>
            <Routes>
              <Route path="/" element={<CertificateList />} />
              <Route path="/certificates" element={<CertificateList />} />
              <Route path="/certificates/:id" element={<CertificateDetails />} />
              <Route path="/create" element={<CreateCertificate />} />
              <Route path="/verify" element={<CertificateVerification />} />
              <Route path="/verify/:certificateId" element={<CertificateVerification />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 