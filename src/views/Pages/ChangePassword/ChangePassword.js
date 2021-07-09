import React, {Component} from 'react';
import {
    Button,
    Card,
    CardBody,
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

class ChangePassword extends Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectToReferrer: false,
            isChangingPassword: false,
            oldPassword: undefined,
            newPassword: undefined,
            repeatNewPassword: undefined,
            submittedInvalidCredentials: false,
            newPasswordsDontMatch: false
        };

        Authentication.on('passwordChanged', () => this.setState({
            redirectToReferrer: true,
            isChangingPassword: false
        }));
    }

    handleOldPasswordChange = (oldPassword) => {
        this.setState({oldPassword: oldPassword});
    };

    handleNewPasswordChange = (newPassword) => {
        this.setState({newPassword: newPassword});
    };

    handleRepeatNewPasswordChange = (repeatNewPassword) => {
        this.setState({repeatNewPassword: repeatNewPassword});
    };

    submitPasswordChangeCredentials = async () => {
        const {oldPassword, newPassword, repeatNewPassword} = this.state;
        const {challenge} = this.props.location.state.changePasswordParameters;

        if (this.enteredCredentialsAreValid(oldPassword, newPassword, repeatNewPassword)) {
            this.setState({
                oldPassword: undefined,
                newPassword: undefined,
                repeatNewPassword: undefined,
                isChangingPassword: true,
                submittedInvalidCredentials: false,
                newPasswordsDontMatch: false
            });
            await Authentication.changePassword(oldPassword, newPassword, challenge);
        } else if (newPassword !== repeatNewPassword) {
            this.setState({
                newPasswordsDontMatch: true,
                submittedInvalidCredentials: false
            });
        } else {
            console.warn('Entered Credentials are not valid');
            this.setState({
                submittedInvalidCredentials: true,
                newPasswordsDontMatch: false
            });
        }
    };

    enteredCredentialsAreValid = (oldPassword, newPassword, repeatNewPassword) => {
        return oldPassword !== undefined &&
            oldPassword.length > 0 &&
            newPassword !== undefined &&
            newPassword.length > 0 &&
            repeatNewPassword !== undefined &&
            repeatNewPassword.length > 0 &&
            newPassword === repeatNewPassword;
    };

    render() {
        if (this.state.redirectToReferrer) {
            const {from} = this.props.location.state || {from: {pathname: '/'}};
            console.log('Password change complete. Redirecting to: ' + from.pathname);
            this.props.history.push(from);
        } else if (!this.props.location || !this.props.location.state || !this.props.location.state.changePasswordParameters) {
            console.log('Missing parameters. Redirecting to: /login');
            this.props.history.push({
                pathname: '/login'
            });
        }

        return (
            <div className="app flex-row align-items-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="9" lg="7" xl="6">
                            <Card className="mx-4">
                                <CardBody className="p-4">
                                    <Form>
                                        <h1>Change Password</h1>
                                        <p className="text-muted">{this.props.location.state.changePasswordParameters.userName},
                                            please
                                            change your password</p>

                                        <p>Please choose a secure password that complies with the following rules:</p>
                                        <ul>
                                            <li>Contains at least 12 characters</li>
                                            <li>Contains numbers and special characters</li>
                                            <li>Contains both uppercase characters and lowercase characters</li>
                                        </ul>

                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-lock"/>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="password" placeholder="Old Password"
                                                   autoComplete="old-password"
                                                   onChange={(event) => this.handleOldPasswordChange(event.target.value)}/>
                                        </InputGroup>
                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-lock"/>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="password" placeholder="New Password"
                                                   autoComplete="new-password"
                                                   onChange={(event) => this.handleNewPasswordChange(event.target.value)}/>
                                        </InputGroup>
                                        <InputGroup className="mb-4">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-lock"/>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="password" placeholder="Repeat new password"
                                                   autoComplete="new-password"
                                                   onChange={(event) => this.handleRepeatNewPasswordChange(event.target.value)}/>
                                        </InputGroup>
                                        {
                                            (this.state.submittedInvalidCredentials) &&
                                            (<div className="alert alert-danger" role="alert">
                                                Please verify that all fields are filled and valid.
                                            </div>)
                                        }
                                        {
                                            (this.state.newPasswordsDontMatch) &&
                                            (<div className="alert alert-danger" role="alert">
                                                New password and repeated new password don't match.
                                            </div>)
                                        }
                                        <Button color="success" block onClick={async () => {
                                            await this.submitPasswordChangeCredentials();
                                        }}>
                                            {
                                                (this.state.isChangingPassword) ?
                                                    (<div className="spinner-grow spinner-grow-sm" role="status">
                                                        <span className="sr-only">Loading...</span>
                                                    </div>)
                                                    :
                                                    ('Change Password')
                                            }
                                        </Button>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default ChangePassword;
