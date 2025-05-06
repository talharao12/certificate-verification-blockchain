import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Box, Container, Toolbar, Typography, Stack, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LayoutProps {
  children: React.ReactNode;
}

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
}));

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <StyledLink to="/">
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                CertifyChain
              </Typography>
            </StyledLink>
            <Stack direction="row" spacing={2}>
              <Button color="inherit" component={StyledLink} to="/verify">
                Verify Certificate
              </Button>
              <Button color="inherit" component={StyledLink} to="/issue">
                Issue Certificate
              </Button>
              <Button color="inherit" component={StyledLink} to="/login">
                Login
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" sx={{ flex: 1, py: 4 }} maxWidth="xl">
        {children}
      </Container>

      <Box component="footer" sx={{ py: 4, textAlign: 'center' }}>
        <Container maxWidth="xl">
          <Stack spacing={1}>
            <Typography variant="body1">
              CertifyChain - Blockchain-Based Certificate Verification System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created by: Talha Rao, John Doe, Jane Smith
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
