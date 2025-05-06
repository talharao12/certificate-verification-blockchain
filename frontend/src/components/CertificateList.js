import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Container,
  TextField,
  InputAdornment,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    const filtered = certificates.filter(cert => 
      cert.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCertificates(filtered);
  }, [searchTerm, certificates]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/certificates/list_all_blockchain');
      setCertificates(response.data);
      setFilteredCertificates(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ISSUED':
        return 'success';
      case 'REVOKED':
        return 'error';
      case 'DRAFT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'ISSUED':
        return <CheckCircleIcon />;
      case 'REVOKED':
        return <CancelIcon />;
      case 'DRAFT':
        return <AccessTimeIcon />;
      default:
        return <SchoolIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStats = () => {
    const total = certificates.length;
    const issued = certificates.filter(c => c.status === 'ISSUED').length;
    const revoked = certificates.filter(c => c.status === 'REVOKED').length;
    const draft = certificates.filter(c => c.status === 'DRAFT').length;

    return { total, issued, revoked, draft };
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchCertificates}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  const stats = getStats();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" sx={{
            background: 'linear-gradient(45deg, #90CAF9 30%, #64B5F6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Certificates on Blockchain
          </Typography>
          <Button
            variant="contained"
            onClick={fetchCertificates}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Certificates
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Issued
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.issued}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Revoked
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.revoked}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Draft
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.draft}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, ID, course, or certificate ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Certificate ID</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCertificates.map((cert) => (
                <TableRow key={cert.certificate_id} hover>
                  <TableCell>
                    <Tooltip title={cert.certificate_id}>
                      <Typography noWrap sx={{ maxWidth: 200 }}>
                        {cert.certificate_id}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{cert.student_name}</TableCell>
                  <TableCell>{cert.student_id}</TableCell>
                  <TableCell>{cert.course}</TableCell>
                  <TableCell>{cert.grade}</TableCell>
                  <TableCell>{formatDate(cert.issue_date)}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(cert.status)}
                      label={cert.status}
                      color={getStatusColor(cert.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        component={RouterLink}
                        to={`/verify/${cert.certificate_id}`}
                        size="small"
                        variant="contained"
                        startIcon={<SearchIcon />}
                      >
                        Verify
                      </Button>
                      {/* <Button
                        component="a"
                        href={`https://explorer.multichain.org/tx/${cert.blockchain_tx}`}
                        target="_blank"
                        size="small"
                        variant="outlined"
                        startIcon={<SchoolIcon />}
                      >
                        View on Chain
                      </Button> */}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography color="textSecondary" textAlign="center">
          Showing {filteredCertificates.length} of {certificates.length} certificates
        </Typography>
      </Stack>
    </Container>
  );
};

export default CertificateList; 