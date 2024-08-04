import React, { useContext, useState } from 'react';
import { Grid, Typography, TextField, Button, Paper } from '@material-ui/core';
import { AuthContext } from '../context/AuthContext';
import HealthRecordList from '../components/HealthRecordList';
import BlockchainStatus from '../components/BlockchainStatus';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [patientEmail, setPatientEmail] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleFetchRecords = (e) => {
    e.preventDefault();
    setSearchPerformed(true);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">Welcome, Dr. {user.name}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper style={{ padding: '1rem' }}>
          <BlockchainStatus />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper style={{ padding: '1rem' }}>
          <Typography variant="h6">Fetch Patient Records</Typography>
          <form onSubmit={handleFetchRecords}>
            <TextField
              fullWidth
              label="Patient Email"
              variant="outlined"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            <Button type="submit" variant="contained" color="primary">
              Fetch Records
            </Button>
          </form>
        </Paper>
      </Grid>
      {searchPerformed && (
        <Grid item xs={12}>
          <HealthRecordList patientEmail={patientEmail} />
        </Grid>
      )}
    </Grid>
  );
};

export default DoctorDashboard;