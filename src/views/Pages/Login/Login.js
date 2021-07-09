import React, {Component} from 'react';
import {
    Button,
    Card,
    CardBody,
    CardGroup,
    Col,
    Container,
    Form,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Row
} from 'reactstrap';

import Authentication from '../../../Authentication';
import {Link} from "react-router-dom";

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectToReferrer: false,
            redirectToChangePassword: false,
            isLoggingIn: false,
            username: '',
            password: '',
            submittedMissingInput: false,
            authenticationRejected: false,
            authenticationFailed: false
        };

        Authentication.on('sessionStarted', () => this.setState({
            redirectToReferrer: true,
            isLoggingIn: false,
            submittedMissingInput: false,
            authenticationFailed: false,
            authenticationRejected: false
        }));
        Authentication.on('changePasswordRequired', (eventArguments) => {
            this.resetState({
                redirectToChangePassword: true,
                changePasswordParameters: eventArguments
            });
        });
        Authentication.on('authenticationRejected', () => {
            this.resetState({authenticationRejected: true});
        });
        Authentication.on('authenticationFailed', () => {
            this.resetState({authenticationFailed: true});
        });
    }

    resetState = (state) => {
        if (typeof state === 'undefined') state = {};
        if (typeof state.isLoggingIn === 'undefined') state.isLoggingIn = false;
        if (typeof state.submittedMissingInput === 'undefined') state.submittedMissingInput = false;
        if (typeof state.authenticationFailed === 'undefined') state.authenticationFailed = false;
        if (typeof state.authenticationRejected === 'undefined') state.authenticationRejected = false;
        if (typeof state.username === 'undefined') state.username = '';
        if (typeof state.password === 'undefined') state.password = '';

        this.setState(state);
    };

    handleUsernameChange = (username) => {
        this.setState({username: username});
    };

    handlePasswordChange = (password) => {
        this.setState({password: password});
    };

    submitCredentials = async () => {
        const {username, password} = this.state;
        if (typeof username === 'undefined' || typeof password === 'undefined'
            || username === "" || password === "") {
            this.setState({submittedMissingInput: true});
        } else {
            this.setState({isLoggingIn: true});
            await Authentication.login(username, password);
        }
    };

    render() {
        if (this.state.redirectToReferrer) {
            const {from} = this.props.location.state || {from: {pathname: '/'}};
            console.log('Login complete. Redirecting to: ' + from.pathname);
            this.props.history.push(from);
        } else if (this.state.redirectToChangePassword) {
            console.log('Password change required. Redirecting to: /changePassword');
            const changePasswordParameters = Object.assign(this.state.changePasswordParameters);
            const {from} = this.props.location.state || {from: {pathname: '/'}};
            this.props.history.push({
                pathname: '/changePassword',
                state: {from: from, changePasswordParameters: changePasswordParameters}
            });
        }

        return (
            <div className="app flex-row align-items-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="8">
                            <CardGroup>
                                <Card className="p-4">
                                    <CardBody>
                                        <Form>
                                            <h1>Login</h1>
                                            <p className="text-muted">Sign In to your account</p>
                                            <InputGroup className="mb-3">
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText>
                                                        <i className="icon-user"/>
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <Input type="text" placeholder="Username" autoComplete="username"
                                                       onChange={(event) => this.handleUsernameChange(event.target.value)}
                                                       value={this.state.username.trim()}/>
                                            </InputGroup>
                                            <InputGroup className="mb-4">
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText>
                                                        <i className="icon-lock"/>
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <Input type="password" placeholder="Password"
                                                       autoComplete="current-password"
                                                       onChange={(event) => this.handlePasswordChange(event.target.value)}
                                                       value={this.state.password}/>
                                            </InputGroup>
                                            {
                                                (this.state.submittedMissingInput) &&
                                                (<div className="alert alert-danger" role="alert">
                                                    Please enter both username and password.
                                                </div>)
                                            }
                                            {
                                                (this.state.authenticationFailed) &&
                                                (<div className="alert alert-danger" role="alert">
                                                    Something went wrong on our side. Please try again later.
                                                </div>)
                                            }
                                            {
                                                (this.state.authenticationRejected) &&
                                                (<div className="alert alert-danger" role="alert">
                                                    Login failed. Please check username and password.
                                                </div>)
                                            }
                                            <Row>
                                                <Col xs="6">
                                                    <Button type="submit" color="primary" className="w-75 px-4"
                                                            onClick={async (event) => {
                                                                event.preventDefault();
                                                                await this.submitCredentials();
                                                            }}>
                                                        {
                                                            (this.state.isLoggingIn) ?
                                                                (<div className="spinner-grow spinner-grow-sm"
                                                                      role="status">
                                                                    <span className="sr-only">Loading...</span>
                                                                </div>)
                                                                :
                                                                ('Login')
                                                        }
                                                    </Button>
                                                </Col>
                                                <Col xs="6" className="text-right">
                                                    <Button disabled={true} color="link" className="px-0">Forgot
                                                        password?</Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </CardBody>
                                </Card>
                                <Card className="text-white bg-primary py-5 d-md-down-none" style={{width: '44%'}}>
                                    <CardBody className="text-center">
                                        <div>
                                            <h2>Sign up</h2>
                                            <p>Sign up to the iSun Dashboard is currently disabled.</p>
                                            <Link to="/register">
                                                <Button disabled={true} color="primary" className="mt-3" active
                                                        tabIndex={-1}>Register
                                                    Now!</Button>
                                            </Link>
                                        </div>
                                    </CardBody>
                                </Card>
                            </CardGroup>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Login;
