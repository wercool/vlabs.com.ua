import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import ExitToApp from '@material-ui/icons/ExitToApp';
import Tooltip from '@material-ui/core/Tooltip';

const styles = {
    root: {
        position: 'absolute',
        top: '25%',
        right: '10px',
        fontSize: '10px',
    },
    exitButton: {
        cursor: 'pointer',
        marginLeft: '10px',
        display: 'inline-flex',
        verticalAlign: 'middle'
    }
};

class Logout extends Component {
    constructor(props) {
        super();

        this.App = props.App;

        this.state = {

        };
    }

    render() {
        if (!this.App.VLabsRESTClientManager.AuthService.isAuthenticated()) return( <Redirect to='/login'/> );

        return(
            <div style={styles.root}>
                {
                    this.App.VLabsRESTClientManager.AuthService.userDetails.username
                }
                <Tooltip title="Logout">
                    <div style={styles.exitButton}>
                        <ExitToApp 
                            onClick={() => { 
                                this.App.VLabsRESTClientManager.AuthService.logout();
                                this.props.history.push('/');
                            }}
                        />
                    </div>
                </Tooltip>
            </div>
        );
    }
}
export default withRouter(Logout);