import React, { Fragment, Component } from 'react';
import { Route, BrowserRouter as Router, Redirect } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button
} from '@material-ui/core';

import VLabsRESTClientManager from '../rest.vlabs.client/manager'

import Login from './login';
import Logout from './logout';
import Dashboard from './dashboard';
import ValterServices from './valter/valter-services';
import Users from './users';

const styles = {
    root: {
        marginBottom: '10px',
    },
    button: {
      color: '#FFFFFF',
      fontSize: '18px',
    }
};

class App extends Component {

  constructor() {
    super();

    this.VLabsRESTClientManager = new VLabsRESTClientManager();

    this.VLabsRESTClientManager.AuthService.updateUserDetails();

    this.state = {
      redirectTo: null
    }

    console.log(this);
  }

  componentDidUpdate() {
    if (this.state.redirectTo !== null) {
      this.setState({ redirectTo: null });
    }
  }

  setRedirect = (path) => {
    this.setState({
      redirectTo: path
    });
  }

  renderRedirect = () => {
    if (this.state.redirectTo !== null) {
      return ( <Redirect to={ this.state.redirectTo }  />);
    }
  }

  render() {
    return (
      <Router>

        { this.renderRedirect() }

        <Fragment>

          <AppBar style={styles.root} position='static'>
            <Toolbar>
              <Typography variant='headline' color='inherit'>
                <Button style={styles.button} onClick={ () => { this.setRedirect('/dashboard'); } }>
                  VLABS ADMIN
                </Button>
                <Logout App={this} />
              </Typography>
            </Toolbar>
          </AppBar>

          <Route exact path="/login" component={ () => <Login App={this} /> } />
          <Route exact path="/dashboard" component={ () => <Dashboard App={this} /> } />
          <Route exact path="/users" component={ () => <Users App={this} /> } />

          <Route exact path="/valter-services" component={ () => <ValterServices App={this} /> } />

        </Fragment>

      </Router>
    );
  }
}

export default App;