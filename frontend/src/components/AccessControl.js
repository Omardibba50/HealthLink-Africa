import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, CircularProgress } from '@material-ui/core';
import axios from '../config/axios';

const AccessControl = () => {
  const [doctorEmail, setDoctorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txId, setTxId] = useState('');

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/records/grant-access', { doctorEmail });
      setDoctorEmail('');
      setTxId(res.data.transactionId);
    } catch (error) {
      console.error('Error granting access:', error);
      setError('Failed to grant access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper style={{ padding: '1rem' }}>
      <Typography variant="h6">Grant Access to Doctor</Typography>
      <form onSubmit={handleGrantAccess}>
        <TextField
          fullWidth
          variant="outlined"
          value={doctorEmail}
          onChange={(e) => setDoctorEmail(e.target.value)}
          placeholder="Enter doctor's email"
          style={{ marginBottom: '1rem' }}
          disabled={loading}
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Grant Access'}
        </Button>
      </form>
      {error && (
        <Typography color="error" style={{ marginTop: '1rem' }}>
          {error}
        </Typography>
      )}
      {txId && (
        <Typography variant="body2" style={{ marginTop: '1rem' }}>
          Access granted. Transaction ID: {txId}
        </Typography>
      )}
    </Paper>
  );
};

export default AccessControl;