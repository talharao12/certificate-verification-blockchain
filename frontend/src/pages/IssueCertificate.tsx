import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  Alert,
  Container,
  Snackbar,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface FormData {
  studentName: string;
  studentId: string;
  courseName: string;
  grade: string;
  completionDate: string;
  institution: string;
}

interface FormErrors {
  studentName?: string;
  studentId?: string;
  courseName?: string;
  grade?: string;
  completionDate?: string;
  institution?: string;
}

interface Institution {
  id: number;
  name: string;
}

const IssueCertificate = () => {
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    studentId: '',
    courseName: '',
    grade: '',
    completionDate: '',
    institution: '',
  });
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'success',
  });

  useEffect(() => {
    // Fetch institutions when component mounts
    const fetchInstitutions = async () => {
      try {
        const response = await axiosInstance.get('/institutions/');
        setInstitutions(response.data);
      } catch (err) {
        console.error('Failed to fetch institutions:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load institutions. Please try again.',
          severity: 'error',
        });
      }
    };

    fetchInstitutions();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.studentName.trim()) {
      errors.studentName = 'Student name is required';
      isValid = false;
    }

    if (!formData.studentId.trim()) {
      errors.studentId = 'Student ID is required';
      isValid = false;
    }

    if (!formData.courseName.trim()) {
      errors.courseName = 'Course name is required';
      isValid = false;
    }

    if (!formData.grade.trim()) {
      errors.grade = 'Grade is required';
      isValid = false;
    }

    if (!formData.completionDate) {
      errors.completionDate = 'Completion date is required';
      isValid = false;
    }

    if (!formData.institution) {
      errors.institution = 'Institution is required';
        isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the form errors before submitting',
        severity: 'error',
      });
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axiosInstance.post('/certificates/', {
        student_name: formData.studentName,
        student_id: formData.studentId,
        course: formData.courseName,
        grade: formData.grade,
        issue_date: formData.completionDate,
        institution: formData.institution,
        metadata: {} // Optional metadata
      });

      setSuccess(true);
      setSnackbar({
        open: true,
        message: `Certificate Issued Successfully - ID: ${response.data.certificate_id}`,
        severity: 'success',
      });
      
      // Reset form
      setFormData({
        studentName: '',
        studentId: '',
        courseName: '',
        grade: '',
        completionDate: '',
        institution: '',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to issue certificate. Please try again.';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Issue Certificate
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
              select
              label="Institution"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              error={!!formErrors.institution}
              helperText={formErrors.institution}
                required
                fullWidth
            >
              {institutions.map((institution) => (
                <MenuItem key={institution.id} value={institution.id}>
                  {institution.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
                label="Student Name"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                error={!!formErrors.studentName}
                helperText={formErrors.studentName}
              required
              fullWidth
              />

              <TextField
                label="Student ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                error={!!formErrors.studentId}
                helperText={formErrors.studentId}
              required
              fullWidth
              />

              <TextField
                label="Course Name"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                error={!!formErrors.courseName}
                helperText={formErrors.courseName}
              required
              fullWidth
              />

              <TextField
                label="Grade"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                error={!!formErrors.grade}
                helperText={formErrors.grade}
              required
              fullWidth
              />

              <TextField
                label="Completion Date"
              name="completionDate"
                type="date"
                value={formData.completionDate}
                onChange={handleInputChange}
                error={!!formErrors.completionDate}
                helperText={formErrors.completionDate}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
                }}
              />

              <Button
                type="submit"
                variant="contained"
              color="primary"
                size="large"
                disabled={isLoading}
              sx={{ mt: 2 }}
              >
              {isLoading ? <CircularProgress size={24} /> : 'Issue Certificate'}
              </Button>
            </Stack>
          </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IssueCertificate;
