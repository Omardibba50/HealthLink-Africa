import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress } from '@material-ui/core';
import axios from '../config/axios';

const BlockchainStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/blockchain/status');
        setStatus(res.data);
        setError('');
      } catch (error) {
        console.error('Error fetching blockchain status:', error);
        setError('Failed to fetch blockchain status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Typography variant="body2">
      Blockchain Last Round: {status?.lastRound}
    </Typography>
  );
};

export default BlockchainStatus;