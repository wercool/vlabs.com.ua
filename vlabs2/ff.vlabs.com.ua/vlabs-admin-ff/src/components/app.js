import React, { Fragment, Component } from 'react';
import {
  AppBar,
  Toolbar,
  Typography
} from '@material-ui/core';

import VLabsRESTClientManager from '../rest.vlabs.client/manager'

import Login from './login';

class App extends Component {
  constructor() {
    super();

    this.VLabsRESTClientManager = new VLabsRESTClientManager();
  }

  render() {
    return (
      <Fragment>
        {/* AppBar */}
        <AppBar position='static'>
          <Toolbar>
            <Typography variant='headline' color='inherit'>
              VLabs Admin
            </Typography>
          </Toolbar>
        </AppBar>
        {/* Login is shown if not yet authenticated */}
        <Login App={this}/>
      </Fragment>
    );
  }
}

export default App;