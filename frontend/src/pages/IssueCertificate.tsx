import React, { useState } from 'react';
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
} from '@mui/material';
import { axiosInstance } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

interface FormData {
  studentName: string;
  studentId: string;
  courseName: string;
  grade: string;
  completionDate: string;
}

interface FormErrors {
  studentName?: string;
  studentId?: string;
  courseName?: string;
  grade?: string;
  completionDate?: string;
}

const IssueCertificate = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    studentId: '',
    courseName: '',
    grade: '',
    completionDate: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.studentName.trim()) {
      errors.studentName = 'Student name is required';
      isValid = false;
    } else if (formData.studentName.length < 2) {
      errors.studentName = 'Student name must be at least 2 characters';
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
    } else {
      const selectedDate = new Date(formData.completionDate);
      const today = new Date();
      if (selectedDate > today) {
        errors.completionDate = 'Completion date cannot be in the future';
        isValid = false;
      }
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
      const response = await axiosInstance.post('/api/certificates/', {
        student_name: formData.studentName,
        student_id: formData.studentId,
        course: formData.courseName,
        grade: formData.grade,
        issue_date: formData.completionDate,
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
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 4, p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h5" align="center" gutterBottom>
            Issue New Certificate
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Certificate has been issued successfully.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="Student Name"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                variant="outlined"
                error={!!formErrors.studentName}
                helperText={formErrors.studentName}
                disabled={isLoading}
              />

              <TextField
                required
                fullWidth
                label="Student ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                variant="outlined"
                error={!!formErrors.studentId}
                helperText={formErrors.studentId}
                disabled={isLoading}
              />

              <TextField
                required
                fullWidth
                label="Course Name"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                variant="outlined"
                error={!!formErrors.courseName}
                helperText={formErrors.courseName}
                disabled={isLoading}
              />

              <TextField
                required
                fullWidth
                label="Grade"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                variant="outlined"
                error={!!formErrors.grade}
                helperText={formErrors.grade}
                disabled={isLoading}
              />

              <TextField
                required
                fullWidth
                label="Completion Date"
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleInputChange}
                variant="outlined"
                error={!!formErrors.completionDate}
                helperText={formErrors.completionDate}
                InputLabelProps={{ shrink: true }}
                disabled={isLoading}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Issuing Certificate...' : 'Issue Certificate'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IssueCertificate;
