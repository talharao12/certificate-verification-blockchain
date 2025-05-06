import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { token } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to your Dashboard
          </Typography>
          <Typography variant="body1">
            This is a protected page that requires authentication.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 