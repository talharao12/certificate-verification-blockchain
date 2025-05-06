import React from 'react';
import { Container, Typography, Paper, Button, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import DescriptionIcon from '@mui/icons-material/Description';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const StyledLink = styled(Link)({
  textDecoration: 'none',
  width: '100%',
});

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={8}>
        <Typography variant="h2" component="h1" gutterBottom>
          CertifyChain
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          A secure, blockchain-based platform for issuing and verifying academic certificates
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <VerifiedIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h2" gutterBottom>
              Verify Certificate
            </Typography>
            <Typography color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
              Instantly verify the authenticity of academic certificates using blockchain technology
            </Typography>
            <StyledLink to="/verify">
              <Button variant="contained" size="large" fullWidth>
                Verify Now
              </Button>
            </StyledLink>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <DescriptionIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h2" gutterBottom>
              Issue Certificate
            </Typography>
            <Typography color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
              Educational institutions can securely issue and manage digital certificates
            </Typography>
            <StyledLink to="/issue">
              <Button variant="contained" size="large" fullWidth>
                Issue Certificate
              </Button>
            </StyledLink>
          </StyledPaper>
        </Grid>
      </Grid>

      <Box textAlign="center">
        <Typography variant="h4" component="h2" gutterBottom>
          Our Team
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Fizza Rashid</Typography>
              <Typography color="text.secondary">21K-3390</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Rao Talha Pervaiz</Typography>
              <Typography color="text.secondary">21K-3392</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Haris Ahmed</Typography>
              <Typography color="text.secondary">21K-4677</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
