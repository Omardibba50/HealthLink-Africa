import React from 'react';
import { Typography, Button, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Grid container spacing={3} alignItems="center" justifyContent="center" style={{ minHeight: '80vh' }}>
      <Grid item xs={12}>
        <Typography variant="h2" align="center">Welcome to HealthLink Africa</Typography>
        <Typography variant="h5" align="center" style={{ marginTop: '1rem' }}>
          Secure and Accessible Healthcare Records
        </Typography>
        <Grid container justifyContent="center" style={{ marginTop: '2rem' }}>
          <Button component={Link} to="/register" variant="contained" color="primary" style={{ marginRight: '1rem' }}>
            Get Started
          </Button>
          <Button component={Link} to="/login" variant="outlined" color="primary">
            Login
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Home;