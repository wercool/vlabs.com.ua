import React, { Fragment, Component } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography
} from '@material-ui/core';

import VLabsRESTClientManager from '../rest.vlabs.client/manager'

import Login from './login';
import Logout from './logout';
import Dashboard from './dashboard';

class App extends Component {
  constructor() {
    super();

    this.VLabsRESTClientManager = new VLabsRESTClientManager();

    this.VLabsRESTClientManager.AuthService.updateUserDetails()
    .catch((error) => {
      console.warn('routing to /login');
    });

    console.log(this);
  }

  render() {
    return (
      <Router>
        <Fragment>
          <AppBar position='static'>
            <Toolbar>
              <Typography variant='headline' color='inherit'>
                VLabs Admin
                <Logout App={this} />
              </Typography>
            </Toolbar>
          </AppBar>

          <Route exact path="/login" component={ () => <Login App={this} /> } />
          <Route exact path="/dashboard" component={ () => <Dashboard App={this} /> } />

        </Fragment>
      </Router>
    );
  }
}

export default App;