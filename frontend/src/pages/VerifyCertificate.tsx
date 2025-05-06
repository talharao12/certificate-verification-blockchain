import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Input,
  Typography,
  Container,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
  TextField,
} from '@mui/material';
import { axiosInstance } from '../context/AuthContext';

interface VerificationResult {
  is_valid: boolean;
  certificate?: {
    student_name: string;
    student_id: string;
    course: string;
    institution_name: string;
    issue_date: string;
    grade?: string;
  };
  error?: string;
}

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'error' | 'success' });

  const validateCertificateId = () => {
    if (!certificateId.trim()) {
      setError('Certificate ID is required');
      return false;
    }
    // Add any specific certificate ID format validation here if needed
    setError('');
    return true;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCertificateId()) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid certificate ID',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    setResult(null); // Clear previous results

    try {
      const response = await axiosInstance.post('/api/certificates/verify', {
        certificate_id: certificateId.trim(),
      });
      setResult(response.data);
      if (response.data.is_valid) {
        setSnackbar({
          open: true,
          message: 'Certificate verified successfully',
          severity: 'success'
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail ||
                          'Failed to verify certificate. Please try again.';
      setResult({
        is_valid: false,
        error: errorMessage,
      });
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" gutterBottom>Verify Certificate</Typography>
        <Typography color="textSecondary">
          Enter the certificate ID to verify its authenticity
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleVerify}>
            <TextField
                fullWidth
                required
                id="certificate-id"
                label="Certificate ID"
                value={certificateId}
                onChange={(e) => {
                  setCertificateId(e.target.value);
                  setError(''); // Clear error when user types
                }}
                placeholder="Enter certificate ID"
                variant="outlined"
                error={!!error}
                helperText={error}
                disabled={loading}
                margin="normal"
                InputProps={{
                  'aria-label': 'Certificate ID input',
                }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Verifying Certificate...' : 'Verify Certificate'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Alert severity={result.is_valid ? 'success' : 'error'} sx={{ mt: 4 }}>
          <AlertTitle>{result.is_valid ? 'Certificate Verified' : 'Verification Failed'}</AlertTitle>
          {result.is_valid ? (
            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1"><strong>Student Name:</strong> {result.certificate?.student_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1"><strong>Student ID:</strong> {result.certificate?.student_id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1"><strong>Course:</strong> {result.certificate?.course}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1"><strong>Institution:</strong> {result.certificate?.institution_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1"><strong>Issue Date:</strong> {new Date(result.certificate?.issue_date!).toLocaleDateString()}</Typography>
              </Grid>
              {result.certificate?.grade && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body1"><strong>Grade:</strong> {result.certificate.grade}</Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography variant="body2">{result.error}</Typography>
          )}
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <MuiAlert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default VerifyCertificate;
