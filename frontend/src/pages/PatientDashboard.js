import React, { useContext, useState, useEffect } from 'react';
import { Grid, Typography, Paper } from '@material-ui/core';
import { AuthContext } from '../context/AuthContext';
import HealthRecordForm from '../components/HealthRecordForm';
import HealthRecordList from '../components/HealthRecordList';
import AccessControl from '../components/AccessControl';
import BlockchainStatus from '../components/BlockchainStatus';
import axios from '../config/axios';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [hllaBalance, setHllaBalance] = useState(0);

  useEffect(() => {
    fetchHllaBalance();
  }, []);

  const fetchHllaBalance = async () => {
    try {
      const res = await axios.get('/api/tokens/balance');
      setHllaBalance(res.data.balance);
    } catch (error) {
      console.error('Error fetching HLLA balance:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">Welcome, {user.name}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper style={{ padding: '1rem' }}>
          <Typography variant="h6">HLLA Balance: {hllaBalance}</Typography>
          <BlockchainStatus />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <HealthRecordForm onRecordAdded={fetchHllaBalance} />
        <AccessControl />
      </Grid>
      <Grid item xs={12} md={6}>
        <HealthRecordList />
      </Grid>
    </Grid>
  );
};

export default PatientDashboard;