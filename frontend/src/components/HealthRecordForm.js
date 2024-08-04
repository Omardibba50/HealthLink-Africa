import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, CircularProgress } from '@material-ui/core';
import axios from '../config/axios';

const HealthRecordForm = ({ onRecordAdded }) => {
  const [data, setData] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/records/add', { data });
      console.log('Add record response:', res.data);
      setData('');
      setTxId(res.data.transactionId);
      if (onRecordAdded) onRecordAdded();
    } catch (error) {
      console.error('Error adding record:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.error || 'Failed to add record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
      <Typography variant="h6">Add Health Record</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          variant="outlined"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter health record details"
          style={{ marginBottom: '1rem' }}
          disabled={loading}
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Add Record'}
        </Button>
      </form>
      {error && (
        <Typography color="error" style={{ marginTop: '1rem' }}>
          {error}
        </Typography>
      )}
      {txId && (
        <Typography variant="body2" style={{ marginTop: '1rem' }}>
          Transaction ID: {txId}
        </Typography>
      )}
    </Paper>
  );
};

export default HealthRecordForm;