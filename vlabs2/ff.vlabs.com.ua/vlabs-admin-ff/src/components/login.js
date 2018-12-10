import React, { Component } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress
} from '@material-ui/core';

const styles = {
    root: {
        position: 'absolute',
        margin: 'auto',
        top: '25%',
        right: 0,
        left: 0,
        width: '400px',
        maxWidth: '90%',
        height: '300px',
    },
    rootLabel: {
        paddingTop: '20px'
    },
    formContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        paddingLeft: '5%',
        paddingRight: '5%',
        paddingTop: '15px'
    },
    formElement: {
        width: '100%'
    },
    formSubmitButton: {
        position: 'absolute',
        right: '5%',
        bottom: '20px'
    }
};

class Login extends Component {
    constructor(props) {
        super();

        this.App = props.App;

        this.state = {
            email: '',
            password: '',
            formErrors: {email: '', password: ''},
            submitted: false
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.handleUserInput = this.handleUserInput.bind(this);
        this.handleUserBlur = this.handleUserBlur.bind(this);

        console.log(this);
    }
    onSubmit(event) {
        event.preventDefault();
        this.setState({ submitted: true });

        this.App
            .VLabsRESTClientManager
            .PublicService
            .ping()
            .then((result) => { console.log(result); });
    }
    handleUserInput(event) {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({[name]: value});
    }
    handleUserBlur(event) {
        const name = event.target.name;
        const value = event.target.value;
        switch (name) {
            case 'email':
                if (this.state.email === '') {
                    this.setState({formErrors: { email: 'test'}});
                }
            break;
        }
    }
    render() {
        return(
            <Paper style={styles.root} elevation={5}>
                <Typography style={styles.rootLabel} variant='h5' align='center' color='textSecondary'>
                    Welcome to VLabs Admin
                </Typography>
                <form style={styles.formContainer} noValidate autoComplete='off' onSubmit={(event) => this.onSubmit(event)}>
                    <TextField
                    error
                        name='email'
                        label='Email'
                        placeholder='email@host.name'
                        margin='normal'
                        variant='outlined'
                        required={true}
                        style={styles.formElement}
                        value={this.state.email}
                        onChange={(event) => this.handleUserInput(event)}
                        onBlur={(event) => this.handleUserBlur(event)}
                    />
                    <TextField
                        name='password'
                        label='Password'
                        margin='normal'
                        variant='outlined'
                        required={true}
                        style={styles.formElement}
                        type='password'
                        value={this.state.password}
                        onChange={(event) => this.handleUserInput(event)}
                    />
                    { this.state.submitted ?
                        <CircularProgress 
                            variant='indeterminate'
                        />
                    :
                        ''
                    }
                    <Button type='submit' 
                        variant='contained'
                        color='primary'
                        style={styles.formSubmitButton}>
                        Continue
                    </Button>
                </form>
            </Paper>
        );
    }
}


export default Login;