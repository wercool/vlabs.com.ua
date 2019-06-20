import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress
} from '@material-ui/core';
import * as EmailValidator from 'email-validator';

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
    },
    unauthorizedLabel: {
        color: 'red',
        fontFamily: 'Roboto',
        fontSize: '12px',
    }
};

class Login extends Component {
    constructor(props) {
        super();

        this.App = props.App;

        this.state = {
            email: '',
            password: '',
            formErrors: { 
                email: '', 
                password: ''
            },
            submitted: false,
            authorized: undefined
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.handleUserInput = this.handleUserInput.bind(this);
        this.handleUserBlur = this.handleUserBlur.bind(this);

        console.log(this);
    }
    onSubmit(event) {
        event.preventDefault();

        if (this.state.formErrors.email !== '' 
        || this.state.formErrors.password !== '' 
        ||  this.state.email === '' 
        || this.state.password === '') 
        return;

        this.setState({ submitted: true });

        this.App
            .VLabsRESTClientManager
            .AuthService
            .authenticate(this.state.email, this.state.password)
            .then(() => {
                this.setState({ submitted: false, authorized: true });
            })
            .catch((error) => {
                this.setState({ submitted: false, authorized: false });
            });
    }
    handleUserInput(event) {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({ [name]: value });

        let { formErrors } = this.state;
        formErrors[name] = '';

        if (name === 'email' && value !== '') {
            formErrors[name] = EmailValidator.validate(value) ? '' : 'Malformed email address';
        }

        this.setState({ formErrors: formErrors });
    }
    handleUserBlur(event) {
        const name = event.target.name;
        // const value = event.target.value;

        let { formErrors } = this.state;

        switch (name) {
            case 'email':
                if (this.state.email === '') {
                    formErrors['email'] = 'Email is required';
                }
            break;
            case 'password':
                if (this.state.password === '') {
                    formErrors['password'] = 'Paasword is required';
                }
            break;
            default: 
                this.setState({ formErrors: formErrors });
            break;
        }
        this.setState({ formErrors: formErrors });
    }
    render() {
        if (this.App.VLabsRESTClientManager.AuthService.isAuthenticated()) return(
            <Redirect to='/dashboard'/>
        );

        return(
            <Paper style={styles.root} elevation={5}>
                <Typography style={styles.rootLabel} variant='h5' align='center' color='textSecondary'>
                    Welcome to VLabs Admin
                    {
                        (this.state.authorized === false) ? <div style={ styles.unauthorizedLabel }>Login failed</div> : ''
                    }
                </Typography>
                <form style={styles.formContainer} noValidate autoComplete='off' onSubmit={(event) => this.onSubmit(event)}>
                    <TextField
                        autoFocus={true}
                        error={ (this.state.formErrors.email !== '') ? true : false }
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
                        helperText={this.state.formErrors.email}
                    />
                    <TextField
                        name='password'
                        label='Password'
                        margin='normal'
                        variant='outlined'
                        required={true}
                        error={ (this.state.formErrors.password !== '') ? true : false }
                        style={styles.formElement}
                        type='password'
                        value={this.state.password}
                        onChange={(event) => this.handleUserInput(event)}
                        onBlur={(event) => this.handleUserBlur(event)}
                        helperText={this.state.formErrors.password}
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
                        style={styles.formSubmitButton}
                    >
                        Continue
                    </Button>
                </form>
            </Paper>
        );
    }
};
export default withRouter(Login);