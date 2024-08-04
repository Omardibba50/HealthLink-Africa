import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, Radio, RadioGroup, FormControlLabel } from '@material-ui/core';
import axios from '../config/axios';
import { useHistory } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { name, email, password, role });
      history.push('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <Paper style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <Typography variant="h5" align="center" gutterBottom>Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />
        <RadioGroup value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: '1rem' }}>
          <FormControlLabel value="patient" control={<Radio />} label="Patient" />
          <FormControlLabel value="doctor" control={<Radio />} label="Doctor" />
        </RadioGroup>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </form>
    </Paper>
  );
};

export default Register;
