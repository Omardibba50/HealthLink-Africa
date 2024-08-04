import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Route
      {...rest}
      render={props =>
        user ? (
          <Component {...props} user={user} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <PrivateRoute 
              path="/dashboard" 
              component={({ user }) => 
                user.role === 'patient' ? <PatientDashboard /> : <DoctorDashboard />
              } 
            />
          </Switch>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;