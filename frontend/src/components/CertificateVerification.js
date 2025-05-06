import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Stack
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CertificateVerification = () => {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { certificateId: urlCertificateId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlCertificateId) {
      setCertificateId(urlCertificateId);
      handleVerify(urlCertificateId);
    }
  }, [urlCertificateId]);

  const handleVerify = async (id = certificateId) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('http://localhost:8000/api/certificates/verify', {
        certificate_id: id
      });
      setVerificationResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify certificate');
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h1" align="center" sx={{
          background: 'linear-gradient(45deg, #90CAF9 30%, #64B5F6 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Verify Certificate
        </Typography>

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Certificate ID"
                variant="outlined"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter certificate ID to verify"
                InputProps={{
                  endAdornment: (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || !certificateId}
                      startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                    >
                      Verify
                    </Button>
                  ),
                }}
              />
            </Stack>
          </form>
        </Paper>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {verificationResult && (
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Alert severity={verificationResult.is_valid ? "success" : "error"}>
                  {verificationResult.is_valid ? "Certificate is valid" : "Certificate is invalid"}
                </Alert>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Certificate ID
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {verificationResult.certificate?.certificate_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Student Name
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.student_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Student ID
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.student_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Student Email
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.student_email || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Course
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.course}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Grade
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.grade}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Issue Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(verificationResult.certificate?.issue_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Expiry Date
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.expiry_date 
                        ? new Date(verificationResult.certificate.expiry_date).toLocaleDateString()
                        : 'No expiry date'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Institution Name
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.institution_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Institution Address
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.institution_address}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Status
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.certificate?.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(verificationResult.certificate?.created_at).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
};

export default CertificateVerification; 