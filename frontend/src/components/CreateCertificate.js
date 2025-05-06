import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateCertificate = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    course: '',
    grade: '',
    issue_date: '',
    institution: ''
  });
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/institutions');
        setInstitutions(response.data);
      } catch (err) {
        setError('Failed to fetch institutions');
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/api/certificates',
        formData,
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );

      setSuccess('Certificate created successfully!');
      setFormData({
        student_name: '',
        student_id: '',
        course: '',
        grade: '',
        issue_date: '',
        institution: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Create New Certificate
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Student Name"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Student ID"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Issue Date"
                name="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Institution</InputLabel>
                <Select
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  label="Institution"
                  disabled={loadingInstitutions}
                >
                  {institutions.map((institution) => (
                    <MenuItem key={institution.id} value={institution.id}>
                      {institution.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || loadingInstitutions}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Certificate'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateCertificate; 