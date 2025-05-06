import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CertificateDetails = () => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/certificates/${id}/`);
        setCertificate(response.data);
      } catch (err) {
        setError('Failed to fetch certificate details');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!certificate) {
    return (
      <Container maxWidth="md">
        <Alert severity="info" sx={{ mt: 4 }}>
          Certificate not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Certificate Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Certificate ID
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {certificate.certificate_id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Student Name
            </Typography>
            <Typography variant="body1">
              {certificate.student_name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Student ID
            </Typography>
            <Typography variant="body1">
              {certificate.student_id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Course
            </Typography>
            <Typography variant="body1">
              {certificate.course}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Grade
            </Typography>
            <Typography variant="body1">
              {certificate.grade}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Issue Date
            </Typography>
            <Typography variant="body1">
              {new Date(certificate.issue_date).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Institution
            </Typography>
            <Typography variant="body1">
              {certificate.institution}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/certificates')}
          >
            Back to List
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/verify/${certificate.certificate_id}`)}
          >
            Verify Certificate
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CertificateDetails; 